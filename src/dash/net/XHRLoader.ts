import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { XHRConfig } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";

class XHRLoader {
    private config:FactoryObject = {};
    
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup() {}

    load(config: XHRConfig) {
        let request = config.request;
        let xhr = new XMLHttpRequest();
        request.xhr = xhr;
        if(request.header) {
            for(let key in request.header) {
                xhr.setRequestHeader(key,request.header[key]);
            }
        }
        xhr.open(request.method || "get",request.url);
        xhr.responseType = request.responseType || "arraybuffer";
        xhr.onreadystatechange = (e) => {
            if(xhr.readyState === 4) {
                if((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 304)) {
                    config.success && config.success.call(xhr,xhr.response);
                } else {
                    config.error && config.error.call(xhr,e);
                }
            }
        }

        xhr.onabort = (e) => {
            config.abort && config.abort.call(xhr,e);
        }

        xhr.onerror = (e) => {
            config.error && config.error.call(xhr,e);
        }

        xhr.onprogress = (e) => {
            config.progress && config.progress.call(xhr,e);
        }

        xhr.send();
    }
}

const factory = FactoryMaker.getSingleFactory(XHRLoader);
export default factory;
export {XHRLoader}