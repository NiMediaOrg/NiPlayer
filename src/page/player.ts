import {
  ComponentItem,
  DOMProps,
  PlayerOptions,
  RegisterComponentOptions,
  ToolBar,
  UpdateComponentOptions,
} from "../index";
import "./player.less";
import { Component } from "../class/Component";
import { $, patchComponent } from "../utils/domUtils";
import { Plugin } from "../index";
import { COMPONENT_STORE, ONCE_COMPONENT_STORE } from "../utils/store";
import { getFileExtension } from "../utils/play";
import  MpdMediaPlayerFactory  from "../dash/MediaPlayer";
import Mp4MediaPlayer from "../mp4/MediaPlayer";
import { TimeLoading } from "../component/Loading/parts/TimeLoading";
import { ErrorLoading } from "../component/Loading/parts/ErrorLoading";
import { TopBar } from "../component/TopBar/TopBar";
class Player extends Component implements ComponentItem {
  readonly id = "Player";
  // 播放器的默认配置
  readonly playerOptions:PlayerOptions = {
    url: "",
    container: document.body,
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  video: HTMLVideoElement;
  container: HTMLElement;
  props: DOMProps;
  toolBar: ToolBar;
  topbar: TopBar;
  loading: TimeLoading;
  error: ErrorLoading;
  enableSeek = true;
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
    this.attachSource(this.playerOptions.url);
    this.initEvent();
    this.initPlugin();
    this.initComponent();
    this.initResizeObserver();
  }

  initComponent(): void {
    //  new DanmakuController(this);
     this.loading = new TimeLoading(this,"视频加载中，请稍等....",this.el);
     this.error = new ErrorLoading(this,"视频加载发送错误",this.el);
     this.toolBar = new ToolBar(this, this.el, "div");
     this.topbar = new TopBar(this,this.el,"div");
  }

  initResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      console.log('监听到了尺寸变化了...');
      let width = entries[0].contentRect.width;
      
      if(width <= 400) {
        console.log(width)
        COMPONENT_STORE.forEach((value,key)=>{
          if(["Playrate","SubSetting","VideoShot","ScreenShot","PicInPic"].includes(key)) {
            this.unmountComponent(key);
            this.mountComponent(key,ONCE_COMPONENT_STORE.get(key),{
              mode:{
                type:"TopToolBar",
                pos: "right"
              }
            })
          }
        })
        
      }
    })
    
    resizeObserver.observe(this.el);
  }

  initEvent() {
    this.video.onclick = (e) => {
      if(this.video.paused) {
        this.video.play();
      } else if(this.video.played) {
        this.video.pause();
      }
    }
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

    this.video.addEventListener("timeupdate",(e)=>{
      this.emit("timeupdate",e);
    })


    this.video.onplay = (e) => {
      this.emit("play",e);
    }

    this.video.onpause = (e) => {
      this.emit("pause",e);
    }

    this.video.addEventListener("seeking",(e) => {
      if(this.enableSeek) {
        this.emit("seeking",e);
      }
    })

    this.video.addEventListener("waiting",(e) => {
      this.emit("waiting",e);
    })

    this.video.addEventListener("canplay",(e) => {
      this.emit("canplay",e);
    })

    this.video.addEventListener("error", (e) => {
      this.emit("videoError");
    })

    this.video.addEventListener("abort", (e) => {
      this.emit("videoError")
    })

    this.video.addEventListener("ratechange",(e) => {
      this.emit("ratechange");
    })


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

    this.on("inputFocus",() => {
      this.el.onmouseleave = null;
    })

    this.on("inputBlur",() => {
      this.el.onmouseleave = (e) => {
        this.emit("hidetoolbar",e);
      }
    })

    this.on("dotdown",()=>{
      console.log("dotdown")
      this.enableSeek = false;
    })
    this.on("dotup",() => {
      console.log("dotup")
      this.enableSeek = true;
    })
  }

  initPlugin() {
    if(this.playerOptions.plugins) {
      this.playerOptions.plugins.forEach(plugin=>{
        this.use(plugin);
      })
    }
  }

  initMp4Player(url: string) {
    new Mp4MediaPlayer(this.playerOptions.url,this);
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
        break;
      case "mpd":
        this.initMpdPlayer(url);
        break;
      case "m3u8":
        // ToDo
    }
  }

  // 注册/挂载自己的组件,其中的id为组件实例的名称，分为内置和用户自定义这两种情况；注意，id是唯一的，不能存在两个具有相同id的组件实例!!!
  mountComponent(id: string, component: ComponentItem, options?: RegisterComponentOptions) {
    if(COMPONENT_STORE.has(id)) {
      throw new Error("无法挂载一个已经存在于视图上的组件，请先将其卸载或者删除")
    }
    COMPONENT_STORE.set(id,component);
    ONCE_COMPONENT_STORE.set(id,component);
    if(!options) {
      if(!component.container) throw new Error("必须传入Options选项或者传入的组件实例中需要有container选项");
      component.container.appendChild(component.el);
    } else {
      let mode = options.mode;
      if(mode.type === "BottomToolBar") {
        if(mode.pos === "left") {
          this.toolBar.controller.leftArea.appendChild(component.el);
          
        } else if(mode.pos === "right") {
          this.toolBar.controller.rightArea.appendChild(component.el);
        } else if(mode.pos === "medium") {
          this.toolBar.controller.mediumArea.appendChild(component.el);
        }
      } else if(mode.type === "TopToolBar") {
        if(mode.pos === "left") {
          this.topbar.leftArea.appendChild(component.el)
        } else {
          this.topbar.rightArea.appendChild(component.el);
        }
      }
      component.container = component.el.parentElement;
    }
  }

  // 更新一个已经挂载到视图层上的组件
  updateComponent(id:string, component:Partial<ComponentItem>,options:UpdateComponentOptions) {
    if(!COMPONENT_STORE.get(id)) {
      throw new Error("该组件不存在或者已经被卸载")
    }
    patchComponent(COMPONENT_STORE.get(id), component,options);
  }

  //卸载某一个component组件，所谓卸载一个组件指的是仅仅将其DOM元素从视图上移除，但是不会删除其实例对象，还可以继续挂载
  unmountComponent(id: string) {
    if(!COMPONENT_STORE.has(id)) {
      throw new Error("该组件不存在或者已经被卸载")
    }
    let instance = COMPONENT_STORE.get(id)
    instance.el.parentElement.removeChild(instance.el);
    COMPONENT_STORE.delete(id);
  }

  //彻底删除一个组件，也就是直接销毁组件实例，卸载组件仅仅是将其el元素从视图上移除，但任然保留组建的实例对象
  deleteComponent(id: string) {
    if(COMPONENT_STORE.has(id)) {
      this.unmountComponent(id);
    }
    ONCE_COMPONENT_STORE.delete(id);
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
