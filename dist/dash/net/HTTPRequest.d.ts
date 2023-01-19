import { FactoryObject } from "../../types/dash/Factory";
import { RequestHeader, RequestMethod, ResponseType } from "../../types/dash/Net";
export default class HTTPRequest {
    sendRequestTime: number | null;
    getResponseTime: number | null;
    header: RequestHeader | null;
    method: RequestMethod | null;
    url: string;
    responseType: ResponseType | null;
    xhr?: XMLHttpRequest;
    constructor(config: FactoryObject);
}
