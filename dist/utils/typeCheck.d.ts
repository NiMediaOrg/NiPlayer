import { AdaptationSet, BaseURL, Initialization, MediaType, Representation, SegmentBase, SegmentList, SegmentTemplate, SegmentURL, Mpd, Period } from "../types/dash/MpdFile";
/**
 * @description 类型守卫函数
 */
export declare function checkMediaType(s: any): s is MediaType;
export declare function checkMpd(s: any): s is Mpd;
export declare function checkPeriod(s: any): s is Period;
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
