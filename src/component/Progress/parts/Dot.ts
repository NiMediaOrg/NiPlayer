import { MoveEvent, SwipeEvent, wrap } from "ntouch.js";
import { Component } from "../../../class/Component";
import { EVENT } from "../../../events";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
import {
  addClass,
  getElementSize,
  includeClass,
  removeClass,
} from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { Progress } from "../Progress";
export class Dot extends Component implements ComponentItem {
  readonly id = "Dot";
  props: DOMProps;
  player: Player;
  container: HTMLElement;
  mouseX: number;
  left = 0;
  playScale = 0;
  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children);
    this.props = props || {};
    this.player = player;
    this.container = container;
    this.init();
  }

  init() {
    addClass(this.el, ["video-dot", "video-dot-hidden"]);
    this.initEvent();

    storeControlComponent(this);
  }

  initEvent() {
    this.player.on(EVENT.VIDEO_PROGRESS_MOUSE_ENTER, (e: MouseEvent) => {
      if (this.player.enableSeek) {
        this.onShowDot(e);
      }
    });

    this.player.on(EVENT.VIDEO_PROGRESS_MOUSE_LEAVE, (e: MouseEvent) => {
      if (this.player.enableSeek) {
        this.onHideDot(e);
      }
    });

    this.player.on(
      EVENT.VIDEO_PROGRESS_CLICK,
      (e: MouseEvent, ctx: Progress) => {
        this.onChangePos(e, ctx);
      }
    );

    this.player.on(EVENT.TIME_UPDATE, (e: Event) => {
      if (this.player.enableSeek) {
        this.updatePos(e);
      }
    });
    if (this.player.env === "PC") {
      this.initPCEvent();
    } else {
      this.initMobileEvent();
    }
  }

  initPCEvent(): void {
    this.el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.onMouseMove = this.onMouseMove.bind(this);
      this.player.emit(EVENT.DOT_DOWN);
      this.mouseX = e.pageX;
      this.left = parseInt(this.el.style.left);
      document.body.addEventListener("mousemove", this.onMouseMove);

      document.body.onmouseup =  (e) => {
        this.player.emit(EVENT.DOT_UP);
        this.player.video.currentTime = Math.floor(
          this.playScale * this.player.video.duration
        );
        document.body.removeEventListener("mousemove", this.onMouseMove);
        document.body.onmouseup = null;
      };
    });
  }

  initMobileEvent(): void {
    this.player.video.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.player.emit(EVENT.DOT_DOWN);
      this.left = parseInt(this.el.style.left);
    });

    this.player.video.addEventListener("touchend", (e) => {
      this.player.emit(EVENT.DOT_UP);
    });

    this.player.on(EVENT.MOVE_HORIZONTAL, (e: MoveEvent) => {
      let scale = (this.left + e.deltaX) / this.container.clientWidth;

      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }
      this.playScale = scale;
      this.el.style.left =
        this.container.clientWidth * scale -
        getElementSize(this.el).width / 2 +
        "px";

      if (this.player.video.paused) this.player.video.play();
      this.player.emit(EVENT.DOT_DRAG, scale, e);
    });

    this.player.on(EVENT.SLIDE_HORIZONTAL, (e: SwipeEvent) => {
      this.player.emit(EVENT.DOT_UP);
      this.player.video.currentTime = Math.floor(
        this.playScale * this.player.video.duration
      );
    });
  }

  onMouseMove(e: MouseEvent) {
    let scale =
      (e.pageX - this.mouseX + this.left) / this.container.offsetWidth;
    if (scale < 0) {
      scale = 0;
    } else if (scale > 1) {
      scale = 1;
    }
    this.playScale = scale;
    this.el.style.left =
      this.container.offsetWidth * scale -
      getElementSize(this.el).width / 2 +
      "px";

    if (this.player.video.paused) this.player.video.play();
    this.player.emit("dotdrag", scale, e);
  }

  onShowDot(e: MouseEvent) {
    if (includeClass(this.el, "video-dot-hidden")) {
      removeClass(this.el, ["video-dot-hidden"]);
    }
  }

  onHideDot(e: MouseEvent) {
    if (!includeClass(this.el, "video-dot-hidden")) {
      addClass(this.el, ["video-dot-hidden"]);
    }
  }

  onChangePos(e: MouseEvent, ctx: Component) {
    let scale = e.offsetX / ctx.el.offsetWidth;
    if (scale < 0) {
      scale = 0;
    } else if (scale > 1) {
      scale = 1;
    }
    this.el.style.left = e.offsetX - getElementSize(this.el).width / 2 + "px";
  }

  updatePos(e: Event) {
    let video = e.target as HTMLVideoElement;
    let scale = video.currentTime / video.duration;
    if (scale < 0) {
      scale = 0;
    } else if (scale > 1) {
      scale = 1;
    }
    this.el.style.left =
      scale * this.container.clientWidth -
      getElementSize(this.el).width / 2 +
      "px";
  }
}
