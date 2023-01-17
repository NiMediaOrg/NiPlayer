import { FactoryObject } from "../types/dash/Factory";
import FactoryMaker from "./FactoryMaker";
import URLLoaderFactory, {URLLoader} from "./net/URLLoader";
/**
 * @description 整个dash处理流程的入口类MediaPlayer
 */
class MediaPlayer {
    private config: FactoryObject = {};
    private urlLoader: URLLoader;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    //初始化类
    setup() {
        this.urlLoader = URLLoaderFactory().getInstance();
    }

    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url 
     */
    public attachSource(url:string) {
        this.urlLoader.load({url,responseType:"text"});
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayer);

export default factory;