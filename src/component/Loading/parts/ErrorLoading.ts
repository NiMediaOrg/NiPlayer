import { Player } from "../../../page/player";
import { addClass } from "../../../utils/domUtils";
import { Loading } from "../Loading";

export class ErrorLoading extends Loading {
    readonly id = "errorloading";
    constructor(player:Player, msg:string, container:HTMLElement) {
        super(player, msg, container);
        addClass(this.loadingBox,["video-loading-errorloading"]);
        this.initEvent();
    }

    initEvent(): void {
        this.player.on("videoError",(e) => {
            this.addLoading();
        })

        this.player.on("canplay",(e) => {
            this.removeLoading();
        })
    }
}