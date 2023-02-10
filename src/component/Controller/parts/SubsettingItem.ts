import { Player } from "../../../page/player";
import { $ } from "../../../utils/domUtils";

export class SubsettingItem {
    el: HTMLElement;
    player: Player;
    msg: string;
    checkBox: HTMLInputElement;
    constructor(message: string,player:Player) {
        this.msg = message;
        this.player = player;
        this.init()
        this.initEvent()
    }
    init() {
        this.el = $("div.video-subsettings-item");
        let left = $("div.video-subsettings-itemleft")
        let right = $("div.video-subsettings-itemright")
        this.el.append(left,right);
        this.checkBox = $("input.video-subsettings-switch",{"type":"checkbox"})
        left.innerText = this.msg;
        right.appendChild(this.checkBox);
    }

    initEvent() {
        this.checkBox.addEventListener("change",(e) => {
            this.player.emit("checkBox",e, this.msg);
        })
    }
}