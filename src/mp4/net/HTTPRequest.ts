import { RequestHeader, RequestMethod } from "@/types/mp4";

export default class HTTPRequest {
    sendRequestTime: number | null;
    getResponseTime: number | null;
    header: RequestHeader | null;
    method: RequestMethod | null;
    url:string = "";
    responseType: ResponseType | null;
    xhr?:XMLHttpRequest;
    constructor(config: {[props:string]:any}){
        this.url = config.url;
        this.header = config.header;
        this.method = config.method;
        this.responseType = config.responseType || "arraybuffer";
        this.xhr = config.xhr;
    }
}