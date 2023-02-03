import { Component } from "../../class/Component";
import {
  Node,
  ComponentItem,
  DOMProps,
  Player,
} from "../../index";
import { $, addClass, includeClass, removeClass } from "../../utils/domUtils";
import { storeControlComponent } from "../../utils/store";
import "./topbar.less";

export class TopBar extends Component implements ComponentItem {
  readonly id: string = "TopBar";
  leftArea: HTMLElement;
  rightArea: HTMLElement;
  props: DOMProps;
  player: Player;
  private timer: number = 0;
  // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
  constructor(player:Player, container:HTMLElement, desc?: string, props?:DOMProps, children?:Node[]) {
    super(container,desc,props,children);
    this.player = player;
    this.props = props || {};
    this.init();
  }

  init() {
    this.initTemplate();
    this.initComponent();
    this.initEvent();
    storeControlComponent(this);
  }

  /**
   * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
   */
  initTemplate() {
    addClass(this.el,["video-topbar","video-topbar-hidden"]);
    this.leftArea = $("div.video-topbar-left")
    this.rightArea = $("div.video-topbar-right")
    this.el.appendChild(this.leftArea)
    this.el.appendChild(this.rightArea)
  }


  initComponent() {
    
  }

  initEvent() {
    this.player.on("showtoolbar",(e)=>{
      this.onShowToolBar(e);
    })

    this.player.on("hidetoolbar",(e)=>{
      this.onHideToolBar(e);
    })
  }

  private hideToolBar() {
    if(!includeClass(this.el,"video-topbar-hidden")) {
      addClass(this.el,["video-topbar-hidden"]);
    }
  }

  private showToolBar(e:MouseEvent) {
    if(includeClass(this.el,"video-topbar-hidden")) {
      removeClass(this.el,["video-topbar-hidden"]);
    }

    if(e.target === this.player.video) {
      this.timer = window.setTimeout(()=>{
        this.hideToolBar();
      },3000)
    }
  }

  onShowToolBar(e:MouseEvent) {
    if(this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.showToolBar(e);
  }

  onHideToolBar(e:MouseEvent) {
    this.hideToolBar();
  }
}
