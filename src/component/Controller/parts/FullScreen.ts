import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { addClass, createSvg } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { fullscreenExitPath, fullscreenPath } from "../path/defaultPath";
import { Options } from "./Options";

export class FullScreen extends Options{
    readonly id = "FullScreen";
    player: Player;
    props: DOMProps;
    icon: SVGSVGElement;
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
    }
    
    initEvent() {
        this.onClick = this.onClick.bind(this);
        this.el.onclick = this.onClick;
        addClass(this.el,["video-fullscreen","video-controller"]);
        this.icon = createSvg(fullscreenPath);
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);
    }

    onClick(e:MouseEvent) {
        if (this.player.container.requestFullscreen && !document.fullscreenElement) {
            this.player.container.requestFullscreen(); //该函数请求全屏
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullscreenExitPath);
            this.iconBox.appendChild(this.icon)
        } else if (document.fullscreenElement) {
            document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullscreenPath);
            this.iconBox.appendChild(this.icon)
        }
    }
}