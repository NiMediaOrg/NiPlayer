import screenfull from "screenfull";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { addClass, createSvg, removeClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { fullscreenExitPath, fullscreenPath } from "../path/defaultPath";
import { Options } from "./Options";

export class FullScreen extends Options{
    readonly id = "FullScreen";
    player: Player;
    props: DOMProps;
    icon: SVGSVGElement;
    enterFullScreen: boolean = false;
    constructor(player:Player,container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
        super(player, container,0,0, desc,props,children);
        this.player = player;
        this.props = props || {};
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }

    initTemplate() {
        addClass(this.el,["video-fullscreen","video-controller"])
        this.icon = createSvg(fullscreenPath);
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);

        this.hideBox.innerText = "全屏"
        this.hideBox.style.fontSize = "13px"
    }
    
    initEvent() {
        if(this.player.env === "PC") {
            this.initPCEvent();
        } else {
            this.initMobileEvent()
        }
    }

    initPCEvent() {
        this.onClick = this.onClick.bind(this);
        this.el.onclick = this.onClick;
    }

    onClick(e:Event) {
        if(this.player.fullScreenMode === "Horizontal") {
            if (screenfull.isEnabled && !screenfull.isFullscreen) {
                // 调用浏览器提供的全屏API接口去请求元素的全屏，原生全屏分为  竖屏全屏 + 横屏全屏
                screenfull.request(this.player.container);
                this.iconBox.removeChild(this.icon);
                this.icon = createSvg(fullscreenExitPath);
                this.iconBox.appendChild(this.icon)
                this.player.container.addEventListener("fullscreenchange",(e) => {
                    this.player.emit("enterFullscreen")
                })
                
            } else if (screenfull.isFullscreen) {
                screenfull.exit()
                this.iconBox.removeChild(this.icon);
                this.icon = createSvg(fullscreenPath);
                this.iconBox.appendChild(this.icon)
                this.player.container.addEventListener("fullscreenchange",(e) => {
                    this.player.emit("leaveFullscreen")
                })
            } 
        } else {
            if(this.enterFullScreen === false) {
                this.iconBox.removeChild(this.icon);
                this.icon = createSvg(fullscreenExitPath);
                this.iconBox.appendChild(this.icon)
                addClass(this.player.container, ["video-cross-screen"])
                this.container.style.width = window.innerHeight + "px";
                this.container.style.height = window.innerWidth + "px";

                this.player.emit("enterFullscreen")
            } else {
                this.iconBox.removeChild(this.icon);
                this.icon = createSvg(fullscreenPath);
                this.iconBox.appendChild(this.icon)
                removeClass(this.player.container, ["video-cross-screen"])
                this.container.style.width = this.player.playerOptions.width;
                this.container.style.height = this.player.playerOptions.height

                this.player.emit("leaveFullscreen")
            }
        }
        
    }

    initMobileEvent(): void {
        this.el.addEventListener("singleTap",async (e) => {
            this.onClick(e);
        })
    }


}