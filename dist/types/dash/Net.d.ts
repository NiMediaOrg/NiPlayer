import HTTPRequest from "../../dash/net/HTTPRequest";
export type ResponseType = "arraybuffer" | "text" | "blob" | "document" | "json";
export type RequestMethod = "get" | "post" | "put" | "delete" | "patch" | "option";
export type ContentType = "application/x-www-form-urlencoded" | "multipart/form-data" | "application/json" | "text/xml";
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
    error?: Function;
};
export type URLConfig = {
    url: string;
    method?: RequestMethod;
    header?: RequestHeader;
    responseType?: ResponseType;
};
