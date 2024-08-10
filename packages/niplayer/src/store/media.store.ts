import BaseStore from "@/base/base.store";

export interface MediaState {
    currentTime: number;
    totalTime: number;
    paused: boolean;
    count: number;
    isEnterFullscreen: boolean;
    isEnterPipInPip: boolean;
    volume: number;
}

export default class MediaStore extends BaseStore<MediaState> {
    get defaultState(): MediaState {
        return {
            currentTime: 0,
            totalTime: 0,
            paused: true,
            count: 0,
            volume: 100,
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
    }
}