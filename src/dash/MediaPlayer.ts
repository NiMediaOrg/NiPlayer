import { FactoryObject } from "../types/dash/Factory";
import { Mpd } from "../types/dash/MpdFile";
import { ConsumedSegment } from "../types/dash/Stream";
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
    // 控制器
    private urlLoader: URLLoader;
    private eventBus: EventBus;
    private dashParser: DashParser;
    private streamController:StreamController;
    private mediaPlayerController:MediaPlayerController;
    private video: HTMLVideoElement;
    private buffer: MediaPlayerBuffer;

    // 私有属性
    private config: FactoryObject = {};
    private firstCurrentRequest: number = 0;
    // 当前视频流的具体ID，也就是在请求第几个Period媒体片段
    private currentStreamId:number = 0;
    // 媒体的总时长 -- duration
    private duration:number = 0;

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
        this.streamController = StreamControllerFactory({num:23}).create();
        
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
        this.duration = this.dashParser.getTotalDuration(manifest as Mpd);
        this.eventBus.
            trigger(EventConstants.MANIFEST_PARSE_COMPLETED,manifest,this.duration,manifest);
    }

    onSegmentLoaded(res: ConsumedSegment) {
        console.log("加载Segment成功",res.mediaId);
        this.firstCurrentRequest ++;
        if(this.firstCurrentRequest === 23) {
            this.eventBus.trigger(EventConstants.FIRST_REQUEST_COMPLETED);
        }
        let data = res.data;
        let id = res.streamId;
        let videoBuffer = data[0];
        let audioBuffer = data[1];
        this.currentStreamId = id;
        this.buffer.push({
            video:videoBuffer,
            audio:audioBuffer,
            streamId: res.streamId
        })
        this.eventBus.trigger(EventConstants.BUFFER_APPENDED,this.currentStreamId);
    }

    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url 
     */
    public attachSource(url:string) {
        this.eventBus.trigger(EventConstants.SOURCE_ATTACHED,url);
        this.urlLoader.load({url,responseType:"text"},"Manifest");
    }
    /**
     * @description 让MediaPlayer类去接管传入的video dom元素
     * @param video 
     */
    public attachVideo(video:HTMLVideoElement) {
        this.video = video;
        this.mediaPlayerController = MediaPlayerControllerFactory({video:video,duration:this.duration}).create();
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayer);

export default factory;