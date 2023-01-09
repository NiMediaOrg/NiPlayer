import {
  PlayerOptions,
  $warn,
  styles,
  ToolBar,
  LoadingMask,
  ErrorMask,
  EventObject,
  BaseEvent,
} from "../../index";
import "./player.less";
import "../../main.less";
class Player extends BaseEvent {
  private playerOptions = {
    url: "",
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  private container!: HTMLElement;
  private video!: HTMLVideoElement;
  private toolbar!: ToolBar;
  private loadingMask!: LoadingMask;
  private errorMask!: ErrorMask;
  constructor(options: PlayerOptions) {
    super();
    this.playerOptions = Object.assign(this.playerOptions, options);
    console.log(this.playerOptions)
    this.init();
    this.initComponent();
    this.initContainer();
    // 初始化播放器的事件
    this.initEvent();
  }

  init() {
    let container = (this.playerOptions as PlayerOptions).container;
    if (!this.isTagValidate(container)) {
      $warn(
        "你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素"
      );
    }
    this.container = container;
  }

  initComponent() {
    this.toolbar = new ToolBar(this.container);
    this.loadingMask = new LoadingMask(this.container);
    this.errorMask = new ErrorMask(this.container);
  }

  initContainer() {
    this.container.style.width = this.playerOptions.width;
    this.container.style.height = this.playerOptions.height;
    this.container.className = styles["video-container"];
    this.container.innerHTML = `
      <div class="${styles["video-wrapper"]}">
        <video>
          <source src="${this.playerOptions.url}" type="video/mp4">
            你的浏览器暂不支持HTML5标签,非常抱歉
          </source>
        </video>
      </div>
    `;
    this.container.appendChild(this.toolbar.template);
    this.video = this.container.querySelector("video")!
  }

  initEvent() {
    // this.on("mounted",(ctx: this)=>{
    //   ctx.playerOptions.autoplay && ctx.video.play();
    // })

    this.toolbar.emit("mounted");

    this.emit("mounted",this);

    this.container.onclick = (e: Event) => {
      if (e.target == this.video) {
        if (this.video.paused) {
          this.video.play();
        } else if (this.video.played) {
          this.video.pause();
        }
      }
    };

    this.container.addEventListener("mouseenter", (e: MouseEvent) => {
      this.toolbar.emit("showtoolbar", e);
    });

    this.container.addEventListener("mousemove", (e: MouseEvent) => {
      this.toolbar.emit("showtoolbar", e);
    });

    this.container.addEventListener("mouseleave", (e: MouseEvent) => {
      this.toolbar.emit("hidetoolbar");
    });

    this.video.addEventListener("loadedmetadata", (e: Event) => {
      console.log("元数据加载完毕", this.video.duration);
      this.playerOptions.autoplay && this.video.play();
      this.toolbar.emit("loadedmetadata", this.video.duration);
    });

    this.video.addEventListener("timeupdate", (e: Event) => {
      this.toolbar.emit("timeupdate", this.video.currentTime);
    });

    // 当视频可以再次播放的时候就移除loading和error的mask，通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
    this.video.addEventListener("play", (e: Event) => {
      this.loadingMask.removeLoadingMask();
      this.errorMask.removeErrorMask();
      this.toolbar.emit("play");
    });

    this.video.addEventListener("pause", (e: Event) => {
      this.toolbar.emit("pause");
    });

    this.video.addEventListener("waiting", (e: Event) => {
      this.loadingMask.removeLoadingMask();
      this.errorMask.removeErrorMask();
      this.loadingMask.addLoadingMask();
    });

    //当浏览器请求视频发生错误的时候
    this.video.addEventListener("stalled", (e) => {
      console.log("视频加载发生错误");
      this.loadingMask.removeLoadingMask();
      this.errorMask.removeErrorMask();
      this.errorMask.addErrorMask();
    });

    this.video.addEventListener("error", (e) => {
      this.loadingMask.removeLoadingMask();
      this.errorMask.removeErrorMask();
      this.errorMask.addErrorMask();
    });

    this.video.addEventListener("abort", (e: Event) => {
      this.loadingMask.removeLoadingMask();
      this.errorMask.removeErrorMask();
      this.errorMask.addErrorMask();
    });
  }

  isTagValidate(ele: HTMLElement): boolean {
    if (window.getComputedStyle(ele).display === "block") return true;
    if (window.getComputedStyle(ele).display === "inline") return false;
    if (window.getComputedStyle(ele).display === "inline-block") {
      if (
        ele instanceof HTMLImageElement ||
        ele instanceof HTMLAudioElement ||
        ele instanceof HTMLVideoElement ||
        ele instanceof HTMLInputElement ||
        ele instanceof HTMLCanvasElement ||
        ele instanceof HTMLButtonElement
      ) {
        return false;
      }
      return true;
    }
    return true;
  }
}

export { Player };
