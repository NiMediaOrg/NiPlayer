import { back, playrate, rightArrow } from "@/assets/svg";
import BasePlugin from "@/base/base.plugin";
import { IPanelItem } from "packages/niplayer-components/src";

export class PlaybackRate extends BasePlugin {
    protected name: string = 'playback-rate';

    protected install(): void {
        const { state, setState } = this.player.rootStore.settingStore;
        this.player.registerSettingItem({
            content: '倍速',
            icon: playrate,
            //!! 此处tip的依赖收集没有生效，很是奇怪（已解决， 通过传入函数来延迟tip的取值时机，让其在jsx中渲染时才获取对应的值来进行依赖收集）
            tip: () => this.player.rootStore.mediaStore.playRateTitle,
            button: rightArrow,
            jump: {
                title: '倍速',
                headerIcon: back,
                panelItemClick: (item: IPanelItem) => {
                    this.player.setPlaybackRate(item.val);
                    setState('sidePanel', {
                        ...state.sidePanel,
                        items: null
                    });
                },
                items: [
                    {
                        content: '0.25',
                        val: 0.25,
                    },
                    {
                        content: '0.5',
                        val: 0.5,
                    },
                    {
                        content: '0.75',
                        val: 0.75,
                    },
                    {
                        content: '正常',
                        val: 1,
                    },
                    {
                        content: '1.25',
                        val: 1.25,
                    },
                    {
                        content: '1.5',
                        val: 1.5,
                    },
                    {
                        content: '1.75',
                        val: 1.75,
                    },
                    {
                        content: '2',
                        val: 2,
                    }
                ]
            }
        },)
    }
}