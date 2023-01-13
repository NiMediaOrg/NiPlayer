import { Player } from "./player";
import { AxiosReturnType } from "../../types/AxiosRequest";
export declare class MpdPlayer {
    private player;
    private mpd;
    private requestInfo;
    private mpdUrl;
    private axios;
    constructor(player: Player);
    init(): Promise<void>;
    /**
     * @description 获取并且解析MPD文件
     */
    getMpdFile(url: string): Promise<void>;
    /**
     * @description 根据解析到的MPD文件获取初始段（Initialization Segment）
     */
    getInitializationSegment(url: string): Promise<AxiosReturnType>;
}
