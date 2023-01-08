import { PlayerOptions, $warn,styles, ToolBar, LoadingMask,ErrorMask, EventObject, BaseEvent } from "../../index";
import  "./player.less";
class Player extends BaseEvent{
  private playerOptions = {
    url: "",
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  private container!: HTMLElement;
  private toolbar!: ToolBar;
  private video!: HTMLVideoElement;
  constructor(options: PlayerOptions) {
    super();
    this.playerOptions = Object.assign(this.playerOptions, options);
    this.init();
    this.initComponent();
    this.initContainer();
    // 初始化播放器的事件
    this.initEvent();
  }

  init() {
    let container = (this.playerOptions as PlayerOptions).container;
    if (!this.isTagValidate(container)) {
        $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
    }
    this.container = container;
  }
  
  initComponent() {
    let toolbar = new ToolBar(this.container);
    this.toolbar = toolbar;
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
    `
    this.container.appendChild(this.toolbar.template);
    this.video = this.container.querySelector("video")!;
  }

  initEvent() {
    this.container.onclick = (e: Event) => {
      if (e.target == this.video) {
        if (this.video.paused) {
          this.video.play();
        } else if (this.video.played) {
          this.video.pause();
        }
      }
    }

    this.video.onplay = (e: Event) => {
      this.toolbar.emit("play")
    }

    this.video.onpause = (e:Event) => {
      this.toolbar.emit("pause")
    }

    this.video.onwaiting = (e:Event) => {

    }


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
