import {
  ComponentConstructor,
  ComponentItem,
  DanmakuController,
  DOMProps,
  FullScreen,
  getExtension,
  PlayerOptions,
  RegisterComponentOptions,
  ToolBar,
  UpdateComponentOptions,
  Video,
} from "@/index";
import { Component } from "@/class/Component";
import { $, addClass, patchComponent, removeClass } from "@/utils/domUtils";
import { computeAngle } from "@/index";
import { Plugin } from "@/index";
import {
  COMPONENT_STORE,
  HIDEEN_COMPONENT_STORE,
  ONCE_COMPONENT_STORE,
} from "@/utils/store";
import Mp4MediaPlayer from "@/mp4/MediaPlayer";
import { TimeLoading } from "@/component/Loading/parts/TimeLoading";
import { ErrorLoading } from "@/component/Loading/parts/ErrorLoading";
import { TopBar } from "@/component/TopBar/TopBar";
import { Env } from "@/utils/env";
import { MobileVolume } from "@/component/Mobile/MobileVolume";
import { EVENT } from "@/events";
import { Subtitle } from "@/component/Subtitle/Subtitle";
import {
  DoubleTapEvent,
  MoveEvent,
  SingleTapEvent,
  SwipeEvent,
  wrap,
} from "ntouch.js";
import { ContextMenu } from "@/component/ContextMenu/ContextMenu";
import { ContextMenuItem } from "@/component/ContextMenu/ContextMenuItem";
import { Mp4Parser } from "@/mp4/Mp4Parser";
import base64str from "@/svg/base64";
class Player extends Component implements ComponentItem {
  readonly id = "Player";
  // 播放器的默认配置
  readonly playerOptions: PlayerOptions;
  private isFullscreen = false;
  private videoInfo: Video;
  enableSeek = true;
  env = Env.env;
  // 保存当前运行环境的全屏模式，主要用于移动端-- 竖版全屏和横板全屏
  fullScreenMode: "Vertical" | "Horizontal" = "Horizontal";
  video: HTMLVideoElement;
  container: HTMLElement;
  props: DOMProps;
  contextMenu: ContextMenu;
  toolBar: ToolBar;
  topbar: TopBar;
  loading: TimeLoading;
  error: ErrorLoading;
  mask: HTMLElement;
  containerWidth: number;
  containerHeight: number;

  baseSize: number = 16;
  danmakuController: DanmakuController;

  // 暂停图标
  pauseIcon: HTMLElement;
  
  // 视频的长宽比例 默认为16： 9
  private mediaProportion: number = 9 / 16;
  static player = this;
  constructor(options?: PlayerOptions) {
    super(options.container, "div.Niplayer_video-wrapper");
    this.playerOptions = Object.assign(
      {
        autoPlay: false,
        streamPlay: false,
      },
      options
    );
    this.container = options.container;
    this.containerHeight = options.container.clientHeight;
    this.containerWidth = options.container.clientWidth;
    this.init();
  }

  init() {
    if (this.playerOptions.video) {
      this.video = this.playerOptions.video;
      this.video.parentNode && this.video.parentNode.removeChild(this.video);
    } else {
      // 兼容移动端设置的属性
      this.video = $("video");
      this.video["playsinline"] = true;
      // 设置播放器为H5播放器
      this.video["x5-video-player-type"] = "h5";
    }
    this.video.crossOrigin = "anonymous";

    this.el.appendChild(this.video);

    // 初始化媒体的播放源
    this.playerOptions?.url && this.attachSource(this.playerOptions.url);

    this.initPlugin();
    this.initComponent();
    this.initTemplate();
    this.initEvent();
    
    this.initResizeObserver();
    this.checkFullScreenMode();
  }

  // 在所有组件初始化完成之后对player的整体模板进行初始化
  initTemplate(): void {
    if (this.env === "Mobile") {
      // 如果是在移动端，则音量的调节使用手势决定的.
      this.unmountComponent("Volume");
      new MobileVolume(this, this.el, "div");
    }

    this.pauseIcon = $("div.pauseIcon");
    const img: HTMLImageElement = $("img");
    img.src = base64str;
    this.pauseIcon.append(img);
    this.pauseIcon.style.display = "none";
    this.el.append(this.pauseIcon)
  }

