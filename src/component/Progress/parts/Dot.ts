import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node} from "../../../types/Player";
import { addClass, getElementSize, includeClass, removeClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { Progress } from "../Progress";
export class Dot extends Component implements ComponentItem {
    readonly id = "Dot";
    props:DOMProps;
    player:Player;
    container: HTMLElement;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container, desc, props, children);
        this.props = props || {};
        this.player = player;
        this.container = container;
        this.init();
    }

    init() {
        addClass(this.el,["video-dot","video-dot-hidden"]);
        this.initEvent();

        storeControlComponent(this);
    }

    initEvent() {
        this.player.on("progress-mouseenter",(e)=>{
            this.onShowDot(e);
        })

        this.player.on("progress-mouseleave",(e)=>{
            this.onHideDot(e);
        })

        this.player.on("progress-click",(e:MouseEvent, ctx:Progress)=>{
            this.onChangePos(e,ctx);
        })

        this.player.on("timeupdate",(e) => {
            this.updatePos(e);
        })
    }
 
    onShowDot(e:MouseEvent) {
        if(includeClass(this.el,"video-dot-hidden")) {
            removeClass(this.el,["video-dot-hidden"]);
        }
    }

    onHideDot(e:MouseEvent) {
        if(!includeClass(this.el,"video-dot-hidden")) {
            addClass(this.el,["video-dot-hidden"]);
        }
    }

    onChangePos(e:MouseEvent,ctx: Component) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this.el.style.left = e.offsetX - getElementSize(this.el).width / 2 + 'px';
    }

    updatePos(e:Event) {
        let video = e.target as HTMLVideoElement;
        let scale = video.currentTime / video.duration;
        if(scale < 0) {
            scale = 0;
        } else if(scale > 1) {
            scale = 1;
        }
        this.el.style.left = scale * this.container.clientWidth - getElementSize(this.el).width / 2 + 'px';
    }
}