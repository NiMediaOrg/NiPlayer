import HTTPRequest from "../../mp4/net/HTTPRequest";

export type MoovBoxInfo = {
  duration?: number;
  timescale?: number;
  isFragmented?: boolean;
  isProgressive?: boolean;
  hasIOD?: boolean;
  created?: Date;
  modified?: Date;
  tracks?: MediaTrack[];
  [props: string]: any;
};

export type MediaTrack = {
  id: number;
  created?: Date;
  modified?: Date;
  volume?: number;
  track_width?: number;
  track_height?: number;
  timescale?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  language?: string;
  [props: string]: any;
};

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

export type ResponseType =
  | "arraybuffer"
  | "text"
  | "blob"
  | "document"
  | "json";
export type RequestMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "option";

export type XHRConfig = {
  request: HTTPRequest;
  success?: Function;
  abort?: Function;
  progress?: Function;
  error?: Function;
  load?: Function;
};

