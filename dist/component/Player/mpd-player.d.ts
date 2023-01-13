import { Player } from "./player";
import { AxiosReturnType } from "../../types/AxiosRequest";
import { PeriodRequest, RangeRequest, SegmentRequest } from "../../types/MpdFile";
export declare class MpdPlayer {
    private player;
    private mpd;
    private requestInfo;
    private mpdUrl;
    private axios;
    constructor(player: Player);
    init(): Promise<void>;
    initEvent(): void;
    /**
     * @description 获取并且解析MPD文件
     */
    getMpdFile(url: string): Promise<void>;
    handlePeriod(child: PeriodRequest): Promise<void>;
    handleInitializationSegment(videoUrl: string, audioUrl: string): Promise<void>;
    handleMediaSegment(videoRequest: (SegmentRequest | RangeRequest)[], audioRequest: (SegmentRequest | RangeRequest)[]): Promise<void>;
    /**
     * @description 根据解析到的MPD文件的段（Initialization Segment 和 Media Segment）
     */
    getSegment(url: string): Promise<AxiosReturnType>;
}
