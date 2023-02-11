import { MoveEvent, SwipeEvent } from "ntouch.js";
import { Component } from "../../../class/Component";
import { EVENT } from "../../../events";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
import {
  addClass
} from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { Progress } from "../Progress";
export class Dot extends Component implements ComponentItem {
  readonly id = "Dot";
  props: DOMProps;
  progress: Progress;
  player: Player;
  mouseX: number;
  left = 0;
  constructor(
    progress: Progress,
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children);
    this.progress = progress;
    this.player = player;
    this.init();
  }

  init() {
    addClass(this.el, ["progress-dot", "progress-dot-hidden"]);
    this.initEvent();

    storeControlComponent(this);
  }

  initEvent() {
    this.progress.on(
      EVENT.PROGRESS_CLICK,
      (e: MouseEvent, ctx: Progress) => {
        this.onChangePos(e, ctx);
      }
    );

    if (this.player.env === "PC") {
      this.initPCEvent();
    } else {
      this.initMobileEvent();
    }
  }

  initPCEvent(): void {
    this.el.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();
      this.onMouseMove = this.onMouseMove.bind(this);
      this.player.emit(EVENT.DOT_DOWN);
      this.progress.emit(EVENT.DOT_DOWN);
      this.mouseX = e.pageX;
      this.left = parseInt(this.el.style.left);
      document.body.addEventListener("mousemove", this.onMouseMove);

      document.body.onmouseup =  (e: MouseEvent) => {
        this.player.emit(EVENT.DOT_UP);
        this.progress.emit(EVENT.DOT_UP);
        document.body.removeEventListener("mousemove", this.onMouseMove);
        document.body.onmouseup = null;
      };
    });
  }

  initMobileEvent(): void {
    this.player.video.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.player.emit(EVENT.DOT_DOWN);
      this.progress.emit(EVENT.DOT_DOWN);
      this.left = parseInt(this.el.style.left);
    });

    this.player.on(EVENT.MOVE_HORIZONTAL, (e: MoveEvent) => {
      let scale = (this.left + e.deltaX) / this.container.clientWidth;

      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }
      this.el.style.left = scale * 100 + "%";
      this.player.emit(EVENT.DOT_DRAG, scale, e);
      this.progress.emit(EVENT.DOT_DRAG, scale, e);
    });

    this.player.on(EVENT.SLIDE_HORIZONTAL, (e: SwipeEvent) => {
      this.player.emit(EVENT.DOT_UP);
      this.progress.emit(EVENT.DOT_UP);
    });
  }

  onMouseMove(e: MouseEvent) {
    let scale =
      (e.pageX - this.mouseX + this.left) / this.container.clientWidth;
    if (scale < 0) {
      scale = 0;
    } else if (scale > 1) {
      scale = 1;
    }
    this.el.style.left = scale * 100 + "%";
    this.player.emit(EVENT.DOT_DRAG, scale, e);
    this.progress.emit(EVENT.DOT_DRAG, scale ,e);
  }

  onChangePos(e: MouseEvent, ctx: Component) {
    let scale = e.offsetX / ctx.el.clientWidth;
    if (scale < 0) {
      scale = 0;
    } else if (scale > 1) {
      scale = 1;
    }
    this.el.style.left = scale * 100 + "%";
  }
}
