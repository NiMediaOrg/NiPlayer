import { MoveEvent, SwipeEvent } from "ntouch.js";
import { Component } from "@/class/Component";
import { EVENT } from "@/events";
import { Player } from "@/page/player";
import { ComponentItem, DOMProps,Node } from "@/types/Player";
import { $, addClass, createSvg } from "@/utils/domUtils";
import { volumePath$1 } from "@/svg";
import "./index.less"

export class MobileVolume extends Component implements ComponentItem {
    readonly id = "MobileVolume";
    props: DOMProps;
    player: Player;
    iconBox: HTMLElement;
    progressBox: HTMLElement;
    completedBox: HTMLElement;
    icon: SVGSVGElement;
    timer = 0;
    constructor(player:Player,container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
        super(container,desc, props,children);
        this.player = player;
        this.props = props || {};
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
    }

    initTemplate(): void {
        addClass(this.el,["video-mobile-medium-wrapper"]);
        this.el.style.display = "none";
        this.iconBox = $("div.video-mobile-medium-iconbox");
        this.progressBox = $("div.video-mobile-medium-progressbox");
        this.completedBox = $("div.video-mobile-medium-completed",{style:{"width":"0px"}});
        this.icon = createSvg(volumePath$1)
        this.iconBox.appendChild(this.icon);
        this.progressBox.appendChild(this.completedBox);
        this.el.appendChild(this.iconBox);
        this.el.appendChild(this.progressBox);
    }

    initEvent() {
        let width = this.completedBox.clientWidth
        this.player.on(EVENT.MOVE_VERTICAL,(e: MoveEvent) => {
            if(this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = null;
            this.el.style.display = "";
            let dy = e.deltaY;
            let scale = ( width + (-dy)) / this.progressBox.clientWidth;
            if(scale < 0) {
                scale = 0;
            } else if(scale > 1) {
                scale = 1;
            }
            this.completedBox.style.width = scale * 100 + "%";
            this.player.video.volume = scale;
        })

        this.player.on(EVENT.SLIDE_VERTICAL,(e: SwipeEvent) => {
            width = this.completedBox.clientWidth;
            this.timer = window.setTimeout(()=>{
                this.el.style.display = "none";
            },600)
        })

        this.player.on(EVENT.VIDEO_CLICK,()=>{
            this.el.style.display = "none";
        })
    }
}