import {
  $warn,
  styles,
  Progress,
  Controller,
  EventObject,
  BaseEvent,
} from "../../index";
import "./toolbar.less";
// 视频播放器的工具栏组件
export class ToolBar extends BaseEvent {
  private template_!: HTMLElement;
  private container!: HTMLElement;
  private video!: HTMLVideoElement;
  private progress!: Progress;
  private controller!: Controller;
  private timer!: number | null;
  
  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.init();
    this.initComponent();
    this.initTemplate();
    this.initEvent();
  }

  get template(): HTMLElement {
    return this.template_;
  }

  showToolBar(e:MouseEvent) {
    this.container.querySelector(
      `.${styles["video-controls"]}`
    )!.className = `${styles["video-controls"]}`;
    if (e.target !== this.video) {
      // do nothing
    } else {
      this.timer = window.setTimeout(() => {
        this.hideToolBar();
      }, 3000);
    }
  }

  hideToolBar() {
    this.container.querySelector(
      `.${styles["video-controls"]}`
    )!.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
  }

  init() {}

  initComponent() {
    this.progress = new Progress(this.container);
    this.controller = new Controller(this.container);
  }

  initTemplate() {
    let div = document.createElement("div");
    div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    div.innerHTML += this.progress.template as string;
    div.innerHTML += this.controller.template as string;
    this.template_ = div;
  }

  initEvent() {
    this.on("showtoolbar",(e:MouseEvent)=>{
      if(this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.showToolBar(e);
    })

    this.on("hidetoolbar",()=>{
      this.hideToolBar();
    })

    this.on("play", () => {
      this.controller.emit("play");
    });

    this.on("pause", () => {
      this.controller.emit("pause");
    });

    this.on("loadedmetadata", (summary: number) => {
      this.controller.emit("loadedmetadata", summary);
    });

    this.on("timeupdate", (current: number) => {
      this.controller.emit("timeupdate", current);
    });

    this.on("mounted", () => {
      this.video = this.container.querySelector("video")!;
      this.controller.emit("mounted");
      this.progress.emit("mounted")
    });
  }
}
