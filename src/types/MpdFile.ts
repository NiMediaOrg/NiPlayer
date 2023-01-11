/**
 * @description MIME类型
 */
export type MediaType =
  | "video/mp4"
  | "audio/mp4"
  | "text/html"
  | "text/xml"
  | "text/plain"
  | "image/png"
  | "image/jpeg";
/**
 * @description mediaPresentationDuration表示媒体文件的总时长
 */
export type Mpd = {
  tag: "MPD";
  type: "static" | "dynamic";
  children: Array<Period>;
  availabilityStartTime: string | null;
  mediaPresentationDuration: string | null;
  minBufferTime: string | null;
  minimumUpdatePeriod: string | null;
};

export type Period = {
  tag: "Period";
  id: string | null;
  duration: string | null;
  start: string | null;
  children: Array<AdaptationSet>;
};

export type BaseURL = {
  tag: "BaseURL";
  url: string;
};
/**
 * @description startWithSAP:每个Segment的第startWithSAP帧都是关键帧
 */
export type AdaptationSet = {
  tag: "AdaptationSet";
  children: Array<SegmentTemplate | Representation>;
  segmentAlignment: boolean | null;
  mimeType: MediaType | null;
  startWithSAP: number | null;
};
/**
 * @description 用于描述对应的Representation下需要加载的initialSegment和mediaSegment的地址，具体的格式为:
 * @description initialization="$RepresentationID$-Header.m4s" media="$RepresentationID$-270146-i-$Number$.m4s"
 */
export type SegmentTemplate = {
  tag: "SegmentTemplate";
  initialization: string | null;
  media: string | null;
};
/**
 * @description width * height --> 视频的分辨率
 */
export type Representation = {
  tag: "Representation";
  bandWidth: number;
  codecs: string;
  id: string;
  width: number;
  height: number;
  mimeType: MediaType | null;
  children?: Array<BaseURL | SegmentBase | SegmentList>;
  
};

export type SegmentBase = {
  tag: "SegmentBase";
  indexRange: string;
  child: Initialization;
};

export type Initialization = {
  tag: "Initialization";
  range?: string | null;
  sourceURL?: string | null;
};

export type SegmentList = {
    tag: "SegmentList";
    duration: number | null;
    children: Array<Initialization | SegmentURL>;
}

export type SegmentURL = {
    tag: "SegmentURL";
    media: string;
}

export type MpdFile = {
    tag: "File";
    root: Mpd;
};
