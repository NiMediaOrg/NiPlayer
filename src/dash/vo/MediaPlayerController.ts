import { FactoryObject } from "../../types/dash/Factory";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import FactoryMaker from "../FactoryMaker";
import MediaPlayerBufferFactory,{ MediaPlayerBuffer } from "../vo/MediaPlayerBuffer";
class MediaPlayerController {
    private config: FactoryObject = {};
    private video: HTMLVideoElement;
    private mediaSource: MediaSource;
    private videoSourceBuffer: SourceBuffer;
    private audioSourceBuffer: SourceBuffer;
    private buffer: MediaPlayerBuffer;
    private eventBus: EventBus;
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
    }

    initEvent() {
        this.eventBus.on(EventConstants.BUFFER_APPENDED,()=>{
            if(!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
                this.appendSource();
            }
        },this)
    }

    initPlayer() {
        this.video.src = window.URL.createObjectURL(this.mediaSource);
        this.video.pause();
        this.mediaSource.addEventListener("sourceopen",this.onSourceopen.bind(this));
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

    
    onSourceopen(e) {
        this.videoSourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E"');
        this.audioSourceBuffer = this.mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');

        this.videoSourceBuffer.addEventListener("updateend",this.onUpdateend.bind(this));
        this.audioSourceBuffer.addEventListener("updateend",this.onUpdateend.bind(this));
    }

    onUpdateend() {
        if(!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
            this.appendSource();
        }
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };