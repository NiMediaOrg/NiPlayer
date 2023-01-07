import { PlayerOptions, $warn,styles, ToolBar, LoadingMask,ErrorMask } from "../../index";
import  "./player.less"
class Player {
  private playerOptions = {
    url: "",
    autoplay: false,
    width: "100%",
    height: "100%",
  };
  private container!: HTMLElement;
  private toolbar!: ToolBar;
  constructor(options: PlayerOptions) {
    this.playerOptions = Object.assign(this.playerOptions, options);
    this.init();
    this.initComponent();
    this.initContainer();
  }

  init() {
    let container = (this.playerOptions as PlayerOptions).container;
    if (!this.isTagValidate(container)) {
        $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
    }
    this.container = container;
  }
  
  initComponent() {
    let toolbar = new ToolBar();
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
