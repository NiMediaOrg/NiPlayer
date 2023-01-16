import { AdaptationSet, MediaType, MediaVideoResolve, PeriodRequest, RangeRequest, Representation, SegmentRequest } from "../types/dash/MpdFile";
export declare function parseMpd(mpd: Document, BASE_URL?: string): {
    mpdRequest: PeriodRequest[];
    type: "static" | "dynamic";
    mediaPresentationDuration: number;
    maxSegmentDuration: number;
};
export declare function parseAdaptationSet(adaptationSet: AdaptationSet, path: string, sumSegment: number | null, type: MediaType): Object;
export declare function parseRepresentation(representation: Representation, hasTemplate: boolean, path: string, sumSegment: number | null, type: MediaType, initializationSegment?: [Function, string[]], mediaSegment?: [Function, string[]]): MediaVideoResolve;
/**
 * @description 应对Representation外部具有SegmentTemplate的结构这种情况
 */
export declare function parseRepresentationWithSegmentTemplateOuter(representation: Representation, path: string, sumSegment: number | null, initializationSegment: [Function, string[]], mediaSegment: [Function, string[]]): Array<RangeRequest | SegmentRequest>;
/**
 * @description 应对Representation内部具有(BaseURL)+SegmentList的结构这种情况
 */
export declare function parseRepresentationWithSegmentList(representation: Representation, path: string): Array<RangeRequest | SegmentRequest>;
/**
 * @description 应对Representation内部具有(BaseURL)+SegmentBase的结构这种情况
 */
export declare function parseRepresentationWithSegmentBase(representation: Representation, path: string): Array<RangeRequest | SegmentRequest>;
/**
 * @description 生成模板函数和占位符
 */
export declare function generateTemplateTuple(s: string): [(...args: string[]) => string, string[]];
