import BaseStore from "@/base/base.store";
import { IPanel, IPanelItem } from "niplayer-components";
interface SettingState {
    mainPanel: IPanel,
    sidePanel: IPanel;
}


export class SettingStore extends BaseStore<SettingState> {
    get defaultState(): SettingState {
        return {
            mainPanel: {
                title: 'main',
                panelItemClick: (item: IPanelItem) => this.setState('sidePanel', item.jump),
                items: []
            },
            sidePanel: {}
        }
    }

    public registerPanelItem(item: IPanelItem) {
        this.setState('mainPanel', {
            ...this.state.mainPanel,
            items: [
                ...this.state.mainPanel.items,
                item
            ]
        })
    }
}