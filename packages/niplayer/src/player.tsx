import type { IPanelItem } from 'niplayer-components'
import { EventEmitter3 } from './base/event-emitter3'
import { defaultConfig } from './shared/default-config'
import { RootStore } from './store/root.store'
import { PlayerConfig } from './types'
import { NI_PLAYER_EVENT } from './shared/events'
import { render } from 'solid-js/web'
import { createEffect } from 'solid-js'
import { PlayButton } from './plugin/play-button'
import { TimeLabel } from './plugin/time-label'
import { FullScreen } from './plugin/ctrl-fullscreen'
import { PipInPip } from './plugin/pip-in-pip'
import { Volume } from './plugin/volume'
import { Progress } from './plugin/progress'
import { Setting } from './plugin/setting'
import { PlayWaiting } from './plugin/play-waiting'
import { PlaybackRate } from './plugin/playback-rate'
import { PlayQuality } from './plugin/play-quality'
import { ImageShot } from './plugin/video-shot'
import { PlayAgent } from './plugin/play-agent'
import { Subtitle } from './plugin/subtitle'
import { PauseCenter } from './plugin/pause-center'

/**
 * @desc 声明插件的类型
 */
interface Plugin {
    new(player: NiPlayer): void
}
/**
 * @desc 播放器的入口文件
 */
export default class NiPlayer extends EventEmitter3 {
    static Event: typeof NI_PLAYER_EVENT = NI_PLAYER_EVENT
    public config: PlayerConfig
    public rootStore: RootStore

    public nodes: {
        container: HTMLDivElement
        videoArea: HTMLDivElement
        videoLayer: HTMLDivElement
        videoElement: HTMLVideoElement
        controllerBar: HTMLDivElement
        controllerBarTop: HTMLDivElement
        controllerBarMiddle: HTMLDivElement
        controllerBarBottom: HTMLDivElement
        controllerBarMiddleLeft: HTMLDivElement
        controllerBarMiddleMiddle: HTMLDivElement
        controllerBarMiddleRight: HTMLDivElement
        topArea: HTMLDivElement
        topAreaLeft: HTMLDivElement
        topAreaMiddle: HTMLDivElement
        topAreaRight: HTMLDivElement
    } = {
            container: null,
            videoArea: null,
            videoElement: null,
            videoLayer: null,
            controllerBar: null,
            controllerBarTop: null,
            controllerBarMiddle: null,
            controllerBarBottom: null,
            controllerBarMiddleLeft: null,
            controllerBarMiddleMiddle: null,
            controllerBarMiddleRight: null,
            topArea: null,
            topAreaLeft: null,
            topAreaMiddle: null,
            topAreaRight: null,
        }

    private disposeCallback: () => void

    private plugins: Plugin[] = [
        PauseCenter,
        PlayAgent,
        PlayWaiting,
        Progress,
        PlayButton,
        Volume,
        TimeLabel,
        ImageShot,
        Setting,
        PipInPip,
        FullScreen,
        PlayQuality,
        PlaybackRate,
        Subtitle,
    ]

    constructor(options?: PlayerConfig) {
        super()
        this.config = Object.assign(defaultConfig, options)
        this.rootStore = new RootStore(this)
        this.renderPlugin()
        this.renderTemplate()
    }

