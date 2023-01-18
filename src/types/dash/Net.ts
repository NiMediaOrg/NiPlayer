import HTTPRequest from "../../dash/net/HTTPRequest";

export type ResponseType = "arraybuffer" | "text" | "blob" | "document" | "json";
export type RequestMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "option";
export type RequestType = "Manifest" | "Segment";


export type ContentType =
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "application/json"
  | "text/xml";

export type RequestHeader = {
    "Content-Type"?: ContentType;
    Range?: string;
    Authroization?: string;
};

export type RequestData = XMLHttpRequestBodyInit;

export type XHRConfig = {
  request: HTTPRequest;
  success?: Function;
  abort?: Function;
  progress?: Function;
  error?:Function;
}

export type URLConfig = {
  url:string;
  method?:RequestMethod;
  header?:RequestHeader;
  responseType?: ResponseType;
}

/**
 * @description 用于请求某一个资源的一部分,范围请求
 */
export type RangeRequest = {
  type: "range";
  url: string;
  range?: string;
}
/**
 * @description 请求整个媒体段
 */
export type SegmentRequest = {
  type:"segement";
  url:string;
}

export type AdaptationSetVideoSegmentRequest = {
  "320*180"?: Array<SegmentRequest | RangeRequest>;
  "512*288"?: Array<SegmentRequest | RangeRequest>;
  "640*360"?: Array<SegmentRequest | RangeRequest>;
  "768*432"?: Array<SegmentRequest | RangeRequest>;
  "1024*576"?: Array<SegmentRequest | RangeRequest>;
  "1280*720"?: Array<SegmentRequest | RangeRequest>;
  "1920*1080"?: Array<SegmentRequest | RangeRequest>;
}

export type AdaptationSetAudioSegmentRequest = {
  [props:string]: Array<SegmentRequest | RangeRequest>;
}

export type PeriodSegmentRequest = {
  VideoSegmentRequest:Array<{
    type:string;
    video:AdaptationSetAudioSegmentRequest
  }>;
  AudioSegmentRequest:Array<{
    lang: string;
    audio:AdaptationSetVideoSegmentRequest
  }>
}

export type MpdSegmentRequest = {
  type: "MpdSegmentRequest";
  request?: Array<PeriodSegmentRequest>;
}