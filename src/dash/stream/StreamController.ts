import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { 
    AdaptationSetAudioSegmentRequest, 
    AdaptationSetVideoSegmentRequest, 
    MpdSegmentRequest, 
    PeriodSegmentRequest, 
    PlayerBuffer
} from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import BaseURLParserFactory,{ BaseURLParser, URLNode } from "../parser/BaseURLParser";
import URLUtilsFactory, { URLUtils } from "../utils/URLUtils";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import URLLoaderFactory, { URLLoader } from "../net/URLLoader";
import TimeRangeUtilsFactory, { TimeRangeUtils } from "../utils/TimeRangeUtils";
import { VideoBuffers } from "../../types/dash/Stream";
class StreamController {
    private config:FactoryObject = {};
    private baseURLParser: BaseURLParser;
    private baseURLPath: URLNode;
    private URLUtils:URLUtils;
    private eventBus: EventBus;
    private urlLoader: URLLoader;
    private timeRangeUtils:TimeRangeUtils;
    // 音视频的分辨率
    private videoResolvePower: string = "1920*1080";
    private audioResolvePower: string = "48000"
    // 和索引相关的变量
    private mediaId: number = 0;
    private streamId: number = 0;
    // 整个MPD文件所需要发送请求的结构体对象
    private firstRequestNumber: number;
    private segmentRequestStruct:MpdSegmentRequest;
    private Mpd: Mpd;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.firstRequestNumber = this.config.num || 23;
        this.setup();
        this.initialEvent();
    }

    setup(){
        this.baseURLParser = BaseURLParserFactory().getInstance();
        this.URLUtils = URLUtilsFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        this.urlLoader = URLLoaderFactory().getInstance();
        this.timeRangeUtils = TimeRangeUtilsFactory().getInstance();
    }

    initialEvent() {
        this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED,this.onManifestParseCompleted,this);
        this.eventBus.on(EventConstants.SEGMENT_CONSUMED,this.onSegmentConsumed,this);
        this.eventBus.on(EventConstants.SEGEMTN_REQUEST,this.onSegmentRequest,this);
    }

    onManifestParseCompleted(mainifest:Mpd) {
        this.segmentRequestStruct = this.generateSegmentRequestStruct(mainifest);
        this.Mpd = mainifest;
        this.startStream(mainifest);
    }

    generateBaseURLPath(Mpd:Mpd) {
        this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(Mpd as Mpd);
    }

    generateSegmentRequestStruct(Mpd:Mpd):MpdSegmentRequest {
        this.generateBaseURLPath(Mpd);
        let baseURL = Mpd["baseURL"] || "";
        let mpdSegmentRequest:MpdSegmentRequest = {
            type:"MpdSegmentRequest",
            request:[]
        };
        for(let i = 0;i < Mpd["Period_asArray"].length; i++) {
            let Period = Mpd["Period_asArray"][i];
            let periodSegmentRequest: PeriodSegmentRequest = {
                VideoSegmentRequest:[],
                AudioSegmentRequest:[]
            };
            for(let j = 0;j<Period["AdaptationSet_asArray"].length;j++) {
                let AdaptationSet = Period["AdaptationSet_asArray"][j];
                let res = this.generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet,baseURL,i,j)
                if(AdaptationSet.mimeType === "video/mp4") {
                    periodSegmentRequest.VideoSegmentRequest.push({
                        type: "video",
                        video: res
                   })
                } else if(AdaptationSet.mimeType === "audio/mp4") {
                    periodSegmentRequest.AudioSegmentRequest.push({
                        lang: AdaptationSet.lang || "en",
                        audio: res
                    })
                }
            }
            mpdSegmentRequest.request.push(periodSegmentRequest);
        }

        return mpdSegmentRequest;
    }

    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet:AdaptationSet,baseURL:string,i:number,j:number): 
        AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest {
        let res = {}
        for(let k = 0;k<AdaptationSet["Representation_asArray"].length;k++) {
            let Representation = AdaptationSet["Representation_asArray"][k];
            let url = this.URLUtils.
                resolve(baseURL, this.baseURLParser.getBaseURLByPath([i,j,k],this.baseURLPath));
            res[Representation.resolvePower] = [];
            res[Representation.resolvePower].push(this.URLUtils.resolve(url,Representation.initializationURL))
            res[Representation.resolvePower].push(Representation.mediaURL.map(item=>{
                return this.URLUtils.resolve(url,item);
            }))     
        }
        return res;
    }

    getNumberOfMediaSegmentForPeriod(streamId:number): number {
        return this.segmentRequestStruct.request[this.streamId].VideoSegmentRequest[0].video[this.videoResolvePower][1].length;
    }   

    //初始化播放流，一次至多加载23个Segement过来
    async startStream(Mpd:Mpd) {
        let p = Mpd["Period_asArray"][this.streamId];

        let ires = await this.loadInitialSegment(this.streamId);
            
        this.eventBus.trigger(EventConstants.SEGEMTN_LOADED,{data: ires,streamId:this.streamId}); 
        let number = this.getNumberOfMediaSegmentForPeriod(this.streamId);

        for(let i = 0;i < (number >= this.firstRequestNumber ? this.firstRequestNumber : number); i++) {
            let mres = await this.loadMediaSegment();
            this.mediaId++;
            this.eventBus.trigger(EventConstants.SEGEMTN_LOADED,{data: mres,streamId:this.streamId,mediaId:this.mediaId});
        }

    }
    /**
     * @description 只有在触发seek事件后才会触发此方法
     * @param tuple 
     */
    async onSegmentRequest(tuple:[number,number]) {
        this.abortAllXHR();
        let [streamId,mediaId] = tuple;
        this.streamId = streamId;
        this.mediaId = mediaId;
        let mres = await this.loadMediaSegment();
        this.eventBus.trigger(EventConstants.SEGEMTN_LOADED,{data: mres,streamId:this.streamId,mediaId:mediaId})
    }

    //播放器消费一个Segment我就继续请求一个Segment
    async onSegmentConsumed(range: VideoBuffers) {
        if(!this.segmentRequestStruct.request[this.streamId]) return;
        let total = this.getNumberOfMediaSegmentForPeriod(this.streamId);
        if(this.mediaId >= total) {
            this.mediaId = 0;
            this.streamId ++;
        } else {
            this.mediaId ++;
        }

        if(this.segmentRequestStruct.request[this.streamId] === undefined) {
            this.eventBus.trigger(EventConstants.MEDIA_PLAYBACK_FINISHED);
        } else {
            let time = this.timeRangeUtils.getOffestTimeOfMediaSegment(this.streamId,this.mediaId,this.Mpd);
            console.log(time,range);
            if(!this.timeRangeUtils.inVideoBuffered(time,range)) {
                let mres = await this.loadMediaSegment();
                this.eventBus.trigger
                    (EventConstants.SEGEMTN_LOADED,{data:mres, streamId:this.streamId,mediaId:this.mediaId});
            }
        }
    }
    
    //此处的streamId标识具体的Period对象
    loadInitialSegment(streamId) {
        let stream = this.segmentRequestStruct.request[this.streamId]
        // 先默认选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.loadSegment(videoRequest[this.videoResolvePower][0],audioRequest[this.audioResolvePower][0]);
    }

    loadMediaSegment() {
        let stream = this.segmentRequestStruct.request[this.streamId]
        // 先默认选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.
            loadSegment(videoRequest[this.videoResolvePower][1][this.mediaId],
                        audioRequest[this.audioResolvePower][1][this.mediaId]
                        );
    }

    loadSegment(videoURL,audioURL) {
        let p1 = this.urlLoader.load({url:videoURL,responseType:"arraybuffer"},"Segment") as Promise<any>;
        let p2 = this.urlLoader.load({url:audioURL,responseType:"arraybuffer"},"Segment") as Promise<any>;
        return Promise.all([p1,p2]);
    }

    abortAllXHR() {
        this.urlLoader.abortAllXHR();
    }
}

const factory = FactoryMaker.getClassFactory(StreamController);
export default factory;
export { StreamController };

