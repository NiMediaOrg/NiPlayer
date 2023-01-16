import {
  AdaptationSet,
  BaseURL,
  Initialization,
  MediaType,
  Representation,
  SegmentBase,
  SegmentList,
  SegmentTemplate,
  SegmentURL
} from "../types/dash/MpdFile";

/**
 * @description 类型守卫函数
 */
export function checkMediaType(s: any): s is MediaType {
  if (!s) return true;
  return (
    s === "video/mp4" ||
    s === "audio/mp4" ||
    s === "text/html" ||
    s === "text/xml" ||
    s === "text/plain" ||
    s === "image/png" ||
    s === "image/jpeg"
  );
}
/**
 * @description 类型守卫函数
 */
export function checkBaseURL(s: any): s is BaseURL {
  if (s.tag === "BaseURL" && typeof s.url === "string") return true;
  return false;
}
/**
 * @description 类型守卫函数
 */
export function checkAdaptationSet(s: any): s is AdaptationSet {
  if (s.tag === "AdaptationSet") return true;
  return false;
}
/**
 * @description 类型守卫函数
 */
export function checkSegmentTemplate(s: any): s is SegmentTemplate {
  return s.tag === "SegmentTemplate";
}
/**
 * @description 类型守卫函数
 */
export function checkRepresentation(s:any): s is Representation {
  return s.tag === "Representation";
}
/**
 * @description 类型守卫函数
 */
export function checkSegmentList(s:any):s is SegmentList {
  return s.tag === "SegmentList";
}
 
export function checkInitialization(s:any):s is Initialization {
  return s.tag === "Initialization"
}

export function checkSegmentURL(s:any):s is SegmentURL {
  return s.tag === "SegmentURL";
}

export function checkSegmentBase(s:any):s is SegmentBase {
  return s.tag === "SegmentBase";
}

export let checkUtils = {
  checkMediaType,
  checkBaseURL,
  checkAdaptationSet,
  checkSegmentTemplate,
  checkRepresentation,
  checkSegmentList,
  checkInitialization,
  checkSegmentURL,
  checkSegmentBase
}

export function findSpecificType(array:Array<unknown>,type:string): boolean {
  array.forEach(item=>{
    if(checkUtils[`check${type}`] && checkUtils[`check${type}`].call(this,item)) {
      return true;
    }
  })
  return false;
}