  // 对包含的所有组件进行初始化
  initComponent(): void {
    this.loading = new TimeLoading(
      this,
      "视频姬正在努力加载中(⑅˃◡˂⑅)",
      this.el
    );
    this.error = new ErrorLoading(this, "你的网络罢工啦Q_Q", this.el);
    this.toolBar = new ToolBar(this, this.el, "div");
    this.topbar = new TopBar(this, this.el, "div");
    this.contextMenu = new ContextMenu(this, this.el, "div");
    if (
      this.playerOptions.subtitles &&
      this.playerOptions.subtitles.length > 0
    ) {
      new Subtitle(this, this.playerOptions.subtitles);
    }
    if (this.playerOptions.danmaku && this.playerOptions.danmaku.open) {
      this.danmakuController = new DanmakuController(
        this,
        this.playerOptions.danmaku
      );
    }
  }

  // 初始化公有的事件
  initEvent() {
    if (this.env === "Mobile") {
      this.initMobileEvent();
    } else {
      this.initPCEvent();
    }

    this.video.addEventListener("loadedmetadata", (e) => {
      this.emit(EVENT.LOADED_META_DATA, e);
      this.adjustMediaSize();
    });

    this.video.addEventListener("timeupdate", (e) => {
      this.emit(EVENT.TIME_UPDATE, e);
    });

    this.video.addEventListener("play", (e) => {
      this.pauseIcon.style.display = "none";
      this.emit(EVENT.PLAY, e);
    });

    this.video.addEventListener("pause", (e) => {
      this.pauseIcon.style.display = ""
      this.emit(EVENT.PAUSE, e);
    });

    this.video.addEventListener("seeking", (e) => {
      if (this.enableSeek) {
        this.emit(EVENT.SEEKING, e);
      }
    });

    this.video.addEventListener("seeked", (e) => {
      this.emit(EVENT.SEEKED, e);
    });

    this.video.addEventListener("waiting", (e) => {
      this.emit(EVENT.WAITING, e);
    });

    this.video.addEventListener("canplay", (e) => {
      this.emit(EVENT.CAN_PLAY, e);
    });

    this.video.addEventListener("error", (e) => {
      this.emit(EVENT.ERROR);
    });

    this.video.addEventListener("abort", (e) => {
      this.emit(EVENT.ERROR);
    });

    this.video.addEventListener("ratechange", (e) => {
      this.emit(EVENT.RATE_CHANGE);
    });

    this.on(EVENT.DANMAKU_INPUT_FOCUS, () => {
      this.el.onmouseleave = null;
    });

    this.on(EVENT.DANMAKU_INPUT_BLUR, () => {
      this.el.onmouseleave = (e) => {
        this.emit(EVENT.HIDE_TOOLBAR, e);
      };
    });

    this.on(EVENT.DOT_DOWN, () => {
      this.enableSeek = false;
    });

    this.on(EVENT.DOT_UP, () => {
      this.enableSeek = true;
    });

    this.on(EVENT.VIDEO_DOT_DRAG, (val: number, e: Event | MoveEvent) => {
      this.emit(EVENT.SHOW_TOOLBAR, e);
    });

    this.on(EVENT.ENTER_FULLSCREEN, () => {
      document.querySelectorAll(".video-controller").forEach((el) => {
        (el as HTMLElement).style.marginRight = "15px";
      });
      document.querySelectorAll(".video-topbar-controller").forEach((el) => {
        (el as HTMLElement).style.marginRight = "15px";
      });

      this.isFullscreen = true;
    });

    this.on(EVENT.LEAVE_FULLSCREEN, () => {
      document.querySelectorAll(".video-controller").forEach((el) => {
        (el as HTMLElement).style.marginRight = "";
      });
      document.querySelectorAll(".video-topbar-controller").forEach((el) => {
        (el as HTMLElement).style.marginRight = "";
      });
      this.isFullscreen = false;
    });
  }

