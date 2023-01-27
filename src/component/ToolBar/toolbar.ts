import { Component } from "../../class/Component";
import {
  Node,
  ComponentItem,
  DOMProps,
  Player,
  Progress,
  Controller,
} from "../../index";
import { addClass, includeClass, removeClass } from "../../utils/domUtils";
import { storeControlComponent } from "../../utils/store";
import "./toolbar.less";

export class ToolBar extends Component implements ComponentItem {
  readonly id: string = "Toolbar";
  props: DOMProps;
  player: Player;
  progress: Progress;
  controller: Controller;
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
    addClass(this.el,["video-controls","video-controls-hidden"]);
  }

  initComponent() {
    this.progress = new Progress(this.player,this.el,"div.video-progress");
    this.controller = new Controller(this.player,this.el,"div.video-play");
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
    if(!includeClass(this.el,"video-controls-hidden")) {
      addClass(this.el,["video-controls-hidden"]);
    }
  }

  private showToolBar(e:MouseEvent) {
    if(includeClass(this.el,"video-controls-hidden")) {
      removeClass(this.el,["video-controls-hidden"]);
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
