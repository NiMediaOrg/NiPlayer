import { Component } from "@/class/Component";
import { EVENT } from "@/events";
import { Player } from "@/page/player";
import { ComponentItem, DOMProps, Node } from "@/types/Player";
import {
  $,
  addClass,
  checkIsMouseInRange,
  includeClass,
  removeClass,
} from "@/utils/domUtils";

export class Options extends Component implements ComponentItem {
  id = "Options";
  props: DOMProps;
  player: Player;
  hideWidth: number;
  hideHeight: number;
  hideBox: HTMLElement;
  iconBox: HTMLElement;
  icon: Element;
  bottom: number = 48;
  constructor(
    player: Player,
    container?: HTMLElement,
    hideWidth?: number,
    hideHeight?: number,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children);
    this.player = player;
    props ? (this.props = props) : (this.props = {});
    this.hideHeight = hideHeight;
    this.hideWidth = hideWidth;
    this.initBase();
  }

  initBase() {
    this.initBaseTemplate();
    this.initBaseEvent();
  }

  initBaseTemplate() {
    this.hideBox = $("div");
    addClass(this.hideBox, ["video-set", "video-set-hidden"]);
    if (this.hideHeight && this.hideHeight > 0) {
      this.hideBox.style.height = this.hideHeight + "px";
    }
    if (this.hideWidth && this.hideWidth > 0) {
      this.hideBox.style.width = this.hideWidth + "px";
    }

    this.el.appendChild(this.hideBox);

    this.iconBox = $("div");
    addClass(this.iconBox, ["video-icon"]);
    this.el.appendChild(this.iconBox);
  }

  initBaseEvent() {
    if(this.player.env === "PC") {
      this.initBasePCEvent();
    } else {
      this.initBaseMobileEvent();
    }
  }

  initBasePCEvent() {
    this.el.onmouseenter = (e) => {
      let ctx = this;
      removeClass(this.hideBox, ["video-set-hidden"]);
      document.body.onmousemove = ctx.handleMouseMove.bind(this);
      this.player.emit("oneControllerHover", this);
    };

    this.player.on("oneControllerHover", (controller: ComponentItem) => {
      if (this !== controller) {
        if (!includeClass(this.hideBox, "video-set-hidden")) {
          addClass(this.hideBox, ["video-set-hidden"]);
        }
      }
    });

    this.player.on(EVENT.VIDEO_CLICK, () => {
      addClass(this.hideBox, ["video-set-hidden"]);
    });
  }

  // 初始化基本的移动端事件
  initBaseMobileEvent() {

  }

  handleMouseMove(e: MouseEvent) {
    let pX = e.clientX,
      pY = e.clientY;
    let ctx = this;
    if (!checkIsMouseInRange(ctx.el, ctx.hideBox, this.bottom, pX, pY)) {
      addClass(this.hideBox, ["video-set-hidden"]);
      document.body.onmousemove = null;
    }
  }

  replaceIcon(icon: Element) {
    this.iconBox.removeChild(this.icon);
    this.iconBox.appendChild(icon);
    this.icon = icon;
  }
}
