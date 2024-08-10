export type PlayerConfig = {
    /**
     * @desc 视频的url地址
     */
    url: string;
    /**
     * @desc 播放器的托管容器
     */
    container: HTMLElement;
    /**
     * @desc 播放器使用的video元素，不传则使用内置video
     */
    video?: HTMLVideoElement;
    post?: string;
    autoPlay?: boolean;
    streamPlay?: boolean;
}