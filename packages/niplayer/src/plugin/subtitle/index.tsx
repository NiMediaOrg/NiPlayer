import BasePlugin from '@/base/base.plugin'
import { back, rightArrow, subtitle } from '@/assets/svg'
import type { IPanelItem } from 'niplayer-components'

export class Subtitle extends BasePlugin {
    protected name: string = 'play-subtitle'

    protected subtitleTrack: HTMLTrackElement | null = null
    protected install() {
        if (
            !this.player.config.subtitle ||
            this.player.config.subtitle.length === 0
        ) {
            return
        }
        const that = this
        const { state, setState } = this.player.rootStore.settingStore
        this.initSubtitle()
        this.player.registerSettingItem({
            content: '字幕',
            icon: subtitle,
            tip: () => this.player.rootStore.subtitleStore.lang,
            button: rightArrow,
            jump: {
                title: '字幕',
                headerIcon: back,
                panelItemClick: (item: IPanelItem) => {
                    setState('sidePanel', {
                        ...state.sidePanel,
                        items: null,
                    })
                    setState('mainPanel', {
                        ...state.mainPanel,
                        items: this.player.rootStore.settingStore
                            .mainPanelItems,
                    })
                    that.player.rootStore.subtitleStore.changeSelectedSubtitle({
                        url: item.val,
                        lang: item.content,
                    })
                },
                items: that.player.config.subtitle.map((item) => {
                    return {
                        content: item.lang,
                        val: item.url,
                    }
                }),
            },
        })
    }

    protected dispose() {
        console.log('dispose')
    }

    private initSubtitle() {
        this.player.useState(
            () => this.player.rootStore.subtitleStore.state.selectedSubtitle,
            (subtitle) => {
                const video = this.player.nodes.videoElement
                if (!this.subtitleTrack) {
                    this.subtitleTrack = document.createElement('track')
                    video.appendChild(this.subtitleTrack)
                }
                this.subtitleTrack.src = subtitle.url
                this.subtitleTrack.kind = 'metadata'
                this.subtitleTrack.label = subtitle.lang
                this.subtitleTrack.default = true
                this.subtitleTrack.srclang = subtitle.lang
                for (let track of video.textTracks) {
                    track.mode = 'hidden'
                }
                this.subtitleTrack.track.oncuechange = () => {
                    const cue = this.subtitleTrack.track.activeCues[0]
                }
            },
            {
                fireImmediately: true,
            }
        )
    }
}