  // 初始化PC端事件
  initPCEvent(): void {
    this.el.onclick = (e) => {
      if (this.video.paused) {
        this.video.play();
      } else if (this.video.played) {
        this.video.pause();
      }
    };
    this.el.onmousemove = (e) => {
      this.emit(EVENT.SHOW_TOOLBAR, e);
    };

    this.el.onmouseenter = (e) => {
      this.emit(EVENT.SHOW_TOOLBAR, e);
    };

    this.el.onmouseleave = (e) => {
      if (!this.video.paused) this.emit(EVENT.HIDE_TOOLBAR, e);
    };

    // 键盘事件
    document.addEventListener("keyup", (e) => {
      console.log(e.key);
      switch (e.key) {
        case "f":
          (
            ONCE_COMPONENT_STORE.get("FullScreen") as FullScreen
          ).requestFullScreen();
          break;
        case "ArrowRight":
          if (this.video.paused) this.video.play();
          if (this.video.currentTime + 5 <= this.video.duration) {
            this.video.currentTime += 5;
          }
          break;
        case "ArrowLeft":
          if (this.video.paused) this.video.play();
          if (this.video.currentTime - 5 >= 0) {
            this.video.currentTime -= 5;
          }
          break;
        case "ArrowTop":

        case "ArrowDown":

        case "":
          if (this.isFullscreen) {
            if (this.video.played) {
              this.video.pause();
            } else {
              this.video.play();
            }
          }
          break;
      }
    });

    this.el.addEventListener("click", (e: MouseEvent) => {
      this.contextMenu.el.style.display = "";
    });

    // 鼠标右键事件
    this.el.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      this.contextMenu.el.style.display = "block";
      this.contextMenu.el.style.top = e.offsetY + "px";
      this.contextMenu.el.style.left = e.offsetX + "px";
    });
  }

  // 初始化移动端事件
  initMobileEvent(): void {
    wrap(this.el).addEventListener("touchstart", () => {
      this.emit(EVENT.DOT_DOWN);
    });

    wrap(this.el).addEventListener("singleTap", (e: SingleTapEvent) => {
      if (this.toolBar.status === "hidden") {
        this.emit(EVENT.SHOW_TOOLBAR, e);
      } else {
        this.emit(EVENT.HIDE_TOOLBAR, e);
      }
      this.emit(EVENT.VIDEO_CLICK);
    });

    wrap(this.el).addEventListener("doubleTap", (e: DoubleTapEvent) => {
      if (this.video.paused) {
        this.video.play();
      } else if (this.video.played) {
        this.video.pause();
      }
    });

    wrap(this.el).addEventListener("move", (e: MoveEvent) => {
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (computeAngle(dx, dy) >= 75) {
        this.emit(EVENT.MOVE_VERTICAL, e);
      } else if (computeAngle(dx, dy) <= 15) {
        this.emit(EVENT.MOVE_HORIZONTAL, e);
      }
    });

    // 拖动结束事件
    wrap(this.el).addEventListener("swipe", (e: SwipeEvent) => {
      let dx = e.endPos.x - e.startPos.x;
      let dy = e.endPos.y - e.startPos.y;
      if (computeAngle(dx, dy) >= 75) {
        this.emit(EVENT.SLIDE_VERTICAL, e);
      } else if (computeAngle(dx, dy) <= 15) {
        this.emit(EVENT.SLIDE_HORIZONTAL, e);
      }
    });
  }

  // 初始化插件
  private initPlugin() {
    if (this.playerOptions.plugins) {
      this.playerOptions.plugins.forEach((plugin) => {
        this.use(plugin);
      });
    }
  }

  // 给video添加媒体资源，开始初始化媒体资源的解析
  attachSource(url: string) {
    let extension = getExtension(url);
    this.emit(EVENT.SOURCE_ATTACHED, url); // 触发资源加载完毕事件
    if(extension === "mp4") {
      new Mp4Parser(url,this);
      if (this.playerOptions.streamPlay) {
         // 是否启动流式播放
        new Mp4MediaPlayer(url, this);
      } else {
        this.video.src = url;
      }
    }
  }

  /**
   * @@description 监听视频播放器大小的变化
   */
  private initResizeObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
      // 触发尺寸变化事件
      this.emit(EVENT.RESIZE, {
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
      this.adjustMediaSize();

      // 获取到容器的宽高
      let width = entries[0].contentRect.width;
      let height = entries[0].contentRect.height;

      this.adjustRem(width, height)
      let subsetting;
      // 当尺寸发生变化的时候视频库只调整基本的内置组件，其余用户自定义的组件响应式需要自己实现
      if (width <= 500) {
        // 默认在小屏幕的情况下只将SubSetting移动到上端，其余在底部注册的控件需要隐藏
        COMPONENT_STORE.forEach((value, key) => {
          if (["SubSetting"].indexOf(key) !== -1) {
            subsetting = ONCE_COMPONENT_STORE.get(key);
            this.unmountComponent(key);
          } else if (
            [
              "PicInPic",
              "Playrate",
              "ScreenShot",
              "SubSetting",
              "VideoShot",
            ].indexOf(key) !== -1
          ) {
            if (!HIDEEN_COMPONENT_STORE.get(key)) {
              this.hideComponent(key);
            }
          }
        });

        this.mountComponent(subsetting.id, subsetting, {
          mode: {
            type: "TopToolBar",
            pos: "right",
          },
        });
        addClass(subsetting.el, [
          "video-subsettings",
          "video-topbar-controller",
        ]);
      } else {
        // 展示之前隐藏的组件
        HIDEEN_COMPONENT_STORE.forEach((value, key) => {
          this.showComponent(key);
        });
        if (COMPONENT_STORE.has("SubSetting")) {
          let key = "SubSetting";
          let component = ONCE_COMPONENT_STORE.get(key);
          // 如果SubSetting已经挂载到视图上，需要先卸载
          this.unmountComponent(key);
          this.mountComponent(key, component, {
            mode: {
              type: "BottomToolBar",
              pos: "right",
            },
            index: 1,
          });
          addClass(component.el, ["video-subsettings", "video-controller"]);
        }
      }
    });

    resizeObserver.observe(this.el);
  }

  // 设置根节点的fontsize大小以便于做移动端适配 -> rem
  private adjustRem(width: number, height: number = 0) {
    const scale = width / 600;
    let number = 1;
    if(scale > 1.25) {
      number = 1.25
    } else if(scale < 1){
      number = 1;
    } else {
      number = scale;
    }
    document.documentElement.style.fontSize = this.baseSize * number + 'px'
  }

  //调整video的尺寸
  private adjustMediaSize() {
    if (this.mediaProportion !== 0) {
      if (this.el.clientHeight / this.el.clientWidth > this.mediaProportion) {
        this.video.style.width = "100%";
        this.video.style.height =
          this.el.clientWidth * this.mediaProportion +
          0.05 * this.el.clientWidth +
          "px";
      } else {
        this.video.style.height = "100%";
        this.video.style.width =
          this.el.clientHeight / this.mediaProportion + "px";
      }
    }
  }

  // 查询移动端的全屏方式
  checkFullScreenMode() {}

  // 注册/挂载自己的组件,其中的id为组件实例的名称，分为内置和用户自定义这两种情况；
  // 注意，id是唯一的，不能存在两个具有相同id的组件实例!!!
  mountComponent(
    id: string,
    component: ComponentItem,
    options?: RegisterComponentOptions
  ) {
    if (COMPONENT_STORE.has(id)) {
      throw new Error(
        "无法挂载一个已经存在于视图上的组件，请先将其卸载或者删除"
      );
    }
    COMPONENT_STORE.set(id, component);
    if (!ONCE_COMPONENT_STORE.has(id)) {
      ONCE_COMPONENT_STORE.set(id, component);
    }
    if (!options) {
      if (!component.container)
        throw new Error(
          "必须传入Options选项或者传入的组件实例中需要有container选项"
        );
      component.container.appendChild(component.el);
    } else {
      let mode = options.mode;
      if (mode.type === "BottomToolBar") {
        let area: HTMLElement;
        if (mode.pos === "left") {
          area = this.toolBar.controller.leftArea;
        } else if (mode.pos === "right") {
          area = this.toolBar.controller.rightArea;
        } else if (mode.pos === "medium") {
          area = this.toolBar.controller.mediumArea;
        }
        let children = [...area.children];
        if (!options.index) area.appendChild(component.el);
        else {
          if (options.index < 0) throw new Error("index不能传入负值");
          area.insertBefore(component.el, children[options.index] || null);
        }
      } else if (mode.type === "TopToolBar") {
        let area: HTMLElement;
        if (mode.pos === "left") {
          area = this.topbar.leftArea;
        } else {
          area = this.topbar.rightArea;
        }
        let children = [...area.children];
        if (!options.index) area.appendChild(component.el);
        else {
          if (options.index < 0) throw new Error("index不能传入负值");
          area.insertBefore(component.el, children[options.index] || null);
        }
      } else if (mode.type === "AnyPosition") {
        this.el.appendChild(component.el);
      }
      // 给组件中的container赋予新的值
      component.container = component.el.parentElement;
    }
  }

  // 更新一个已经挂载到视图层上的组件
  updateComponent(
    id: string,
    component: Partial<ComponentItem>,
    options: UpdateComponentOptions
  ) {
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("该组件不存在或者已经被卸载");
    }
    patchComponent(COMPONENT_STORE.get(id), component, options);
  }

  //隐藏某一个已经挂载到视图上的组件
  hideComponent(id: string) {
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("无法隐藏一个未挂载在视图上的组件");
    }
    if (HIDEEN_COMPONENT_STORE.get(id)) {
      throw new Error("该元素已经隐藏");
    }
    let instance = COMPONENT_STORE.get(id);
    instance.el.style.display = "none";
    HIDEEN_COMPONENT_STORE.set(id, instance);
  }
  // 展示一个隐藏的组件
  showComponent(id: string) {
    if (!HIDEEN_COMPONENT_STORE.get(id)) {
      throw new Error("该元素已经隐藏");
    }
    if (!COMPONENT_STORE.get(id)) {
      throw new Error("该元素不存在或者被卸载");
    }

    let instance = COMPONENT_STORE.get(id);
    instance.el.style.display = "";
    HIDEEN_COMPONENT_STORE.delete(id);
  }

  //卸载某一个component组件，所谓卸载一个组件指的是仅仅将其DOM元素从视图上移除，但是不会删除其实例对象，还可以继续挂载
  // 注意：卸载一个组件会清除该组件上挂载的class和id，意味着之后用户可以将组件挂载到任何位置
  unmountComponent(id: string) {
    if (!COMPONENT_STORE.has(id)) {
      throw new Error("该组件不存在或者已经被卸载");
    }
    let instance = COMPONENT_STORE.get(id);
    instance.el.parentElement.removeChild(instance.el);
    removeClass(instance.el, [...instance.el.classList]);
    COMPONENT_STORE.delete(id);
  }

  //彻底删除一个组件，也就是直接销毁组件实例，卸载组件仅仅是将其el元素从视图上移除，但任然保留组建的实例对象
  deleteComponent(id: string) {
    if (COMPONENT_STORE.has(id)) {
      this.unmountComponent(id);
    }
    ONCE_COMPONENT_STORE.delete(id);
  }

  // 注册一个右击菜单项
  registerContextMenu(
    content: string | HTMLElement,
    click?: (item: ContextMenuItem) => any
  ) {
    this.contextMenu.registerContextMenu(content,click);
  }

  // 注册一个底部的Controller类型的组件
  registerControllers(component: ComponentConstructor, pos: "left" | "medium" | "right") {
    if(pos === "left") {
      if(!this.playerOptions.leftBottomBarControllers) this.playerOptions.leftBottomBarControllers = [];
      this.playerOptions.leftBottomBarControllers.unshift(component);
    }else if(pos === "medium") {
      if(!this.playerOptions.mediumMediumBarController) this.playerOptions.mediumMediumBarController = [];
      this.playerOptions.mediumMediumBarController.unshift(component);
    }else {
      if(!this.playerOptions.rightBottomBarControllers) this.playerOptions.rightBottomBarControllers = [];
      this.playerOptions.rightBottomBarControllers.unshift(component);
    }
  }

  // 注册一个设置选项
  registerSubsetting() {}

  // 获取视频信息
  getVideoInfo(): Video {
    return this.videoInfo;
  }
  // 设置视频信息
  setVideoInfo(info: Video): void {
    this.videoInfo = info;
    console.log(this.videoInfo)
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
