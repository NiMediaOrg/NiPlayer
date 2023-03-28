import { SingleTapEvent, wrap } from "ntouch.js";
import { Player } from "@/page/player";
import { DOMProps, Node } from "@/types/Player";
import { addClass, createSvg } from "@/utils/domUtils";
import { storeControlComponent } from "@/utils/store";
import { picInPicPath } from "@/svg";
import { Options } from "./Options";

export class PicInPic extends Options {
    readonly id = "PicInPic";
    constructor(player:Player,container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
        super(player, container,0,0, desc,props,children);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }

    initTemplate() {
        addClass(this.el,["video-picInpic","video-controller"])
        this.icon = createSvg(picInPicPath,"0 0 1024 1024");
        this.iconBox.appendChild(this.icon);

        this.hideBox.innerText = "画中画"
        this.hideBox.style.fontSize = "13px"
    }
    
    initEvent() {
        this.onClick = this.onClick.bind(this);
        if(this.player.env === "Mobile") {
            wrap(this.el).addEventListener("singleTap",this.onClick);
        } else {
            this.el.onclick = this.onClick;
        }
    }

    onClick(e: Event | SingleTapEvent) {
        if(e instanceof Event) {
            e.stopPropagation();
        }
        
        if (document.pictureInPictureElement) { // 当前画中画的元素
            document.exitPictureInPicture();
        } else {
            this.player.video.requestPictureInPicture() // 返回 Promise，里面是 pipWindow
        }
    }
}