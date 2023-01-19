import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import { VideoBuffers } from "../../types/dash/Stream";
import FactoryMaker from "../FactoryMaker";
import DashParserFactory, { DashParser } from "../parser/DashParser"

class TimeRangeUtils {
    private config: FactoryObject = {};
    private dashParser: DashParser;
    constructor(ctx:FactoryObject,...args:any[]){
        this.config = ctx.context;
        this.setup();
    }

    setup(){
        this.dashParser = DashParserFactory().getInstance();
    }
    /**
     * @description 返回特定stream之前的所有stream的时间总和
     * @param streamId 
     * @param Mpd 
     * @returns {number} Number
     */
    getSummaryTimeBeforeStream(streamId:number,Mpd:Mpd): number {
        if(streamId === 0) return 0;
        let Period = Mpd["Period_asArray"];
        let sum = 0;
        for(let i = 0; i<streamId; i++) {
            sum += Period[i].duration;
        }
        return sum;
    }

    getOffestTimeOfMediaSegment(streamId:number,mediaId:number,Mpd:Mpd): number {
        let beforeTime = this.getSummaryTimeBeforeStream(streamId,Mpd);
        let segmentDuration = this.dashParser.getSegmentDuration(Mpd,streamId);
        return beforeTime + segmentDuration * (mediaId + 1);
    }

    inVideoBuffered(time:number,ranges:VideoBuffers): boolean {
        for(let range of ranges) {
            if(time >= range.start && time <= range.end) return true;
        }
        return false;
    }

    inSpecificStreamRange(streamId:number,currentTime:number,Mpd:Mpd): boolean{
        let totalTime = this.dashParser.getTotalDuration(Mpd);
        if(currentTime > totalTime) return false;
        let start = this.getSummaryTimeBeforeStream(streamId,Mpd);
        let end = start + Mpd["Period_asArray"][streamId].duration;
        if(currentTime < start || currentTime > end) return false;
        return true;
    }

    getSegmentAndStreamIndexByTime(streamId: number, currentTime:number, Mpd:Mpd): 
        [number,number] | never 
    {
        if(this.inSpecificStreamRange(streamId,currentTime,Mpd)) {
            let segmentDuration = this.dashParser.getSegmentDuration(Mpd,streamId);
            let index = Math.floor(currentTime / segmentDuration);
            return [streamId,index];
        } else {
            let totalTime = this.dashParser.getTotalDuration(Mpd);
            if(currentTime > totalTime) {
                throw new Error("传入的当前时间大于媒体的总时长");
            }
            let sum = 0;
            for(let i = 0 ;i<Mpd["Period_asArray"].length;i++) {
                let Period = Mpd["Period_asArray"][i]
                sum += Period.duration;
                if(sum > currentTime) {
                    let segmentDuration = this.dashParser.getSegmentDuration(Mpd,i);
                    let index = Math.floor(currentTime / segmentDuration);
                    return [i,index];
                }
            }
        }
    }

}

const factory = FactoryMaker.getSingleFactory(TimeRangeUtils);
export default factory;
export { TimeRangeUtils };