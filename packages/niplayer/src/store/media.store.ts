import BaseStore from "@/base/base.store";
import NiPlayer from "@/player";
import { NI_PLAYER_EVENT } from "@/types/events";

export interface MediaState {
    currentTime: number;
    totalTime: number;
    paused: boolean;
    playing: boolean;
}

export default class MediaStore extends BaseStore<MediaState> {
    get defaultState(): MediaState {
        return {
            currentTime: 0,
            totalTime: 0,
            paused: true,
            playing: false
        }
    }

    constructor(player: NiPlayer) {
        super(player);

        this.player.on(NI_PLAYER_EVENT.VIDEO_PREPARED, (video: HTMLVideoElement) => {
            video.addEventListener('play', () => {
                this.setState({
                    playing: true, 
                    paused: false
                })
            })

            video.addEventListener('pause', () => {
                this.setState({
                    playing: false,
                    paused: true
                })
            })

            video.addEventListener('durationchange', () => {
                this.setState({
                    totalTime: video.duration
                })
            })

            video.addEventListener('timeupdate', () => {
                this.setState({
                    currentTime: video.currentTime
                })
            })
        })
    }
}