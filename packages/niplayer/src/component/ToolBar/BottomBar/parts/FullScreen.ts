import { SingleTapEvent, wrap } from 'ntouch.js'
import { EVENT } from '@/events'
import { Player } from '@/page/player'
import { DOMProps, Node } from '@/types/Player'
import { addClass, createSvg } from '@/utils/domUtils'
import { storeControlComponent } from '@/utils/store'
import { fullscreenExitPath, fullscreenPath } from '@/svg'
import { Options } from './Options'
import { isFull } from 'be-full'
import { FullHTMLElement, enterFull, exitFull } from '@/utils/full'

export class FullScreen extends Options {
    readonly id = 'FullScreen'
    enterFullScreen: boolean = false
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
        addClass(this.el, ['video-fullscreen', 'video-controller'])
        this.icon = createSvg(fullscreenPath, '0 0 1024 1024')
        this.iconBox.appendChild(this.icon)

        this.hideBox.innerText = '全屏'
    }

    initEvent() {
        this.requestFullScreen = this.requestFullScreen.bind(this)
        if (this.player.env === 'PC') {
            this.el.onclick = this.requestFullScreen
        } else {
            wrap(this.el).addEventListener(
                'singleTap',
                this.requestFullScreen,
                {
                    stopPropagation: true,
                }
            )
        }

        document.addEventListener('fullscreenchange', (e) => {
            if (document.fullscreenElement) {
                console.log("进入全屏");
                this.player.emit(EVENT.ENTER_FULLSCREEN)
            } else {
                console.log("退出全屏");
                this.player.emit(EVENT.LEAVE_FULLSCREEN)
            }
        })
    }

    requestFullScreen(e?: Event | SingleTapEvent) {
        if (e instanceof Event) {
            // 在此处做了一层类型守卫
            e.stopPropagation()
        }
        if (!isFull(this.player.container)) {
            // 调用浏览器提供的全屏API接口去请求元素的全屏，原生全屏分为  竖屏全屏 + 横屏全屏
            enterFull(this.player.container as FullHTMLElement)
            // this.player.container.requestFullscreen();

            this.iconBox.removeChild(this.icon)
            this.icon = createSvg(fullscreenExitPath, '0 0 1024 1024')
            this.iconBox.appendChild(this.icon)
        } else if (isFull(this.player.container)) {
            // document.exitFullscreen()
            exitFull()
            this.iconBox.removeChild(this.icon)
            this.icon = createSvg(fullscreenPath, '0 0 1024 1024')
            this.iconBox.appendChild(this.icon)
        }
    }
}
