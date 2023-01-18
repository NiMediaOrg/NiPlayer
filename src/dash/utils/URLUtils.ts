import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";

class URLUtils {
    private config:FactoryObject;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
    }

    setup(){}

    resolve(...urls:string[]): string {
        let index = 0;
        let str = "";
        while(index < urls.length) {
            let url = urls[index];
            // 如果url不以/或者./,../这种形式开头的话
            if(/^(?!(\.|\/))/.test(url)) {
                if(str[str.length - 1] !== '/') {
                    str += '/';
                }
            } else if(/^\/.+/.test(url)) {
                // 如果url以/开头
                if(str[str.length - 1] === "/") {
                    url = url.slice(1);
                }
            } else if(/^(\.).+/.test(url)) {
                //TODO： 如果url以 ./,../,../../之类的形式开头
            }
            str += url;
            index ++;
        }
        return str;
    }

}

const factory = FactoryMaker.getSingleFactory(URLUtils);
export default factory;
export {URLUtils};