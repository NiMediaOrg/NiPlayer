import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig, XHRConfig } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import HTTPRequest from "./HTTPRequest";
import XHRLoaderFactory,{XHRLoader} from "./XHRLoader";

class URLLoader {
    private config: FactoryObject = {};
    private xhrLoader:XHRLoader;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }
    private _loadManifest(config:XHRConfig) {
        this.xhrLoader.loadManifest(config);
    }

    setup() {
        this.xhrLoader = XHRLoaderFactory({}).getInstance();
    }
    // 每调用一次load函数就发送一次请求
    load(config: URLConfig) {
        //一个HTTPRequest对象才对应一个请求
        let request = new HTTPRequest(config);

        this._loadManifest({
            request: request,
            success: function(data) {
                request.getResponseTime = new Date().getTime();
                console.log(this , data);
            },
            error: function(error) {
                console.log(this , error)
            }
        })
    }
}

const factory = FactoryMaker.getSingleFactory(URLLoader);
export default factory;
export {URLLoader};