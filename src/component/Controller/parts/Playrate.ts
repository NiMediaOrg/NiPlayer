import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { $, addClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
/**
 * @description 播放速率的类
 */
export class Playrate extends Options {
    readonly id = "Playrate";
    constructor(player: Player,container: HTMLElement, desc?: string, props?: DOMProps,children?: Node[]) {
        super(player,container,0,0,desc);
        this.init();
    }

    init() {
        this.initTemplate()
        storeControlComponent(this);
    }

    initTemplate() {
        this.el["aria-label"] = "播放倍速"
        addClass(this.el,["video-playrate","video-controller"])

        this.el.removeChild(this.iconBox);
        this.iconBox = $("span",null,"倍速");
        this.el.appendChild(this.iconBox);

        this.el.removeChild(this.hideBox);
        this.hideBox = $("ul",{style:{bottom: "41px"},"aria-label":"播放速度调节"});
        addClass(this.hideBox,["video-playrate-set"]);
        this.el.appendChild(this.hideBox);

        for(let i = 0; i < 6; i++) {
            let li = $("li");
            li.innerText = "2.0x";
            this.hideBox.appendChild(li);
        }
    }   
}