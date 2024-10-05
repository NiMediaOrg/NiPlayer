import BaseStore from '@/base/base.store'
import { IPanel, IPanelItem } from 'niplayer-components'
import _ from 'lodash'

interface SettingState {
    mainPanel: IPanel
    sidePanel: IPanel
}

export class SettingStore extends BaseStore<SettingState> {
    public mainPanelItems: IPanelItem[] = []
    get defaultState(): SettingState {
        return {
            mainPanel: {
                title: 'main',
                panelItemClick: (item: IPanelItem) => {
                    this.mainPanelItems = _.cloneDeep(
                        this.state.mainPanel.items
                    )
                    this.setState('sidePanel', item.jump)
                    this.setState('mainPanel', {
                        ...this.state.mainPanel,
                        items: null,
                    })
                },
                items: [],
            },
            sidePanel: null,
        }
    }

    public registerPanelItem(item: IPanelItem) {
        this.setState('mainPanel', {
            ...this.state.mainPanel,
            items: [...this.state.mainPanel.items, item],
        })
    }
}
