import { Component } from "../../../class/Component"
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps,Node } from "../../../types/Player";
import { addClass } from "../../../utils/domUtils";
import { formatTime } from "../../../utils/format";
import { storeControlComponent } from "../../../utils/store";

export class DutaionShow extends Component implements ComponentItem {
    readonly id = "DurationShow";
    player:Player;
    props:DOMProps;
    currentTime: string = "00:00";
    totalTime: string = "00:00";
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container,desc,props,children);
        this.player = player;
        this.props = props || {};
        this.init();
    }

    init() {
        this.initTemplate()
        this.initEvent()
        storeControlComponent(this);
    }

    initTemplate() {
        addClass(this.el,["video-duration-time","video-controller"]);
        this.el.innerText = `${this.currentTime}/${this.totalTime}`;
    }

    initEvent() {
        this.player.on("loadedmetadata",(e)=>{
            let video = e.target as HTMLVideoElement;
            console.log(video.duration)
            this.totalTime = formatTime(video.duration);
            this.el.innerText = `${this.currentTime}/${this.totalTime}`;
        })

        this.player.on("timeupdate",(e: Event)=>{
            let video = e.target as HTMLVideoElement;
            this.currentTime = formatTime(video.currentTime);
            this.el.innerText = `${this.currentTime}/${this.totalTime}`;
        })
    }
}