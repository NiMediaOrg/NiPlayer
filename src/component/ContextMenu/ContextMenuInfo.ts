import { Player } from "../../page/player";
import { $ } from "../../utils";

export class ContextMenuInfo {
    readonly id = "ContextMenuInfo";
    el: HTMLElement;
    container: HTMLElement;
    player: Player;
    constructor(player:Player, container: HTMLElement) {
        this.container = container;
        this.player = player;
        this.init();
    }   

    init(){
        this.initTemplate();
    }

    initTemplate() {
        this.el = $("div.video-context-menu-info");
        this.container.append(this.el);
    }
}