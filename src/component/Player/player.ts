import {
  PlayerOptions,
  $warn,
  styles,
  ToolBar,
  LoadingMask,
  ErrorMask,
  BaseEvent,
} from "../../index";
import "./player.less";
import "../../main.less";
import { getFileExtension } from "../../utils/getFileExtension";
import { Mp4Player } from "./mp4-player";
import { MpdPlayer } from "./mpd-player";
class Player extends BaseEvent {
 playerOptions = {
    url: "",
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  container!: HTMLElement;
  video!: HTMLVideoElement;
  toolbar!: ToolBar;
  loadingMask!: LoadingMask;
  errorMask!: ErrorMask;
  constructor(options: PlayerOptions) {
    super();
    this.playerOptions = Object.assign(this.playerOptions, options);
    this.init();
    this.initComponent();
    this.initContainer();
    if(getFileExtension(this.playerOptions.url) === "mp4") {
      new Mp4Player(this);
    } else if(getFileExtension(this.playerOptions.url) === "mpd") {
      new MpdPlayer(this)
    }
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
  /**
   * @description 初始化播放器上的各种组件实例
   */
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
        <video></video>
      </div>
    `;
    this.container.appendChild(this.toolbar.template);
    this.video = this.container.querySelector("video")!
    this.video.height = this.container.clientHeight;
    this.video.width = this.container.clientWidth;
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
