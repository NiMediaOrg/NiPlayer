import NiPlayer from '@/player'
import mp4box, {
    MP4ArrayBuffer,
    MP4File,
    MP4SourceBuffer,
    MP4Track,
} from 'mp4box'
import { PlayerConfig } from '@/types'

export class Mp4StreamAgent {
    private readonly mp4boxFile: MP4File
    private readonly videoProxy: HTMLVideoElement

    private config: PlayerConfig
    /**
     * @desc 视频的总大小，单位为字节
     */
    private totalSize: number = 0
    /**
     * @desc 设置加载分片的起始位置，单位为字节
     */
    private chunkStart: number = 0
    /**
     * @desc 设置加载分片的大小，单位为字节
     */
    private chunkSize: number = 1024 * 1024
    /**
     * @desc 设置加载分片的间隔，单位为毫秒
     */
    private loadGap: number = 500
    /**
     * @desc 定时器
     */
    private timer: number = -1

    private mediaSource: MediaSource
    private pendingInits: number = 0

    private pendingMap: Map<
        string | number,
        {
            sourceBuffer: SourceBuffer
            pendingSegments: {
                id: number
                user: MP4SourceBuffer
                buffer: MP4ArrayBuffer
                sampleNum: number
                is_last: boolean
            }[]
        }
    > = new Map()

    constructor(private player: NiPlayer) {
        this.videoProxy = this.player.nodes.videoElement
        this.config = this.player.config
        this.mp4boxFile = mp4box.createFile()
        this.init()
        this.addEvents()
    }

    private init() {
        console.log('[Agent Init] mp4-stream agent init', this.mp4boxFile)

        this.mediaSource = new MediaSource()
        this.videoProxy.src = window.URL.createObjectURL(this.mediaSource)

        this.mediaSource.addEventListener('sourceopen', (e) => {
            console.log('[Agent Event] sourceopen')
            this.load()
        })
    }

    private addEvents() {
        this.mp4boxFile.onMoovStart = () => {
            console.log('[Agent Event] onMoovStart')
        }

        this.mp4boxFile.onReady = (info) => {
            console.log('[Agent Event] onReady', info)
            this.stop()
            //* 如果是fmp4类型的视频,则最后视频总时长的计算方式是使用fragment_duration，否则使用duration */
            if (info.isFragmented) {
                this.mediaSource.duration = info.fragment_duration / info.timescale
            } else {
                this.mediaSource.duration = info.duration / info.timescale
            }
            info.tracks.forEach((track) => {
                const codec = track.codec
                // mime指定对应媒体的编解码方式/规范
                const mime = 'video/mp4; codecs="' + codec + '"'

                if (MediaSource.isTypeSupported(mime)) {
                    console.log(
                        '[Agent SourceBuffer Init]',
                        'MSE - SourceBuffer #' + track.id,
                        "Creation with type '" + mime + "'"
                    )
                    // 根据moov box中解析出来的track去一一创建对应的sourcebuffer
                    const sourceBuffer = this.mediaSource.addSourceBuffer(mime)
                    sourceBuffer.addEventListener('error', (e) => {
                        console.error(
                            'MSE SourceBuffer Init Error #' + track.id,
                            track
                        )
                    })
                    this.pendingMap.set(track.id, {
                        sourceBuffer,
                        pendingSegments: [],
                    })
                    this.mp4boxFile.setSegmentOptions(track.id, sourceBuffer, {
                        nbSamples:
                            this.config.streamPlayOptions?.samples || 100,
                    })
                } else {
                    throw new Error('当前浏览器不支持' + mime + '媒体类型')
                }
            })

            const initSegments = this.mp4boxFile.initializeSegmentation()
            initSegments.forEach((initSegment) => {
                console.log(initSegment)
                this.pendingInits++
                initSegment.user.appendBuffer(initSegment.buffer)
                initSegment.user.onupdateend = () => {
                    this.pendingInits--
                    initSegment.user.onupdateend = null
                    // 初始化分片都添加成功后，执行后续的操作
                    if (this.pendingInits === 0) {
                        for (let [key, value] of this.pendingMap.entries()) {
                            const { sourceBuffer } = value
                            sourceBuffer.addEventListener('updateend', () => {
                                this.onUpdateEnd.call(this, key)
                            })
                        }
                        this.mp4boxFile.start()
                        this.start()
                    }
                }
            })
        }

        this.mp4boxFile.onSegment = (
            id: number,
            user: MP4SourceBuffer,
            buffer: MP4ArrayBuffer,
            sampleNum: number,
            is_last: boolean
        ) => {
            this.pendingMap.get(id)?.pendingSegments.push({
                id,
                user,
                buffer,
                sampleNum,
                is_last,
            })

            this.onUpdateEnd(id)
        }
    }

    private onUpdateEnd(id: number) {
        const user = this.pendingMap.get(id).sourceBuffer
        if (
            this.mediaSource.readyState === 'open' &&
            user.updating === false &&
            this.pendingInits === 0
        ) {
            const seg = this.pendingMap.get(id)?.pendingSegments.shift()
            if (!seg) return
            user.appendBuffer(seg.buffer)
            // 在此处释放不需要用到的sample
            this.mp4boxFile.releaseUsedSamples(id, seg.sampleNum)
        }
    }

    stop() {
        window.clearTimeout(this.timer)
    }

    start() {
        this.timer = window.setTimeout(() => this.load(), this.loadGap)
    }

    resume() {
        this.stop()
        this.chunkStart = 0
        this.totalSize = 0
    }

    load() {
        console.log('[Agent Event] load video buffer')
        this.loadVideo().then(({ data, eof }) => {
            data.fileStart = this.chunkStart
            const nextStart = this.mp4boxFile.appendBuffer(data, eof)
            this.chunkStart = nextStart
            if (eof) {
                this.mp4boxFile.flush()
                return
            }
            this.timer = window.setTimeout(() => {
                this.load()
            }, this.loadGap)
        })
    }

    loadVideo(): Promise<{
        data: ArrayBuffer & { fileStart: number }
        eof: boolean
    }> {
        const url = this.player.config.url
        return new Promise((res, rej) => {
            if (!('fetch' in window)) {
                rej(new Error('fetch is not supported'))
            }
            let eof = false
            fetch(url, {
                method: 'GET',
                headers: {
                    Range: `bytes=${this.chunkStart}-${
                        this.chunkSize + this.chunkStart - 1
                    }`,
                },
            })
                .then((response) => {
                    const contentRange = response.headers.get('Content-Range')
                    if (contentRange) {
                        this.totalSize = +contentRange.split('/')[1]
                    }
                    return response.arrayBuffer()
                })
                .then((buffer) => {
                    if (
                        buffer.byteLength !== this.chunkSize ||
                        this.totalSize === buffer.byteLength
                    ) {
                        eof = true
                    }
                    const data: (ArrayBuffer & { fileStart: number }) = buffer as (ArrayBuffer & { fileStart: number });
                    res({
                        data: data,
                        eof: eof,
                    })
                })
        })
    }
}
