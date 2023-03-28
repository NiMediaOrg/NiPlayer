import { Component } from "@/class/Component";
import { Player } from "@/page/player";
import { ComponentItem } from "@/types/Player";
import { EVENT } from "@/events";
import { $, getDOMPoint } from "@/utils/domUtils";
import { SingleTapEvent, wrap } from "ntouch.js";

export class Progress extends Component implements ComponentItem {
  id = "Progress";
  player: Player;
  dot: HTMLElement;
  completedProgress: HTMLElement;
  bufferProgress: HTMLElement;
  mouseX: number = 0;
  dotLeft: number = 0;
  constructor(
    player: Player,
    container?: HTMLElement,
    desc?: string,
  ) {
    super(container, desc);
    this.player = player;
    this.initBase();
  }

  initBase() {
    this.initBaseTemplate();
    this.initBaseEvent()
    
  }

  initBaseTemplate() {
    this.dot = $("div");
    this.completedProgress = $("div");
    this.bufferProgress = $("div");

    this.el.append(this.dot,this.completedProgress,this.bufferProgress);
  }

  initBaseEvent() {
    this.onMouseMove = this.onMouseMove.bind(this);
    if(this.player.env === "PC") {
      this.initBasePCEvent();
    } else {
      this.initBaseMobileEvent()
    }

    this.on(EVENT.PROGRESS_CLICK, (dx: number, ctx: Progress) => {
      let scale = dx / this.el.clientWidth;
      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }
      this.dot.style.left = scale * 100 + "%";
      this.completedProgress.style.width = scale * 100 + "%";
    })

    this.on(EVENT.DOT_DRAG,(dx: number, ctx: Progress) => {
      let scale = (dx + this.dotLeft) / this.el.clientWidth;
      if (scale < 0) {
        scale = 0;
      } else if (scale > 1) {
        scale = 1;
      }
      this.dot.style.left = scale * 100 + "%";
      this.completedProgress.style.width = scale * 100 + "%";
    })
  }

  initBasePCEvent() {
    let ctx = this;
    
    this.el.onmouseenter = (e: Event) => {
      this.emit(EVENT.PROGRESS_MOUSE_ENTER, e, ctx)
    };

    this.el.onmouseleave = (e: Event) => {
      this.emit(EVENT.PROGRESS_MOUSE_LEAVE,e, ctx);
    };

    this.el.onclick = (e: MouseEvent) => {
      e.stopPropagation();
      this.emit(EVENT.PROGRESS_CLICK ,e.offsetX, ctx)
    };

    this.dot.addEventListener("mousedown",(e: MouseEvent) => {
      e.stopPropagation();
      this.emit(EVENT.DOT_DOWN);
      this.mouseX = e.pageX;
      document.body.addEventListener("mousemove", ctx.onMouseMove);

      document.body.onmouseup =  (e: MouseEvent) => {
        this.emit(EVENT.DOT_UP, this.completedProgress.clientWidth / this.el.clientWidth, ctx);
        document.body.removeEventListener("mousemove", ctx.onMouseMove);
        document.body.onmouseup = null;
      };
    })
  }

  initBaseMobileEvent() {
    let ctx = this;
    wrap(this.el).addEventListener("singleTap",(e: SingleTapEvent) => {
      let dx = e.e.touches[0].clientX - getDOMPoint(this.el).x;
      this.emit(EVENT.PROGRESS_CLICK, dx, ctx);
    })

    wrap(this.dot).addEventListener("touchstart",(e: TouchEvent) => {
      e.preventDefault();
      this.emit(EVENT.DOT_DOWN);
      this.mouseX = e.touches[0].clientX;
      this.dotLeft = parseInt(this.el.style.left);

      document.body.addEventListener("touchmove",this.onMouseMove);

      document.body.ontouchend = (e: TouchEvent) => {
        this.emit(EVENT.DOT_UP, this.completedProgress.clientWidth / this.el.clientWidth, ctx);
        document.body.removeEventListener("touchmove",this.onMouseMove);
        document.body.ontouchend = null;
      }
    })
  }

  onMouseMove(e: MouseEvent | TouchEvent) {
    if(e instanceof MouseEvent) {
      let dx = e.pageX - this.mouseX;
      this.emit(EVENT.DOT_DRAG, dx, this)
    } else {
      let dx = e.touches[0].clientX - this.mouseX;
      this.emit(EVENT.DOT_DRAG, dx, this)
    }
  }
}
