import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest, PeriodSegmentRequest } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import BaseURLParserFactory,{ BaseURLParser, URLNode } from "../parser/BaseURLParser";
import URLUtilsFactory, { URLUtils } from "../utils/URLUtils";

class StreamController {
    private config:FactoryObject = {};
    private baseURLParser: BaseURLParser;
    private baseURLPath: URLNode;
    private URLUtils:URLUtils;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.factory;
        this.setup();
    }

    setup(){
        this.baseURLParser = BaseURLParserFactory().getInstance();
        this.URLUtils = URLUtilsFactory().getInstance();
    }

    generateBaseURLPath(Mpd:Mpd) {
        this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(Mpd as Mpd);
    }

    generateSegmentRequestStruct(Mpd:Mpd):MpdSegmentRequest | void {
        this.generateBaseURLPath(Mpd);
        let baseURL = Mpd["baseURL"] || "";
        let mpdSegmentRequest:MpdSegmentRequest = {
            type:"MpdSegmentRequest",
            request:[]
        };
        for(let i=0;i<Mpd["Period_asArray"].length;i++) {
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
                        lang: "en",
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
            res[Representation.resolvePower] = [Representation.initializationURL,Representation.mediaURL];
                    
        }
        return res;
    }

}

const factory = FactoryMaker.getClassFactory(StreamController);
export default factory;
export { StreamController };

