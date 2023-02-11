import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem } from "../../../types/Player";
import { $, addClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";

export class MediumBar extends Component implements ComponentItem {
    readonly id = "MediumBar";
    leftArea: HTMLElement;
    mediumArea: HTMLElement;
    rightArea: HTMLElement;

    player: Player;
    
    constructor(player: Player, container: HTMLElement, desc? :string) {
        super(container, desc);
        this.player = player;
        this.init()
    }

    init(): void {
        this.initTemplate();
        storeControlComponent(this);
    }

    initTemplate(): void {
        this.leftArea = $("div.video-mediumbar-left");
        this.mediumArea = $("div.video-mediumbar-medium");
        this.rightArea = $("div.video-mediumbar-right");
        this.el.append(this.leftArea,this.mediumArea,this.rightArea);
    }
}