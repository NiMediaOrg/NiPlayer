import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
import { VideoBuffers } from "../../types/dash/Stream";
declare class TimeRangeUtils {
    private config;
    private dashParser;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    /**
     * @description 返回特定stream之前的所有stream的时间总和
     * @param streamId
     * @param Mpd
     * @returns {number} Number
     */
    getSummaryTimeBeforeStream(streamId: number, Mpd: Mpd): number;
    getOffestTimeOfMediaSegment(streamId: number, mediaId: number, Mpd: Mpd): number;
    inVideoBuffered(time: number, ranges: VideoBuffers): boolean;
    inSpecificStreamRange(streamId: number, currentTime: number, Mpd: Mpd): boolean;
    getSegmentAndStreamIndexByTime(streamId: number, currentTime: number, Mpd: Mpd): [
        number,
        number
    ] | never;
}
declare const factory: FactoryFunction<TimeRangeUtils>;
export default factory;
export { TimeRangeUtils };
