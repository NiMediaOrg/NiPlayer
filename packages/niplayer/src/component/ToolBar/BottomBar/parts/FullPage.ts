import { SingleTapEvent, wrap } from 'ntouch.js'
import { Player } from '@/page/player'
import { DOMProps, Node } from '@/types/Player'
import { addClass, createSvg, removeClass } from '@/utils/domUtils'
import { storeControlComponent } from '@/utils/store'
import { fullPagePath, fullPageExitPath } from '@/svg/index'
import { Options } from './Options'
import { EVENT } from '@/events'

export class FullPage extends Options {
    readonly id = 'FullPage'
    isFullPage = false
    constructor(
        player: Player,
        container: HTMLElement,
        desc?: string,
        props?: DOMProps,
        children?: Node[]
    ) {
        super(player, container, 0, 0, desc, props, children)
        this.init()
    }

    init() {
        this.initTemplate()
        this.initEvent()
        storeControlComponent(this)
    }

    initTemplate() {
        addClass(this.el, ['video-fullpage', 'video-controller'])
        this.icon = createSvg(fullPagePath, '0 0 1024 1024')
        this.iconBox.appendChild(this.icon)

        this.hideBox.innerText = '网页全屏'
    }

    initEvent() {
        this.onClick = this.onClick.bind(this)
        if (this.player.env === 'Mobile') {
            wrap(this.el).addEventListener('singleTap', this.onClick, {
                stopPropagation: true,
            })
        } else {
            this.el.onclick = this.onClick
        }
    }

    onClick(e: Event | SingleTapEvent) {
        if (e instanceof Event) {
            e.stopPropagation()
        }
        if (!this.isFullPage) {
            // 表明此刻播放器进入页面全屏

            addClass(this.player.el, ['video-wrapper-fullpage'])
            this.iconBox.removeChild(this.icon)
            this.icon = createSvg(fullPageExitPath, '0 0 1024 1024')
            this.iconBox.appendChild(this.icon)
            this.player.emit(EVENT.ENTER_FULLPAGE)
        } else {
            removeClass(this.player.el, ['video-wrapper-fullpage'])
            this.iconBox.removeChild(this.icon)
            this.icon = createSvg(fullPagePath, '0 0 1024 1024')
            this.iconBox.appendChild(this.icon)
            this.player.emit(EVENT.LEAVE_FULLPAGE)
        }
        this.isFullPage = !this.isFullPage
    }
}
