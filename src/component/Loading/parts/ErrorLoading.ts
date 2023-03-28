import { EVENT } from "@/events";
import { Player } from "@/page/player";
import { addClass } from "@/utils/domUtils";
import { Loading } from "../Loading";

export class ErrorLoading extends Loading {
    readonly id = "errorloading";
    constructor(player:Player,msg:string,container:HTMLElement) {
        super(player,msg,container);
        addClass(this.loadingBox,["video-loading-errorloading"]);
        this.initEvent();
    }

    initEvent(): void {
        this.player.on(EVENT.ERROR,() => {
            this.addLoading();
        })

        this.player.on(EVENT.CAN_PLAY,() => {
            this.removeLoading();
        })
    }
}