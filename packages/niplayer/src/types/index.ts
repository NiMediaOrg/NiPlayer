export interface IQuality {
    url: string
    qn: number
    name: string
}

export interface IWaterMark {
    message: string
    rotate?: number
}

export type PlayerConfig = {
    /**
     * @desc 视频的url地址
     */
    url: string
    /**
     * @desc 播放器的托管容器
     */
    container: HTMLElement
    /**
     * @desc 播放器使用的video元素，不传则使用内置video
     */
    video?: HTMLVideoElement
    /**
     * @desc 视频的封面
     */
    post?: string
    /**
     * @desc 是否开启自动播放
     */
    autoPlay?: boolean
    /**
     * @desc 是否开启mp4的流式播放
     */
    streamPlay?: boolean
    /**
     * @desc 视频的流式播放相关配置
     */
    streamPlayOptions?: {
        /**
         * @desc 设置加载分片的大小，单位为字节
         */
        chunkSize?: number
        /**
         * @desc 设置加载分片的间隔，单位为毫秒
         */
        loadGap?: number
        /**
         * @desc 设置采样数，表明多少个采样后进行一次segment操作
         */
        samples?: number
    }
    /**
     * @desc 视频的清晰度列表
     */
    quality?: IQuality[]
    /**
     * @desc 是否使用无缝切换画质
     */
    seamlessChangeQuality?: boolean
    /**
     * @desc 视频的标题
     */
    title?: string
    /**
     * @desc 截图的水印相关配置
     */
    waterMark?: IWaterMark
    /**
     * @desc 截图相关配置
     */
    shot?: {
        filename?: string;
    }
}
