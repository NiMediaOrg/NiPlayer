import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { $, addClass, createSvg, getDOMPoint } from "../../../utils/domUtils";
import { volumePath$1 } from "../path/defaultPath";
import { storeControlComponent } from "../../../utils/store";
import { EVENT } from "../../../events";

export class Volume extends Options {
    readonly id = "Volume";
    volumeProgress: HTMLElement;
    volumeShow: HTMLElement;
    volumeCompleted: HTMLElement;
    volume: number = 0.5;
    constructor(player: Player,container: HTMLElement, desc?: string, props?: DOMProps,children?: Node[]) {
        super(player,container,0,0,desc);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();

        storeControlComponent(this);
    }

    initTemplate() {
        addClass(this.el,["video-volume","video-controller"])
        this.el["aria-label"] = "音量";
        addClass(this.hideBox,["video-volume-set"]);
        this.volumeProgress = $("div.video-volume-progress",{style:{height:"70px"}});
        this.volumeShow = $("div.video-volume-show");
        this.volumeShow.innerText = (this.volume * 100).toFixed(0);
        this.volumeCompleted = $("div.video-volume-completed");
        this.hideBox.appendChild(this.volumeShow);
        this.hideBox.appendChild(this.volumeProgress);
        this.icon = createSvg(volumePath$1);
        this.iconBox.appendChild(this.icon);
        this.player.video.volume = this.volume;
    }

    initEvent() {
        this.player.on(EVENT.VOLUME_PROGRESS_CLICK,(e: MouseEvent,ctx: Volume) => {
            let eoffsetY = e.pageY - getDOMPoint(this.volumeProgress).y;
            let offsetY = this.volumeProgress.clientHeight - eoffsetY;
            let scale = offsetY / this.volumeProgress.clientHeight;
            if (scale < 0) {
                scale = 0;
            } else if (scale > 1) {
                scale = 1;
            }
            this.volumeCompleted.style.height = scale * 100 + "%";
            this.volume = scale;
            this.volumeShow.innerText = (this.volume * 100).toFixed(0);
            this.player.video.volume = this.volume;
        })

        this.volumeProgress.onclick = (e) => {
            this.player.emit(EVENT.VOLUME_PROGRESS_CLICK,e,this);
        }
    }
}