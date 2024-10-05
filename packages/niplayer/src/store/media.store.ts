import BaseStore from '@/base/base.store'
import { NI_PLAYER_EVENT } from '@/shared/events'
import bind from 'bind-decorator'

export interface MediaState {
    /**
     * @description 视频当前时间
     */
    currentTime: number
    /**
     * @description 视频的总时长
     */
    totalTime: number
    /**
     * @description 视频的暂停状态
     */
    paused: boolean
    /**
     * @description 是否处于全屏状态
     */
    isEnterFullscreen: boolean
    /**
     * @description 是否处于画中画状态
     */
    isEnterPipInPip: boolean
    /**
     * @description 视频的音量大小
     */
    volume: number
    /**
     * @description 视频的倍速
     */
    playrate: number
    /**
     * @description 视频是否在缓冲中
     */
    waiting: boolean
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
        return this.state.playrate === 1
            ? '正常'
            : this.state.playrate + ' 倍速'
    }

    get videoElement() {
        return this.player.nodes.videoElement
    }

    mounted(): void {
        this.addMediaEvents()
        this.player.config.container.addEventListener(
            'fullscreenchange',
            () => {
                this.setState('isEnterFullscreen', !!document.fullscreenElement)
            }
        )
    }

    addMediaEvents() {
        this.videoElement.addEventListener('canplay', this.onCanPlay)
        this.videoElement.addEventListener(
            'durationchange',
            this.onDurationChange
        )
        this.videoElement.addEventListener('timeupdate', this.onTimeUpdate)
        this.videoElement.addEventListener('play', this.onPlay)
        this.videoElement.addEventListener('pause', this.onPause)
        this.videoElement.addEventListener('seeked', this.onSeeked)
        this.videoElement.addEventListener(
            'enterpictureinpicture',
            this.onEnterPictureInPicture
        )
        this.videoElement.addEventListener(
            'leavepictureinpicture',
            this.onLeavePictureInPicture
        )
        this.videoElement.addEventListener('volumechange', this.onVolumeChange)
        this.videoElement.addEventListener('ratechange', this.onRateChange)
        this.videoElement.addEventListener('waiting', this.onWaiting)
        this.videoElement.addEventListener('playing', this.onPlaying)
        this.videoElement.addEventListener('ended', this.onEnded)
        this.videoElement.addEventListener('error', this.onError)
    }

    removeMediaEvents() {
        this.videoElement.removeEventListener('canplay', this.onCanPlay)
        this.videoElement.removeEventListener(
            'durationchange',
            this.onDurationChange
        )
        this.videoElement.removeEventListener('timeupdate', this.onTimeUpdate)
        this.videoElement.removeEventListener('play', this.onPlay)
        this.videoElement.removeEventListener('pause', this.onPause)
        this.videoElement.removeEventListener('seeked', this.onSeeked)
        this.videoElement.removeEventListener(
            'enterpictureinpicture',
            this.onEnterPictureInPicture
        )
        this.videoElement.removeEventListener(
            'leavepictureinpicture',
            this.onLeavePictureInPicture
        )
        this.videoElement.removeEventListener(
            'volumechange',
            this.onVolumeChange
        )
        this.videoElement.removeEventListener('ratechange', this.onRateChange)
        this.videoElement.removeEventListener('waiting', this.onWaiting)
        this.videoElement.removeEventListener('playing', this.onPlaying)
        this.videoElement.removeEventListener('ended', this.onEnded)
        this.videoElement.removeEventListener('error', this.onError)
    }

    @bind
    onCanPlay() {
        this.player.emit(NI_PLAYER_EVENT.VIDEO_CAN_PLAY)
    }

    @bind
    onDurationChange() {
        this.setState('totalTime', this.videoElement.duration)
        this.player.emit(
            NI_PLAYER_EVENT.VIDEO_DURATION_CHANGED,
            this.videoElement.duration
        )
    }

    @bind
    onTimeUpdate() {
        this.setState('currentTime', this.videoElement.currentTime)
        this.player.emit(
            NI_PLAYER_EVENT.VIDEO_TIME_UPDATE,
            this.videoElement.currentTime
        )
    }

    @bind
    onPlay() {
        this.setState('paused', this.videoElement.paused)
        this.player.emit(NI_PLAYER_EVENT.VIDEO_PLAY)
    }

    @bind
    onPause() {
        this.setState('paused', this.videoElement.paused)
        this.player.emit(NI_PLAYER_EVENT.VIDEO_PAUSE)
    }

    @bind
    onSeeked() {
        this.player.emit(
            NI_PLAYER_EVENT.VIDEO_SEEKED,
            this.videoElement.currentTime
        )
    }

    @bind
    onEnterPictureInPicture() {
        this.setState('isEnterPipInPip', true)
    }

    @bind
    onLeavePictureInPicture() {
        this.setState('isEnterPipInPip', false)
    }

    @bind
    onVolumeChange() {
        this.setState('volume', this.videoElement.volume)
        this.player.emit(
            NI_PLAYER_EVENT.VIDEO_VOLUME_CHANGED,
            this.videoElement.volume
        )
    }

    @bind
    onRateChange() {
        this.setState('playrate', this.videoElement.playbackRate)
        this.player.emit(
            NI_PLAYER_EVENT.VIDEO_PLAYRATE_CHANGED,
            this.videoElement.playbackRate
        )
    }

    @bind
    onWaiting() {
        this.setState('waiting', true)
        this.player.emit(NI_PLAYER_EVENT.VIDEO_WAITING)
    }

    @bind
    onPlaying() {
        this.setState('waiting', false)
        this.player.emit(NI_PLAYER_EVENT.VIDEO_PLAYING)
    }

    @bind
    onEnded() {
        // throw new Error("Method not implemented.");
    }

    @bind
    onError() {
        // throw new Error("Method not implemented.");
    }
}
