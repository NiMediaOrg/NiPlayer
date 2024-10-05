import { back, rightArrow, subtitle } from '@/assets/svg'
import type { IPanelItem } from 'niplayer-components'
import { UIPlugin } from '@/base/ui.plugin'
import { JSX } from 'solid-js/jsx-runtime'
import './index.less'

export class Subtitle extends UIPlugin {
    protected name: string = 'play-subtitle'

    protected subtitleTrack: HTMLTrackElement | null = null

    get baseBottom() {
        return this.player.rootStore.actionStore.state.isControllerBarHidden ? 0 : this.player.nodes.controllerBar.clientHeight 
    }
    protected install() {
        super.install()
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
            tip: () => this.player.rootStore.subtitleStore.state.subtitleOpen ? this.player.rootStore.subtitleStore.lang : '开启字幕',
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
                    if (item?.id === 'switch') {
                        that.player.rootStore.subtitleStore.setState(
                           'subtitleOpen',
                           !this.player.rootStore.subtitleStore.state.subtitleOpen
                        )
                    } else {
                        that.player.rootStore.subtitleStore.changeSelectedSubtitle({
                            url: item.val,
                            lang: typeof item.content === 'function' ? item.content() : item.content,
                        })
                    }
                },
                items: [
                    {
                        content: () => this.player.rootStore.subtitleStore.state.subtitleOpen ? '关闭字幕' : '开启字幕',
                        val: null,
                        id: 'switch'
                    },
                    ...that.player.config.subtitle.map((item) => {
                    return {
                        content: item.lang,
                        val: item.url,
                    }
                })],
            },
        })
    }

    protected render(): JSX.Element | string | HTMLElement {
        return (
            <div class="niplayer-subtitle-container" style={{ 
                opacity: 0, 
                bottom: `${this.baseBottom + 10}px`,
                display: this.player.rootStore.subtitleStore.state.subtitleOpen ? 'block' : 'none',    
            }}>
                {
                    this.player.rootStore.subtitleStore.state.currentText?.split('\n').map(text => <p innerText={text}></p>)
                }
            </div>
        )
    }

    protected afterRender() {
        this.player.nodes.videoLayer.appendChild(this.element)
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
                    if (cue) {
                        this.player.rootStore.subtitleStore.setState(
                            'currentText',
                            cue.text
                        )
                    }
                    this.element.style.opacity = cue ? '1' : '0'
                }
            },
            {
                fireImmediately: true,
            }
        )
    }
}
