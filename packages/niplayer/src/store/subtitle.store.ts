import BaseStore from '@/base/base.store'
import { ISubtitle } from '@/types'

interface SubtitleState {
    subtitle: ISubtitle[]
    selectedSubtitle: ISubtitle
    /**
     * @desc 当前字幕内容
     */
    currentText: string
    subtitleOpen: boolean
}

export class SubtitleStore extends BaseStore<SubtitleState> {
    get defaultState(): SubtitleState {
        return {
            subtitle: null,
            selectedSubtitle: null,
            currentText: null,
            subtitleOpen: false,
        }
    }

    get lang() {
        return this.state.selectedSubtitle?.lang ?? '默认'
    }

    mounted() {
        const subtitleItem =
            this.player.config.subtitle.filter((item) => item.default)?.[0] ??
            null
        if (subtitleItem) {
            this.setState('selectedSubtitle', subtitleItem)
        }
    }

    changeSelectedSubtitle(item: ISubtitle) {
        this.setState('selectedSubtitle', item)
    }
}
