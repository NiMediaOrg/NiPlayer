import {
  ComponentItem,
  DOMProps,
  PlayerOptions,
  ToolBar,
} from "../index";
import "./player.less";
import "../main.less";
import { Component } from "../class/Component";
import { $, patchComponent } from "../utils/domUtils";
import { Plugin } from "../index";
import { CONTROL_COMPONENT_STORE } from "../utils/store";
class Player extends Component implements ComponentItem {
  readonly id = "Player";
  // 播放器的默认配置
  readonly playerOptions = {
    url: "",
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  video: HTMLVideoElement;
  toolBar: ToolBar;
  container: HTMLElement;
  props: DOMProps;
  constructor(options: PlayerOptions) {
    super(options.container,"div.video-wrapper");
    this.playerOptions = Object.assign(this.playerOptions, options);
    options.container.className = "video-container";
    options.container.style.width = this.playerOptions.width + "px";
    options.container.style.height = this.playerOptions.height + "px"
    this.container = options.container;
    this.init();
  }

  init() {
    this.video = $("video");
    this.video.src = this.playerOptions.url || "";
    this.el.appendChild(this.video);
    this.toolBar = new ToolBar(this, this.el, "div");
    this.initEvent();
  }

  initEvent() {
    this.el.onmousemove = (e) => {
      this.emit("showtoolbar",e);
    }

    this.el.onmouseenter = (e) => {
      this.emit("showtoolbar",e);
    }

    this.el.onmouseleave = (e) => {
      this.emit("hidetoolbar",e);
    }

    this.video.onloadedmetadata = (e) => {
      this.emit("loadedmetadata",e);
    }

    this.video.ontimeupdate = (e) => {
      this.emit("timeupdate",e);
    }

    this.video.onplay = (e) => {
      this.emit("play",e);
    }

    this.video.onpause = (e) => {
      this.emit("pause",e);
    }

    this.on("progress-click",(e,ctx)=>{
      let scale = e.offsetX / ctx.el.offsetWidth;
      if (scale < 0) {
          scale = 0;
      } else if (scale > 1) {
          scale = 1;
      }
      this.video.currentTime = Math.floor(scale * this.video.duration);
      this.video.paused && this.video.play();
    })
  }

  attendSource(url: string) {
    this.video.src = url;
  }

  registerControls(id:string, component:Partial<ComponentItem>) {
    let store = CONTROL_COMPONENT_STORE;
    console.log(store,id)
    if(store.has(id)) {
      patchComponent(store.get(id),component);
    } else {

    }
  }

  /**
   * @description 注册对应的组件
   * @param plugin 
   */
  use(plugin: Plugin) {
    plugin.install(this);
  }
}

export { Player };
