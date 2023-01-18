import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest } from "../../types/dash/Net";
declare class StreamController {
    private config;
    private baseURLParser;
    private baseURLPath;
    private URLUtils;
    private eventBus;
    private urlLoader;
    private segmentRequestStruct;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initialEvent(): void;
    onManifestParseCompleted(mainifest: Mpd): void;
    generateBaseURLPath(Mpd: Mpd): void;
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest;
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest;
    loadSegment(videoURL: any, audioURL: any): Promise<void>;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<StreamController>;
export default factory;
export { StreamController };
