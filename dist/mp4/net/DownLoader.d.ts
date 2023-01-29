import HTTPRequest from "../../dash/net/HTTPRequest";
declare class DownLoader {
    isActive: boolean;
    realtime: boolean;
    chunkStart: number;
    chunkSize: number;
    totalLength: number;
    chunkTimeout: number;
    timeoutID: number;
    url: string;
    callback: Function;
    eof: boolean;
    constructor(url?: string);
    start(): this;
    reset(): this;
    stop(): this;
    resume(): this;
    setUrl(_url: string): this;
    setRealTime(_realtime: boolean): this;
    setChunkSize(_size: number): this;
    setChunkStart(_start: number): this;
    setInterval(_timeout: number): this;
    setCallback(_callback: Function): this;
    getFileLength(): number;
    isStopped(): boolean;
    initHttpRequest(): HTTPRequest;
    /**
    * @description 发送网络请求，请求对应的媒体文件
    * @returns
    */
    getFile(): void;
}
export { DownLoader };
