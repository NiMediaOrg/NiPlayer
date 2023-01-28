import {
  ComponentItem,
  DOMProps,
  PlayerOptions,
  registerOptions,
  ToolBar,
} from "../index";
import "./player.less";
import "../main.less";
import { Component } from "../class/Component";
import { $, patchComponent } from "../utils/domUtils";
import { Plugin } from "../index";
import { CONTROL_COMPONENT_STORE } from "../utils/store";
import { getFileExtension } from "../utils/play";
import  MpdMediaPlayerFactory  from "../dash/MediaPlayer";
import Mp4MediaPlayer from "../mp4/MediaPlayer";
class Player extends Component implements ComponentItem {
  readonly id = "Player";
  // 播放器的默认配置
  readonly playerOptions:PlayerOptions = {
    url: "",
    container:document.body,
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
    options.container.style.width = this.playerOptions.width;
    options.container.style.height = this.playerOptions.height;
    this.container = options.container;
    this.init();
  }

  init() {
    this.video = $("video");
    this.el.appendChild(this.video);
    this.toolBar = new ToolBar(this, this.el, "div");
    this.attachSource(this.playerOptions.url);
    this.initEvent();
    this.initPlugin();
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

  initPlugin() {
    if(this.playerOptions.plugins) {
      this.playerOptions.plugins.forEach(plugin=>{
        this.use(plugin);
      })
    }
  }

  initMp4Player(url:string) {
    let player = new Mp4MediaPlayer(this.playerOptions.url,this.video);

  }

  initMpdPlayer(url:string) {
    let player = MpdMediaPlayerFactory().create();
    player.attachVideo(this.video);
    player.attachSource(url);
  }

  attachSource(url: string) {
    switch(getFileExtension(url)) {
      case "mp4":
      case "mp3":
        this.initMp4Player(url);
      case "mpd":
        this.initMpdPlayer(url);
      case "m3u8":
        // ToDo
    }
  }

  registerControls(id:string, component:Partial<ComponentItem> & registerOptions) {
    let store = CONTROL_COMPONENT_STORE;
    console.log(store,id)
    if(store.has(id)) {
      if(component.replaceElementType) {
        patchComponent(store.get(id),component,{replaceElementType:component.replaceElementType})
      } else {
        patchComponent(store.get(id),component);
      }
    } else {
      // 如果该组件实例是用户自创的话
      if(!component.el) throw new Error(`传入的原创组件${id}没有对应的DOM元素`)
      this.toolBar.controller.settings.appendChild(component.el);
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
