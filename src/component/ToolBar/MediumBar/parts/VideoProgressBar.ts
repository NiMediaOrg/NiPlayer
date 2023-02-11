import { EVENT } from "../../../../events";
import { Player } from "../../../../page/player";
import { addClass, removeClass } from "../../../../utils/domUtils";
import { Progress } from "../../../Progress/Progress";

export class VideoProgress extends Progress {
    readonly id = "VideoProgress";
    constructor(player:Player,container?:HTMLElement,desc?:string) {
        super(player,container,desc);

        this.init()
    }

    init(): void {
        this.initTemplate()
        this.initEvent();
    }

    initTemplate(): void {
        addClass(this.el,["video-progress"])
        addClass(this.dot,["video-progress-dot","video-progress-dot-hidden"])
        addClass(this.completedProgress,["video-progress-completed"])
    }

    initEvent(): void {
        this.on(EVENT.PROGRESS_CLICK,(dx: number, ctx: Progress) => {
            let scale = dx / this.el.clientWidth;
            if (scale < 0) {
                scale = 0;
              } else if (scale > 1) {
                scale = 1;
            }
            this.player.video.currentTime = scale * this.player.video.duration;

            if(this.player.video.paused) {
                this.player.video.play();
            }
        })

        this.on(EVENT.DOT_DRAG,(dx: number, ctx: Progress) => {
            let scale = (dx + this.dotLeft) / this.el.clientWidth;
            if (scale < 0) {
                scale = 0;
            } else if (scale > 1) {
                scale = 1;
            }

            this.player.emit(EVENT.VIDEO_DOT_DRAG, scale);
        })

        this.on(EVENT.PROGRESS_MOUSE_ENTER,() => {
            removeClass(this.dot,["video-progress-dot-hidden"])
        })

        this.on(EVENT.PROGRESS_MOUSE_LEAVE,() => {
            addClass(this.dot,["video-progress-dot-hidden"])
        })

        this.on(EVENT.DOT_DOWN,() => {
            this.player.emit(EVENT.DOT_DOWN)
        }) 

        this.on(EVENT.DOT_UP,(scale: number) => {
            this.player.emit(EVENT.DOT_UP)

            this.player.video.currentTime = scale * this.player.video.duration;
        })
    }

}