import { MP4File } from "mp4box";
import { MoovBoxInfo, MediaTrack } from "../types/mp4";
import { DownLoader } from "./net/DownLoader";
declare class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxfile: MP4File;
    mediaSource: MediaSource;
    mediaInfo: MoovBoxInfo;
    downloader: DownLoader;
    lastSeekTime: number;
    constructor(url: string, video: HTMLVideoElement);
    init(): void;
    initEvent(): void;
    start(): void;
    reset(): void;
    stop(): void;
    /**
     * @description 根据传入的媒体轨道的类型构建对应的SourceBuffer
     * @param mp4track
     */
    addBuffer(mp4track: MediaTrack): void;
    loadFile(): void;
    initializeAllSourceBuffers(): void;
    initializeSourceBuffers(): void;
    onInitAppended(e: Event): void;
    onUpdateEnd(isNotInit: boolean, isEndOfAppend: boolean, ctx: MediaPlayer): void;
}
export default MediaPlayer;
