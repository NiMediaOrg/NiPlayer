import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest } from "../../types/dash/Net";
declare class StreamController {
    private config;
    private baseURLParser;
    private baseURLPath;
    private URLUtils;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    generateBaseURLPath(Mpd: Mpd): void;
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest | void;
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<StreamController>;
export default factory;
export { StreamController };
