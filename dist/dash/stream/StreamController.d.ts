import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest } from "../../types/dash/Net";
import { VideoBuffers } from "../../types/dash/Stream";
declare class StreamController {
    private config;
    private baseURLParser;
    private baseURLPath;
    private URLUtils;
    private eventBus;
    private urlLoader;
    private timeRangeUtils;
    private videoResolvePower;
    private audioResolvePower;
    private mediaId;
    private streamId;
    private firstRequestNumber;
    private segmentRequestStruct;
    private Mpd;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initialEvent(): void;
    onManifestParseCompleted(mainifest: Mpd): void;
    generateBaseURLPath(Mpd: Mpd): void;
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest;
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest;
    getNumberOfMediaSegmentForPeriod(streamId: number): number;
    startStream(Mpd: Mpd): Promise<void>;
    /**
     * @description 只有在触发seek事件后才会触发此方法
     * @param tuple
     */
    onSegmentRequest(tuple: [number, number]): Promise<void>;
    onSegmentConsumed(range: VideoBuffers): Promise<void>;
    loadInitialSegment(streamId: any): Promise<[any, any]>;
    loadMediaSegment(): Promise<[any, any]>;
    loadSegment(videoURL: any, audioURL: any): Promise<[any, any]>;
    abortAllXHR(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<StreamController>;
export default factory;
export { StreamController };
