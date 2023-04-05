import { MoveEvent, SwipeEvent } from "ntouch.js";
import { EVENT } from "@/events";
import { Player } from "@/page/player";
import { Thumbnails } from "@/types/Player";
import { formatTime, getDOMPoint } from "@/utils";
import { $, addClass, removeClass } from "@/utils/domUtils";
import { Progress } from "@/component/Progress/Progress";

export class VideoProgress extends Progress {
  readonly id = "VideoProgress";
  private preTime: HTMLElement;
  private thumbnails: HTMLElement;
  private thumbnailsOptions: Thumbnails | null = null;
  private currentIndex: number | null = null;
  constructor(player: Player, container?: HTMLElement, desc?: string) {
    super(player, container, desc);

    this.init();
  }

  init(): void {
    this.initTemplate();
    this.initEvent();

    if (this.thumbnailsOptions) {
      this.initThumbnails();
    }
  }

  initTemplate(): void {
    if (this.player.playerOptions.thumbnails) {
      this.thumbnailsOptions = Object.assign(
        {
          width: 160,
          height: 90,
          margin: 0,
        },
        this.player.playerOptions.thumbnails
      )
      this.thumbnails = $("div.video-progress-thumbnails");
      this.thumbnails.style.height = this.thumbnailsOptions.height + "px";
      this.thumbnails.style.width = this.thumbnailsOptions.width + "px";
    }
    this.preTime = $("div.video-progress-pretime");
    
    this.el.append(this.preTime);
    this.thumbnails && this.el.append(this.thumbnails);
    addClass(this.el, ["video-progress"]);
    addClass(this.dot, ["video-progress-dot", "video-progress-dot-hidden"]);
    addClass(this.completedProgress, ["video-progress-completed"]);
  }

  initEvent(): void {
    if (this.player.env === "PC") {
      this.initPCEvent();
    } else {
      this.initMobileEvent();
    }

    this.on(EVENT.DOT_DRAG, (dx: number, ctx: Progress) => {
      let scale = (dx + this.dotLeft) / this.el.clientWidth;
      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }

      this.player.emit(EVENT.VIDEO_DOT_DRAG, scale);
    });

    this.on(EVENT.DOT_DOWN, () => {
      this.dotLeft =
        (parseInt(this.dot.style.left) / 100) * this.el.clientWidth;
      this.player.emit(EVENT.DOT_DOWN);
    });

    this.on(EVENT.DOT_UP, (scale: number) => {
      this.player.emit(EVENT.DOT_UP);
      this.dotLeft = this.el.clientWidth * scale;
      this.player.video.currentTime = scale * this.player.video.duration;
    });

    this.player.video.addEventListener("timeupdate", (e) => {
      if (this.player.enableSeek) {
        let scale = this.player.video.currentTime / this.player.video.duration;
        this.dot.style.left = scale * 100 + "%";
        this.completedProgress.style.width = scale * 100 + "%";
      }
    });
  }

  initPCEvent(): void {
    this.el.addEventListener("mouseenter", (e: MouseEvent) => {
      this.preTime.style.display = "block";
      if(this.thumbnails) this.thumbnails.style.display = "block";
      let left = e.clientX - getDOMPoint(this.el).x;
      this.preTime.style.left = left - this.preTime.clientWidth / 2 + "px";
      let time = formatTime(
        (left / (e.currentTarget as HTMLElement).clientWidth) *
          this.player.video.duration
      );

      this.preTime.innerText = time;
    });

    this.el.addEventListener("mousemove", (e: MouseEvent) => {
      let left = e.clientX - getDOMPoint(this.el).x;
      let time = formatTime(
        (left / (e.currentTarget as HTMLElement).clientWidth) *
          this.player.video.duration
      );

      this.preTime.style.left = left - this.preTime.clientWidth / 2 + "px";
      this.preTime.innerText = time;

      if(this.thumbnails) {
        if (left - this.thumbnails.clientWidth / 2 >= 0) {
          this.thumbnails.style.left =
            left - this.thumbnails.clientWidth / 2 + "px";
        } else {
          this.thumbnails.style.left = 0 + "px";
        }
      }
    });

    this.el.addEventListener("mouseleave", () => {
      this.preTime.style.display = "";
      if(this.thumbnails) this.thumbnails.style.display = "";
    });

    this.on(EVENT.PROGRESS_CLICK, (dx: number, ctx: Progress) => {
      let scale = dx / this.el.clientWidth;
      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }
      this.player.video.currentTime = scale * this.player.video.duration;

      if (this.player.video.paused) {
        this.player.video.play();
      }
    });
    this.on(EVENT.PROGRESS_MOUSE_ENTER, () => {
      removeClass(this.dot, ["video-progress-dot-hidden"]);
    });

    this.on(EVENT.PROGRESS_MOUSE_LEAVE, () => {
      addClass(this.dot, ["video-progress-dot-hidden"]);
    });
  }

  initMobileEvent(): void {
    this.player.on(EVENT.MOVE_HORIZONTAL, (e: MoveEvent) => {
      let dx = e.deltaX;
      this.emit(EVENT.DOT_DRAG, dx, this);
    });

    this.player.on(EVENT.SLIDE_HORIZONTAL, (e: SwipeEvent) => {
      if (this.player.video.paused) {
        this.player.video.play();
      }
      let dx = e.endPos.x - e.startPos.x;
      let scale = (this.dotLeft + dx) / this.el.clientWidth;
      this.emit(EVENT.DOT_UP, scale);
    });
  }

  initThumbnails(): void {
    this.el.addEventListener("mousemove", (e: MouseEvent) => {
      let time =
        ((e.clientX - getDOMPoint(this.el).x) / this.el.clientWidth) *
        this.player.video.duration;
      let index = Math.floor(time / this.thumbnailsOptions.interval);
      if (
        this.currentIndex === null ||
        this.currentIndex !== index ||
        index >= this.thumbnailsOptions.total
      ) {
        this, (this.currentIndex = index);
        let y =
          Math.floor(index / this.thumbnailsOptions.col) *
            this.thumbnailsOptions.margin *
            2 +
          this.thumbnailsOptions.margin +
          index * this.thumbnailsOptions.height;
        let x =
          Math.floor(index % this.thumbnailsOptions.col) *
            this.thumbnailsOptions.margin *
            2 +
          this.thumbnailsOptions.margin +
          index * this.thumbnailsOptions.width;

        this.thumbnails.style.backgroundImage = `url(${this.thumbnailsOptions.source})`;
        this.thumbnails.style.backgroundPositionX = `-${x}px`;
        this.thumbnails.style.backgroundPositionY = `-${y}px`;
      }
    });
  }
}
