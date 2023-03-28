import { Options } from "./Options";
import { Player } from "@/page/player";
import { DOMProps, Node } from "@/types/Player";
import { $, addClass, createSvg, getDOMPoint } from "@/utils/domUtils";
import { volumePath$1 } from "@/svg";
import { storeControlComponent } from "@/utils/store";
import { EVENT } from "@/events";

export class Volume extends Options {
    readonly id = "Volume";
    volumeProgress: HTMLElement;
    volumeShow: HTMLElement;
    volumeCompleted: HTMLElement;
    volumeDot: HTMLElement;
    volume: number = 0.5;
    mouseY: number = 0;
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
        this.volumeProgress.appendChild(this.volumeCompleted);
        this.hideBox.appendChild(this.volumeShow);
        this.hideBox.appendChild(this.volumeProgress);
        this.volumeDot = $("div.video-volume-dot");
        this.volumeProgress.appendChild(this.volumeDot);
        this.icon = createSvg(volumePath$1);
        this.iconBox.appendChild(this.icon);
        this.player.video.volume = this.volume;
    }

    initEvent() {
        this.player.on(EVENT.VOLUME_PROGRESS_CLICK,(e: MouseEvent,ctx: Volume) => {
            let eoffsetY = e.clientY - getDOMPoint(this.volumeProgress).y;
            let offsetY = this.volumeProgress.clientHeight - eoffsetY;
            let scale = offsetY / this.volumeProgress.clientHeight;
            if (scale < 0) {
                scale = 0;
            } else if (scale > 1) {
                scale = 1;
            }
            this.volumeCompleted.style.height = scale * 100 + "%";
            this.volumeDot.style.top = (1 - scale) * this.volumeProgress.clientHeight  + "px";
            this.volume = scale;
            this.volumeShow.innerText = Math.round(this.volume * 100) + "";
            this.player.video.volume = this.volume;
        })

        this.volumeProgress.onclick = (e: MouseEvent) => {
            e.stopPropagation();
            this.player.emit(EVENT.VOLUME_PROGRESS_CLICK,e,this);
        }

        this.volumeDot.onmousedown = (e: MouseEvent) => {
            e.stopPropagation();
           this.mouseY = e.pageY;
           let top = parseInt(getComputedStyle(this.volumeDot).top)
           document.body.onmousemove = (e: MouseEvent) => {
                e.preventDefault();
                let dy = top + e.pageY - this.mouseY;
                console.log(dy);
                let scale = (this.volumeProgress.clientHeight - dy) / this.volumeProgress.clientHeight
                if(scale < 0) {
                    scale = 0;
                } else if(scale > 1) {
                    scale = 1;
                }
                this.volumeDot.style.top = (1 - scale) * this.volumeProgress.clientHeight  + "px";
                this.volumeCompleted.style.height = scale * 100 + "%";
                this.volumeShow.innerText = Math.round(scale * 100) + "";
                this.player.video.volume = scale;
                this.volume = scale;
            }

            document.body.onmouseup = (e) => {
                document.body.onmousemove = null;
                document.body.onmouseup = null;
            }
        }
    }
}