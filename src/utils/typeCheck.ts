import {
  AdaptationSet,
  BaseURL,
  Initialization,
  MediaType,
  Representation,
  SegmentBase,
  SegmentList,
  SegmentTemplate,
  SegmentURL,
  Mpd,
  Period,
} from "../types/dash/MpdFile";
import { BuiltInComponentID } from "../types/Player";

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

export function checkMpd(s: any): s is Mpd {
  if (s.tag === "MPD") return true;
  return false;
}

export function checkPeriod(s: any): s is Period {
  return s.tag === "Period";
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
export function checkRepresentation(s: any): s is Representation {
  return s.tag === "Representation";
}
/**
 * @description 类型守卫函数
 */
export function checkSegmentList(s: any): s is SegmentList {
  return s.tag === "SegmentList";
}

export function checkInitialization(s: any): s is Initialization {
  return s.tag === "Initialization";
}

export function checkSegmentURL(s: any): s is SegmentURL {
  return s.tag === "SegmentURL";
}

export function checkSegmentBase(s: any): s is SegmentBase {
  return s.tag === "SegmentBase";
}

export function checkBuiltInComponentID(s: any): s is BuiltInComponentID {
  return [
    "PlayButton",
    "Playrate",
    "Volume",
    "FullScreen",
    "DutaionShow",
    "SubSetting",
    "VideoShot",
    "ScreenShot",
    "PicInPic",
    "FullPage",
    "FullScreen",
  ].includes(s);
}
