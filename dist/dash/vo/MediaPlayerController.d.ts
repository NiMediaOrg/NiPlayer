import { FactoryObject } from "../../types/dash/Factory";
import { VideoBuffers } from "../../types/dash/Stream";
declare class MediaPlayerController {
    private config;
    private video;
    private mediaSource;
    private videoSourceBuffer;
    private audioSourceBuffer;
    private buffer;
    private eventBus;
    private timeRangeUtils;
    private isFirstRequestCompleted;
    private mediaDuration;
    private currentStreamId;
    private Mpd;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initEvent(): void;
    initPlayer(): void;
    /**
     * @description 配置MediaSource的相关选项和属性
     */
    setMediaSource(): void;
    getVideoBuffered(video: HTMLVideoElement): VideoBuffers;
    appendSource(): void;
    appendVideoSource(data: ArrayBuffer): void;
    appendAudioSource(data: ArrayBuffer): void;
    /**
     * @description 当进度条发生跳转时触发
     * @param { EventTarget} e
     */
    onMediaSeeking(e: any): void;
    onSourceopen(e: any): void;
    onUpdateend(): void;
    onMediaPlaybackFinished(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<MediaPlayerController>;
export default factory;
export { MediaPlayerController };
