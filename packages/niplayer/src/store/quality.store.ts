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
        if (!q) return;
        if (q.qn === this.state.selectedQuality?.qn) return;
        if (this.state.isChangeQuality) {
            console.warn('正在切换清晰度中')
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
            this.requestSeamlessQualityChange(q, this.player.nodes.videoElement);
        }
    }

    /**
     * @desc mp4视频的无缝切换函数
     * @param q 
     * @param videoElement 
     */
    requestSeamlessQualityChange(q: IQuality, videoElement: HTMLVideoElement) {
        console.log('Start to request seamless quality change');
        const nextVideo = document.createElement('video');
        let switchTimer = null, switchTimeoutTimer = null;
        const done = () => {
            clearTimeout(switchTimeoutTimer);
            clearTimeout(switchTimer);

            videoEvents.forEach((item) => {
                videoElement.removeEventListener(item.prop, item.callback);
            });
            nextVideoEvents.forEach((item) => {
                nextVideo[item.prop] = null;
            });

            nextVideo.muted = videoElement.muted;
            nextVideo.volume = videoElement.volume;

            videoElement.parentElement.removeChild(videoElement);
            videoElement = null;
            this.player.nodes.videoElement = nextVideo;

            this.player.rootStore.mediaStore.removeMediaEvents();
            this.player.rootStore.mediaStore.addMediaEvents();
            this.setState('selectedQuality', q);
            this.setState('isChangeQuality', false);
            this.player.emit(NI_PLAYER_EVENT.VIDEO_QUALITY_CHANGED, q);
        }

        const restartSwitchTimeout = () => {
            clearTimeout(switchTimeoutTimer);
            switchTimeoutTimer = window.setTimeout(() => {
                done();
            }, 5 * 1000);
        };

        const restartDelaySwitch = (from: string) => {
            clearTimeout(switchTimer);
            clearTimeout(switchTimeoutTimer);
            switchTimer = window.setTimeout(
                () => {
                    console.log(`from:${from}`);
                    done();
                },
                ((nextVideo.currentTime - videoElement.currentTime) * 1000) / videoElement.playbackRate,
            );
        };

        const videoEvents = [
            {
                prop: 'ratechange',
                callback: () => {
                    nextVideo.playbackRate = videoElement.playbackRate;
                },
                fireImmediately: true,
            },
            {
                prop: 'ratechange',
                callback: () => {
                    restartDelaySwitch('ratechange')
                }
            },
            {
                prop: 'volumechange',
                callback: () => {
                    nextVideo.volume = videoElement.volume;
                },
                fireImmediately: true,
            },
            {
                prop: 'play',
                callback: () => {
                    nextVideo.play();
                },
            },
            {
                prop: 'pause',
                callback: () => {
                    nextVideo.pause();
                },
            },
            {
                prop: 'seeking',
                callback: () => {
                    // tuneNextVideo(video.paused ? 0 : 1);
                    nextVideo.currentTime = videoElement.paused ? videoElement.currentTime : videoElement.currentTime + 1;
                    restartDelaySwitch('SeekingEvent');
                },
            },
            {
                prop: 'error',
                callback: () => {
                    // catchPrimaryError();
                },
            },
        ]

        const nextVideoEvents = [
            {
                prop: 'onloadedmetadata',
                callback: () => {
                    videoEvents.forEach(item => {
                        if (item.fireImmediately) {
                            item.callback();
                        }

                        videoElement.addEventListener(item.prop, item.callback);

                        if (videoElement.paused) {
                            nextVideo.pause();
                        } else {
                            nextVideo.play();
                        }

                        nextVideo.currentTime = videoElement.paused ? videoElement.currentTime : videoElement.currentTime + 3;
                    });

                    nextVideo.onloadedmetadata = null;
                }
            },
            {
                prop: 'oncanplay',
                callback: () => {
                    if (videoElement.paused && nextVideo.paused) {
                        nextVideo.currentTime = videoElement.currentTime;
                        restartDelaySwitch('CanplayEvent');
                    }
                },
            },
            {
                prop: 'onplaying',
                callback: () => {
                    restartDelaySwitch('PlayingEvent');
                },
            },
            {
                prop: 'onpause',
                callback: () => {
                    if (videoElement.paused && nextVideo.paused) {
                        nextVideo.currentTime = videoElement.currentTime;
                        restartDelaySwitch('PauseEvent');
                    } else {
                        
                    }
                },
            },
        ]

        nextVideoEvents.forEach(item => {
            nextVideo[item.prop] = item.callback;
        })

        nextVideo.muted = true;
        nextVideo.src = q.url;
        nextVideo.crossOrigin = 'anonymous';

        this.player.nodes.videoArea.appendChild(nextVideo);

        restartSwitchTimeout();
    }
}