import { SingleTapEvent } from "ntouch.js";
import { Component } from "../../class/Component";
import { EVENT } from "../../events";
import { Node, ComponentItem, DOMProps } from "../../index";
import { Player } from "../../page/player";
import { $, addClass, includeClass, removeClass } from "../../utils/domUtils";
import { storeControlComponent } from "../../utils/store";

export class TopBar extends Component implements ComponentItem {
  readonly id: string = "TopBar";
  leftArea: HTMLElement;
  rightArea: HTMLElement;
  props: DOMProps;
  player: Player;
  private timer: number = 0;
  // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children);
    this.player = player;
    this.props = props || {};
    this.init();
  }

  init() {
    this.initTemplate();
    this.initEvent();
    storeControlComponent(this);
  }

  /**
   * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
   */
  initTemplate() {
    addClass(this.el, ["video-topbar", "video-topbar-hidden"]);
    this.leftArea = $("div.video-topbar-left");
    this.rightArea = $("div.video-topbar-right");
    this.el.appendChild(this.leftArea);
    this.el.appendChild(this.rightArea);
  }

  initEvent() {
    this.player.on(EVENT.SHOW_TOOLBAR, (e: SingleTapEvent | Event) => {
      this.onShowToolBar(e);
    });

    this.player.on(EVENT.HIDE_TOOLBAR, (e) => {
      this.onHideToolBar();
    });
  }

  private hideToolBar() {
    if (!includeClass(this.el, "video-topbar-hidden")) {
      addClass(this.el, ["video-topbar-hidden"]);
    }
  }

  private showToolBar(e: Event | SingleTapEvent) {
    if (includeClass(this.el, "video-topbar-hidden")) {
      removeClass(this.el, ["video-topbar-hidden"]);
    }
    let target;
    if (e instanceof Event) target = e.target;
    else target = (e as SingleTapEvent).e.target;

    if (target === this.player.video) {
      this.timer = window.setTimeout(() => {
        this.hideToolBar();
      }, 3000);
    }
  }

  onShowToolBar(e: Event | SingleTapEvent) {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.showToolBar(e);
  }

  onHideToolBar() {
    this.hideToolBar();
  }
}
