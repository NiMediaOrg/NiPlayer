import { FactoryObject } from "../types/dash/Factory";
import EventBusFactory, { EventBus } from "./event/EventBus";
import { EventConstants } from "./event/EventConstants";
import FactoryMaker from "./FactoryMaker";
import URLLoaderFactory, { URLLoader } from "./net/URLLoader";
import DashParserFactory,{ DashParser } from "./parser/DashParser";
/**
 * @description 整个dash处理流程的入口类MediaPlayer
 */
class MediaPlayer {
    private config: FactoryObject = {};
    private urlLoader: URLLoader;
    private eventBus: EventBus;
    private dashParser: DashParser
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
        this.initializeEvent();
    }

    //初始化类
    setup() {
        this.urlLoader = URLLoaderFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        this.dashParser = DashParserFactory({ignoreRoot:true}).getInstance();
    }

    initializeEvent() {
        this.eventBus.on(EventConstants.MANIFEST_LOADED,this.onManifestLoaded,this);
    }

    resetEvent() {
        this.eventBus.off(EventConstants.MANIFEST_LOADED,this.onManifestLoaded,this);
    }

    onManifestLoaded(data:string) { 
        let manifest = this.dashParser.parse(data);
        console.log(manifest);
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