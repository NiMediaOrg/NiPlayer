import { MP4File } from "mp4box";
import { MoovBoxInfo, MediaTrack } from "../types/mp4";
declare class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxfile: MP4File;
    mediaSource: MediaSource;
    constructor(url: string, video: HTMLVideoElement);
    init(): void;
    initEvent(): void;
    /**
     * @description 根据传入的媒体轨道的类型构建对应的SourceBuffer
     * @param mp4track
     */
    addBuffer(mp4track: MediaTrack): void;
    addSourceBufferListener(info: MoovBoxInfo): void;
}
export default MediaPlayer;
