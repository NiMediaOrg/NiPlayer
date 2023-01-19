import { FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import { PlayerBuffer } from "../../types/dash/Net";
import { VideoBuffers } from "../../types/dash/Stream";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import FactoryMaker from "../FactoryMaker";
import TimeRangeUtilsFactory, { TimeRangeUtils } from "../utils/TimeRangeUtils";
import MediaPlayerBufferFactory,{ MediaPlayerBuffer } from "../vo/MediaPlayerBuffer";
class MediaPlayerController {
    // 控制器
    private config: FactoryObject = {};
    private video: HTMLVideoElement;
    private mediaSource: MediaSource;
    private videoSourceBuffer: SourceBuffer;
    private audioSourceBuffer: SourceBuffer;
    private buffer: MediaPlayerBuffer;
    private eventBus: EventBus;
    private timeRangeUtils: TimeRangeUtils;
    // 属性
    private isFirstRequestCompleted:boolean = false;
    private mediaDuration:number = 0;
    private currentStreamId: number = 0;
    private Mpd: Mpd;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        if(this.config.video) {
            this.video = this.config.video;
        }
        this.setup();
        this.initEvent(); 
        this.initPlayer();   
    }
    setup(){
        this.mediaSource = new MediaSource();
       
        this.buffer = MediaPlayerBufferFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        this.timeRangeUtils = TimeRangeUtilsFactory().getInstance();
    }

    initEvent() {
        this.eventBus.on(EventConstants.BUFFER_APPENDED,(id:number)=>{
            if(!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
                console.log("append")
                this.appendSource();
                this.currentStreamId = id;
            }
        },this)

        this.eventBus.on(EventConstants.FIRST_REQUEST_COMPLETED,()=>{
            this.isFirstRequestCompleted = true;
        },this)

        this.eventBus.on(EventConstants.MEDIA_PLAYBACK_FINISHED,this.onMediaPlaybackFinished,this)
        
        this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED,(manifest,duration,Mpd)=>{
            this.mediaDuration = duration;
            this.Mpd = Mpd;
            if(this.mediaSource.readyState === "open") {
                this.setMediaSource();
            }
        },this)
    }

    initPlayer() {
        this.video.src = window.URL.createObjectURL(this.mediaSource);
        this.mediaSource.addEventListener("sourceopen",this.onSourceopen.bind(this));
        this.video.addEventListener("seeking",this.onMediaSeeking.bind(this));
    }

    /**
     * @description 配置MediaSource的相关选项和属性
     */
    setMediaSource() {
        this.mediaSource.duration = this.mediaDuration;
        this.mediaSource.setLiveSeekableRange(0,this.mediaDuration);
    }

    getVideoBuffered(video:HTMLVideoElement): VideoBuffers {
        let buffer = this.video.buffered;
        let res:VideoBuffers = [];
        for(let i = 0;i < buffer.length;i++) {
            let start = buffer.start(i);
            let end = buffer.end(i);
            res.push({start,end})
        }
        return res;
    }

    appendSource() {
        let data = this.buffer.top();
        if(data) {
            this.buffer.delete(data);
            this.appendVideoSource(data.video);
            this.appendAudioSource(data.audio);
        }
    }

    appendVideoSource(data:ArrayBuffer) {
        this.videoSourceBuffer.appendBuffer(new Uint8Array(data));
    }

    appendAudioSource(data:ArrayBuffer) {
        this.audioSourceBuffer.appendBuffer(new Uint8Array(data));
    }

    /**
     * @description 当进度条发生跳转时触发
     * @param { EventTarget} e 
     */
    onMediaSeeking(e) {
        let currentTime = this.video.currentTime;
        let [streamId,mediaId] = this.timeRangeUtils.
            getSegmentAndStreamIndexByTime(this.currentStreamId,currentTime,this.Mpd);

        let ranges = this.getVideoBuffered(this.video);
        if(!this.timeRangeUtils.inVideoBuffered(currentTime,ranges)) {
            console.log("超出缓存范围")
            this.buffer.clear();
            this.eventBus.trigger(EventConstants.SEGEMTN_REQUEST,[streamId,mediaId]);
        } else {
            console.log("在缓存范围之内")
        }
    }
    
    onSourceopen(e) {

        this.videoSourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E"');
        this.audioSourceBuffer = this.mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');

        this.videoSourceBuffer.addEventListener("updateend",this.onUpdateend.bind(this));
        this.audioSourceBuffer.addEventListener("updateend",this.onUpdateend.bind(this));
    }

    onUpdateend() {
        if(!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
            if(this.isFirstRequestCompleted) {
                let ranges = this.getVideoBuffered(this.video);
                this.eventBus.trigger(EventConstants.SEGMENT_CONSUMED,ranges);
            }
            this.appendSource();
        }
    }

    onMediaPlaybackFinished() {
        // this.mediaSource.endOfStream();
        window.URL.revokeObjectURL(this.video.src);
        console.log("播放流加载结束")
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };