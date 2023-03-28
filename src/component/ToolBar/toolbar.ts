import { MoveEvent, SingleTapEvent } from "ntouch.js";
import { Component } from "@/class/Component";
import { EVENT } from "@/events";
import {
  Node,
  ComponentItem,
  DOMProps,
  Controller,
} from "@/index";
import { Player } from "@/page/player";
import { addClass, includeClass, removeClass } from "@/utils/domUtils";
import { storeControlComponent } from "@/utils/store";
import { MediumBar } from "./MediumBar/MediumBar";

export class ToolBar extends Component implements ComponentItem {
  readonly id: string = "Toolbar";
  props: DOMProps;
  player: Player;
  mediumbar: MediumBar;
  controller: Controller;
  status: "show" | "hidden" = "hidden";
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
    addClass(this.el,["video-toolbar"]);
  }

  initComponent() {
    this.mediumbar = new MediumBar(this.player,this.el,"div.video-mediumbar");
    this.controller = new Controller(this.player,this.el,"div.video-bottombar");
  }

  initEvent() {
    this.player.on(EVENT.SHOW_TOOLBAR, ()=>{
      this.onShowToolBar();
    })

    this.player.on(EVENT.HIDE_TOOLBAR, ()=>{
      this.onHideToolBar();
    })
  }

  private hideToolBar() {
    if(!includeClass(this.el,"video-toolbar-hidden") && !this.player.video.paused) {
      addClass(this.el,["video-toolbar-hidden"]);
      this.status = "hidden";
    }
  }

  private showToolBar() {
    if(includeClass(this.el,"video-toolbar-hidden")) {
      removeClass(this.el,["video-toolbar-hidden"]);
      this.status = "show";
    }

    this.timer = window.setTimeout(()=>{
      if(!this.player.video.paused) this.hideToolBar();
    },3000)
    
  }

  onShowToolBar() {
    if(this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.showToolBar();
  }

  onHideToolBar() {
    this.hideToolBar();
  }
}
