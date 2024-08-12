import BaseStore from "@/base/base.store";

export interface MediaState {
    /**
     * @description 视频当前时间
     */
    currentTime: number;
    /**
     * @description 视频的总时长
     */
    totalTime: number;
    /**
     * @description 视频的暂停状态
     */
    paused: boolean;
    /**
     * @description 是否处于全屏状态
     */
    isEnterFullscreen: boolean;
    /**
     * @description 是否处于画中画状态
     */
    isEnterPipInPip: boolean;
    /**
     * @description 视频的音量大小
     */
    volume: number;
}

export default class MediaStore extends BaseStore<MediaState> {
    get defaultState(): MediaState {
        return {
            currentTime: 0,
            totalTime: 0,
            paused: true,
            volume: 0.5,
            isEnterFullscreen: false,
            isEnterPipInPip: false,
        }
    }

    mounted(): void {
        const videoElement = this.player.nodes.videoElement;
        videoElement.addEventListener('durationchange', () => {
            this.setState('totalTime', videoElement.duration);
        })

        videoElement.addEventListener('timeupdate', () => {
            this.setState('currentTime', videoElement.currentTime);
        })

        videoElement.addEventListener('play', () => {
            this.setState('paused', videoElement.paused);
        })

        videoElement.addEventListener('pause', () => {
            this.setState('paused', videoElement.paused);
        })

        videoElement.addEventListener('enterpictureinpicture', () => {
            this.setState('isEnterPipInPip', true);
        })

        videoElement.addEventListener('leavepictureinpicture', () => {
            this.setState('isEnterPipInPip', false);
        })

        videoElement.addEventListener('volumechange', () => {
            this.setState('volume', videoElement.volume);
        })

        this.player.config.container.addEventListener('fullscreenchange', () => {
            this.setState('isEnterFullscreen', !!document.fullscreenElement);
        })

        this.player.useState(() => this.state.volume, (val) => {
            videoElement.volume = val;
        })

        this.player.useState(() => this.state.currentTime, (time) => {
            videoElement.currentTime = time;
        })
    }
}