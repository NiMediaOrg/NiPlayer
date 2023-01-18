import { FactoryObject } from "../../types/dash/Factory";
declare class MediaPlayerController {
    private config;
    private video;
    private mediaSource;
    private videoSourceBuffer;
    private audioSourceBuffer;
    private buffer;
    private eventBus;
    private isFirstRequestCompleted;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initEvent(): void;
    initPlayer(): void;
    appendSource(): void;
    appendVideoSource(data: ArrayBuffer): void;
    appendAudioSource(data: ArrayBuffer): void;
    onSourceopen(e: any): void;
    onUpdateend(): void;
    onMediaPlaybackFinished(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<MediaPlayerController>;
export default factory;
export { MediaPlayerController };
