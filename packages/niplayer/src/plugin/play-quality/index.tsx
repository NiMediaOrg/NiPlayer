import { back, quality, rightArrow } from "@/assets/svg";
import BasePlugin from "@/base/base.plugin";
import { IPanelItem } from "niplayer-components";

export class PlayQuality extends BasePlugin {
    protected name: string = 'play-quality';

    protected install(): void {
        const { state, setState } = this.player.rootStore.settingStore;
        const { qualityList } = this.player.rootStore.qualityStore.state;
        this.player.registerSettingItem({
            content: '播放画质',
            tip: () => this.player.rootStore.qualityStore.qualityTitle, 
            button: rightArrow,
            icon: quality,
            jump: {
                title: '画质',
                headerIcon: back,
                panelItemClick: (item: IPanelItem) => {
                    setState('sidePanel', {
                        ...state.sidePanel,
                        items: null
                    });
                    this.player.rootStore.qualityStore.internalRequestQuality(qualityList.filter(i => i.qn === item.val)[0]);
                },
                items: qualityList.map(item => {
                    return {
                        content: item.name,
                        val: item.qn,
                    }
                })
            }
        })
    }
}