import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { addClass, createSvg, removeClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { fullPagePath, fullPageExitPath } from "../path/defaultPath";
import { Options } from "./Options";

export class FullPage extends Options {
    readonly id = "FullPage";
    player: Player;
    props: DOMProps;
    icon: SVGSVGElement;
    isFullPage = false;
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
        addClass(this.el,["video-fullpage","video-controller"])
        this.icon = createSvg(fullPagePath);
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);

        this.hideBox.innerText = "网页全屏"
        this.hideBox.style.fontSize = "13px"
    }
    
    initEvent() {
        this.onClick = this.onClick.bind(this);
        this.el.onclick = this.onClick;
    }

    onClick(e:MouseEvent) {
        if(!this.isFullPage) {
            addClass(this.player.container,["video-fullpage"])
            this.player.container.style.position = "fixed"
            this.player.container.style.width = "100%";
            this.player.container.style.height = "100%"
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullPageExitPath);
            this.iconBox.appendChild(this.icon)
            
        } else {
            removeClass(this.player.container,["video-fullpage"]);
            this.player.container.style.position = ""
            this.player.container.style.width = this.player.playerOptions.width;
            this.player.container.style.height = this.player.playerOptions.height;
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullPagePath);
            this.iconBox.appendChild(this.icon)
        }
        this.isFullPage = !this.isFullPage;

    }
        
}