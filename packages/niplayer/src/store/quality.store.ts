import BaseStore from "@/base/base.store";
import { NI_PLAYER_EVENT } from "@/events";
import NiPlayer from "@/player";
import { IQuality } from "@/types";
interface QualityState {
    currentQn: number;
    qualityList: IQuality[],
    selectedQuality: IQuality;
    isChangeQuality: boolean;
}

export class QualityStore extends BaseStore<QualityState> {
    get defaultState(): QualityState {
        return {
            currentQn: 0,
            qualityList: [],
            selectedQuality: null,
            isChangeQuality: false,
        }
    }

    get qualityTitle() {
        return this.state.selectedQuality?.name || '默认';
    }

    constructor(player: NiPlayer) {
        super(player);
        this.setState('qualityList', [
            ...player.config.quality
        ]);
    }

    internalRequestQuality(q: IQuality) {
        if (q.qn === this.state.selectedQuality?.qn) return;
        if (this.state.isChangeQuality) {
            console.log('正在切换清晰度中')
            return;
        }
        //* 触发播放器的切换quality事件
        this.player.emit(NI_PLAYER_EVENT.VIDEO_QUALITY_CHANGING, q);
        this.setState('isChangeQuality', true);
        const currentTime = this.player.rootStore.mediaStore.state.currentTime;
        if (!this.player.config.seamlessChangeQuality) {
            const onCanPlay = () => {
                this.setState('selectedQuality', q);
                this.setState('isChangeQuality', false);
                this.player.seek(currentTime);
                this.player.emit(NI_PLAYER_EVENT.VIDEO_QUALITY_CHANGED, q);
                this.player.off(NI_PLAYER_EVENT.VIDEO_CAN_PLAY, onCanPlay);
            }
            this.player.on(NI_PLAYER_EVENT.VIDEO_CAN_PLAY, onCanPlay);
            this.player.nodes.videoElement.src = q.url;
        } else {
            //* 视频的无缝切换
        }
    }

    /**
     * @desc mp4视频的无缝切换函数
     * @param q 
     * @param videoElement 
     */
    requestSeamlessQualityChange(q: IQuality, videoElement: HTMLVideoElement) {

    }

    mounted(): void {
        this.player.useState(() => this.state.selectedQuality, (q) => {
            this.internalRequestQuality(q);
        })
    }
}