    /**
     * @desc 初始化内置插件
     */
    private renderPlugin() {
        this.plugins.forEach((P) => {
            new P(this)
        })
    }
    /**
     * @desc 构造播放器的整体DOM模板并且绑定相关事件
     */
    private renderTemplate(): void {
        const handleClick = () => {
            if (this.rootStore.mediaStore.state.paused) {
                this.play()
            } else {
                this.pause()
            }
        }

        const handleDoubleClick = () => {
            if (this.rootStore.mediaStore.state.isEnterFullscreen) {
                this.exitFullScreen()
            } else {
                this.requestFullScreen()
            }
        }

        const App = () => (
            <div class="niplayer-container" ref={this.nodes.container}>
                <div
                    class="niplayer-video-area"
                    ref={this.nodes.videoArea}
                    onClick={handleClick}
                    onDblClick={handleDoubleClick}
                >
                    {this.config.proxy ? (
                        ''
                    ) : (
                        <video
                            ref={this.nodes.videoElement}
                            autoplay
                            muted
                            crossOrigin="anonymous"
                        ></video>
                    )}
                </div>
                <div
                    class="niplayer-video-layer"
                    ref={this.nodes.videoLayer}
                ></div>
                <div
                    classList={{
                        'niplayer-top-area': true,
                        hidden: this.rootStore.actionStore.state.isTopBarHidden,
                    }}
                    ref={this.nodes.topArea}
                >
                    <div
                        class="niplayer-top-area-left"
                        ref={this.nodes.topAreaLeft}
                    >
                        {this.config.title || ''}
                    </div>
                    <div
                        class="niplayer-top-area-middle"
                        ref={this.nodes.topAreaMiddle}
                    ></div>
                    <div
                        class="niplayer-top-area-right"
                        ref={this.nodes.topAreaRight}
                    ></div>
                </div>
                <div
                    classList={{
                        'niplayer-controller-area': true,
                        hidden: this.rootStore.actionStore.state
                            .isControllerBarHidden,
                    }}
                    ref={this.nodes.controllerBar}
                >
                    <div
                        class="niplayer-controller-area-top"
                        ref={this.nodes.controllerBarTop}
                    ></div>
                    <div
                        class="niplayer-controller-area-middle"
                        ref={this.nodes.controllerBarMiddle}
                    >
                        <div
                            class="niplayer-controller-area-middle-left"
                            ref={this.nodes.controllerBarMiddleLeft}
                        ></div>
                        <div
                            class="niplayer-controller-area-middle-middle"
                            ref={this.nodes.controllerBarMiddleMiddle}
                        ></div>
                        <div
                            class="niplayer-controller-area-middle-right"
                            ref={this.nodes.controllerBarMiddleRight}
                        ></div>
                    </div>
                    <div
                        class="niplayer-controller-area-bottom"
                        ref={this.nodes.controllerBarBottom}
                    ></div>
                </div>
            </div>
        )

        if (this.config.proxy) this.nodes.videoElement = this.config.proxy()
        this.disposeCallback = render(() => <App />, this.config.container)

        this.emit(NI_PLAYER_EVENT.MOUNTED)
    }
    /**
     * @desc 注册插件
     */
    public registerPlugin(plugin: Plugin) {
        new plugin(this)
    }
    /**
     * @desc 注册设置项
     */
    public registerSettingItem(item: IPanelItem) {
        this.rootStore.settingStore.registerPanelItem(item)
    }
    /**
     * @desc 注册并且订阅播放器内部的state
     * @param getter
     */
    public useState<T>(
        getter: () => T,
        callback: (newVal: T) => void,
        options?: { fireImmediately?: boolean }
    ) {
        let isFirst = true
        createEffect(() => {
            const val = getter()
            if (options?.fireImmediately && isFirst) {
                callback(val)
            } else if (!isFirst) {
                callback(val)
            }

            isFirst = false
        })
    }
    /**
     * @desc 注册一个副作用函数, 可以自动进行依赖收集和依赖触发
     * @param handle
     */
    public useEffect(handle: () => void) {
        createEffect(handle)
    }
    /**
     * @desc 开始播放
     * @returns {Promise<any>}
     */
    public play(): Promise<any> {
        return this.nodes.videoElement.play()
    }
    /**
     * @desc 暂停播放
     * @returns {void}
     */
    public pause(): void {
        this.nodes.videoElement.pause()
    }

    public seek(time: number): Promise<number> {
        return new Promise((res, rej) => {
            this.nodes.videoElement.currentTime = Math.max(
                0,
                Math.min(time, this.nodes.videoElement.duration)
            )
            this.play()
            const onSeeked = () => {
                res(time)
                this.off(NI_PLAYER_EVENT.VIDEO_SEEKED, onSeeked)
            }
            this.on(NI_PLAYER_EVENT.VIDEO_SEEKED, onSeeked)
        })
    }
    /**
     * @desc 播放器进入全屏模式
     */
    public requestFullScreen(): Promise<void> {
        return this.config.container.requestFullscreen()
    }
    /**
     * @desc 播放器退出全屏模式
     */
    public exitFullScreen(): Promise<void> {
        return (
            document.fullscreenElement &&
            document.fullscreenEnabled &&
            document.exitFullscreen()
        )
    }
    /**
     * @description 播放器进入画中画模式
     */
    public requestPipInPip(): Promise<PictureInPictureWindow> {
        return this.nodes.videoElement.requestPictureInPicture()
    }
    /**
     * @description 播放器退出画中画模式
     */
    public exitPipInPip(): Promise<void> {
        return document.exitPictureInPicture()
    }
    /**
     * @description 设置音量
     */
    public setVolume(val: number) {
        this.nodes.videoElement.volume = val
    }
    /**
     * @description 设置倍速
     */
    public setPlaybackRate(val: number) {
        this.nodes.videoElement.playbackRate = val
    }
    /**
     * @description 播放器销毁
     */
    public dispose() {
        this.disposeCallback?.()
        this.nodes = null
        this.plugins = null
    }
}
