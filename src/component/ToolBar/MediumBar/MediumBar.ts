import { Component } from "@/class/Component";
import { Player } from "@/page/player";
import { ComponentItem } from "@/types/Player";
import { $ } from "@/utils/domUtils";
import { storeControlComponent } from "@/utils/store";
import { VideoProgress } from "./parts/VideoProgressBar";

export class MediumBar extends Component implements ComponentItem {
    readonly id = "MediumBar";
    leftArea: HTMLElement;
    mediumArea: HTMLElement;
    rightArea: HTMLElement;
    videoProgress: VideoProgress;
    player: Player;
    
    constructor(player: Player, container: HTMLElement, desc? :string) {
        super(container, desc);
        this.player = player;
        this.init()
    }

    init(): void {
        this.initTemplate();
        this.initComponent()
        storeControlComponent(this);
    }

    initTemplate(): void {
        this.leftArea = $("div.video-mediumbar-left");
        this.mediumArea = $("div.video-mediumbar-medium");
        this.rightArea = $("div.video-mediumbar-right");
        this.el.append(this.leftArea,this.mediumArea,this.rightArea);
    }

    initComponent(): void {
        this.videoProgress = new VideoProgress(this.player,this.el,"div");
        this.mediumArea.append(this.videoProgress.el)
    }
}