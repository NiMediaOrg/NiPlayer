import { SingleTapEvent, wrap } from "ntouch.js";
import { Component } from "@/class/Component"
import { Player } from "@/page/player";
import { ComponentItem, DOMProps,Node } from "@/types/Player";
import { $, addClass, createSvg } from "@/utils/domUtils";
import { storeControlComponent } from "@/utils/store";
import { pausePath, playPath } from "@/svg/index";

export class PlayButton extends Component implements ComponentItem {
    readonly id = "PlayButton";
    private pauseIcon: SVGSVGElement | string;
    private playIcon: SVGSVGElement | string;
    private iconBox: HTMLElement;
    private button: SVGSVGElement;
    props: DOMProps;
    player: Player;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container,desc,props,children);
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
        addClass(this.el,["video-start-pause","video-controller"]);
        this.iconBox = $("div.video-icon");
        this.el.appendChild(this.iconBox);
        this.pauseIcon = createSvg(pausePath);
        this.playIcon = createSvg(playPath);
        this.button = this.playIcon as SVGSVGElement;
        this.iconBox.appendChild(this.button);
    }

    initEvent() {
        this.player.on("play",(e:Event) => {
            this.iconBox.removeChild(this.button);
            this.button = this.pauseIcon as SVGSVGElement;
            this.iconBox.appendChild(this.button);
        })

        this.player.on("pause",(e:Event) => {
            this.iconBox.removeChild(this.button);
            this.button = this.playIcon as SVGSVGElement;
            this.iconBox.appendChild(this.button);
        })
        this.onClick = this.onClick.bind(this);
        if(this.player.env === "Mobile") {
            this.initMobileEvent()
        } else {
            this.initPCEvent()
        }
    }

    initPCEvent(): void {
        this.el.onclick = this.onClick;
    }

    initMobileEvent(): void {
        wrap(this.el).addEventListener("singleTap",this.onClick,{stopPropagation:true});
    }

    onClick(e: Event | SingleTapEvent) {
        if(e instanceof Event) {
            e.stopPropagation();
        }
        if(this.player.video.paused) {
            this.player.video.play();
        } else {
            this.player.video.pause();
        }
    }

    resetEvent() {
        this.onClick = this.onClick.bind(this);
        this.el.onclick = null;
        this.el.onclick = this.onClick;
    }
}
