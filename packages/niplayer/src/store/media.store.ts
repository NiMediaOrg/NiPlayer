import BaseStore from "@/base/base.store";
import { NI_PLAYER_EVENT } from "@/events";

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
    /**
     * @description 视频的倍速
     */
    playrate: number;
    /**
     * @description 视频是否在缓冲中
     */
    waiting: boolean;
}

export default class MediaStore extends BaseStore<MediaState> {
    get defaultState(): MediaState {
        return {
            currentTime: 0,
            totalTime: 0,
            paused: true,
            volume: 0.5,
            playrate: 1,
            isEnterFullscreen: false,
            isEnterPipInPip: false,
            waiting: false,
        }
    }

    get playRateTitle() {
        return this.state.playrate === 1 ? '正常' : this.state.playrate + ' 倍速'
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

        videoElement.addEventListener('seeked', () => {
            this.player.emit(NI_PLAYER_EVENT.VIDEO_SEEKED, videoElement.currentTime);
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

        videoElement.addEventListener('ratechange', () => {
            this.setState('playrate', videoElement.playbackRate);
            this.player.emit(NI_PLAYER_EVENT.VIDEO_PLAYRATE_CHANGED, videoElement.playbackRate);
        })

        videoElement.addEventListener('waiting', () => {
            this.setState('waiting', true);
        })

        videoElement.addEventListener('playing', () => {
            this.setState('waiting', false);
        })

        this.player.config.container.addEventListener('fullscreenchange', () => {
            this.setState('isEnterFullscreen', !!document.fullscreenElement);
        })
    }
}