import { FactoryObject } from "../types/dash/Factory";
import EventBusFactory, { EventBus } from "./event/EventBus";
import { EventConstants } from "./event/EventConstants";
import FactoryMaker from "./FactoryMaker";
import URLLoaderFactory, { URLLoader } from "./net/URLLoader";
import DashParserFactory,{ DashParser } from "./parser/DashParser";
import StreamControllerFactory ,{ StreamController } from "./stream/StreamController";
import MediaPlayerBufferFactory,{ MediaPlayerBuffer } from "./vo/MediaPlayerBuffer";
import MediaPlayerControllerFactory, { MediaPlayerController } from "./vo/MediaPlayerController";
/**
 * @description 整个dash处理流程的入口类MediaPlayer,类似于项目的中转中心，用于接收任务并且将任务分配给不同的解析器去完成
 */
class MediaPlayer {
    private config: FactoryObject = {};
    private urlLoader: URLLoader;
    private eventBus: EventBus;
    private dashParser: DashParser;
    private streamController:StreamController;
    private mediaPlayerController:MediaPlayerController;
    private video: HTMLVideoElement;
    private buffer: MediaPlayerBuffer;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
        this.initializeEvent();
    }

    //初始化类
    setup() {
        this.urlLoader = URLLoaderFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        // ignoreRoot -> 忽略Document节点，从MPD开始作为根节点
        this.dashParser = DashParserFactory({ignoreRoot:true}).getInstance();
        this.streamController = StreamControllerFactory().create();
        
        this.buffer = MediaPlayerBufferFactory().getInstance();
    }

    initializeEvent() {
        this.eventBus.on(EventConstants.MANIFEST_LOADED,this.onManifestLoaded,this);
        this.eventBus.on(EventConstants.SEGEMTN_LOADED,this.onSegmentLoaded,this);;
    }

    resetEvent() {
        this.eventBus.off(EventConstants.MANIFEST_LOADED,this.onManifestLoaded,this);
        this.eventBus.off(EventConstants.SEGEMTN_LOADED,this.onSegmentLoaded,this);
    }

    //MPD文件请求成功获得对应的data数据
    onManifestLoaded(data:string) { 
        let manifest = this.dashParser.parse(data);

        this.eventBus.trigger(EventConstants.MANIFEST_PARSE_COMPLETED,manifest);
    }

    onSegmentLoaded(data:ArrayBuffer[]) {
        console.log("加载Segment成功");
        let videoBuffer = data[0];
        let audioBuffer = data[1];
        this.buffer.push({
            video:videoBuffer,
            audio:audioBuffer
        })
        this.eventBus.trigger(EventConstants.BUFFER_APPENDED);
    }

    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url 
     */
    public attachSource(url:string) {
        this.eventBus.trigger(EventConstants.SOURCE_ATTACHED,url);
        this.urlLoader.load({url,responseType:"text"},"Manifest");
    }

    public attachVideo(video:HTMLVideoElement) {
        this.video = video;
        this.mediaPlayerController = MediaPlayerControllerFactory({video:video}).create();
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayer);

export default factory;