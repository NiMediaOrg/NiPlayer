import { MP4File } from "mp4box";
declare class MediaPlayer {
    url: string;
    video: HTMLVideoElement;
    mp4boxFile: MP4File;
    mediaSource: MediaSource;
    constructor(url: string, video: HTMLVideoElement);
    init(): void;
    initEvent(): void;
}
export default MediaPlayer;
