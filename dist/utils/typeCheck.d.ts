import { AdaptationSet, BaseURL, Initialization, MediaType, Representation, SegmentBase, SegmentList, SegmentTemplate, SegmentURL } from "../types/dash/MpdFile";
/**
 * @description 类型守卫函数
 */
export declare function checkMediaType(s: any): s is MediaType;
/**
 * @description 类型守卫函数
 */
export declare function checkBaseURL(s: any): s is BaseURL;
/**
 * @description 类型守卫函数
 */
export declare function checkAdaptationSet(s: any): s is AdaptationSet;
/**
 * @description 类型守卫函数
 */
export declare function checkSegmentTemplate(s: any): s is SegmentTemplate;
/**
 * @description 类型守卫函数
 */
export declare function checkRepresentation(s: any): s is Representation;
/**
 * @description 类型守卫函数
 */
export declare function checkSegmentList(s: any): s is SegmentList;
export declare function checkInitialization(s: any): s is Initialization;
export declare function checkSegmentURL(s: any): s is SegmentURL;
export declare function checkSegmentBase(s: any): s is SegmentBase;
export declare let checkUtils: {
    checkMediaType: typeof checkMediaType;
    checkBaseURL: typeof checkBaseURL;
    checkAdaptationSet: typeof checkAdaptationSet;
    checkSegmentTemplate: typeof checkSegmentTemplate;
    checkRepresentation: typeof checkRepresentation;
    checkSegmentList: typeof checkSegmentList;
    checkInitialization: typeof checkInitialization;
    checkSegmentURL: typeof checkSegmentURL;
    checkSegmentBase: typeof checkSegmentBase;
};
export declare function findSpecificType(array: Array<unknown>, type: string): boolean;
