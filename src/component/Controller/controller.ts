import {
  $warn,
  styles,
  icon,
  EventObject,
  BaseEvent,
  formatTime,
} from "../../index";
import { volumeSVG } from "../SVGTool/VolumeModel";
import { settingSVG } from "../SVGTool/SettingsModel";
import { fullScreenSVG } from "../SVGTool/FullScreenModel";
import { getDOMPoint } from "../../utils/getDOMPoint";
import "./controller.less";
export class Controller extends BaseEvent {
  private template_: HTMLElement | string;
  private container: HTMLElement;
  private video: HTMLVideoElement;
  private videoPlayBtn: HTMLElement;
  private currentTime: HTMLElement;
  private summaryTime: HTMLElement;
  // 相关的功能元素
  private fullScreen: HTMLElement;
  private volumeBtn: HTMLElement;
  private volumeSet: HTMLElement;
  private volumeDot: HTMLElement;
  private volumeProgress: HTMLElement;
  private playRate: HTMLElement;
  private resolvePower: HTMLElement;
  private settings: HTMLElement;
  constructor(container: HTMLElement) {
    super();
    this.container = container;
    this.init();
    this.initEvent();
  }

  get template(): HTMLElement | string {
    return this.template_;
  }

  init() {
    this.template_ = `
        <div class="${styles["video-play"]}">
            <div class="${styles["video-subplay"]}">
                <div class="${styles["video-start-pause"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
                </div>
                <div class="${styles["video-duration"]}">
                    <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
                </div>
           </div>
            <div class="${styles["video-settings"]}">
                <div class="${styles["video-resolvepower"]} ${styles["video-controller"]}" aria-label="分辨率">
                    分辨率
                </div>
                <div class="${styles["video-playrate"]} ${styles["video-controller"]}" aria-label="倍速">
                    倍速
                </div>
                <div class="${styles["video-volume"]} ${styles["video-controller"]}" aria-label="音量">
                    <div class="${styles["video-volume-set"]}" aria-label="调节音量" style="display:none; bottom:41px" >
                      <div class="${styles["video-volume-show"]}">48</div>
                      <div class="${styles["video-volume-progress"]}">
                        <div class="${styles["video-volume-completed"]}"></div>
                        <div class="${styles["video-volume-dot"]}"></div>
                      </div>
                    </div>
                    ${volumeSVG}
                </div>
                <div class="${styles["video-subsettings"]} ${styles["video-controller"]}" aria-label="设置">
                    ${settingSVG}
                </div>
                <div class="${styles["video-fullscreen"]} ${styles["video-controller"]}" aria-label="全屏">
                    ${fullScreenSVG}
                </div>
            </div>
        </div>
    `;
  }

  initControllerEvent() {
    /**
     * @description 监听鼠标的点击事件来决定是否暂停还是播放视频
     */
    this.videoPlayBtn.onclick = (e: MouseEvent) => {
      if (this.video.paused) {
        this.video.play();
      } else if (this.video.played) {
        this.video.pause();
      }
    };

    /**
     * @description 点击进入全屏模式
     */
    this.fullScreen.onclick = () => {
      if (this.container.requestFullscreen && !document.fullscreenElement) {
        this.container.requestFullscreen(); //该函数请求全屏
      } else if (document.fullscreenElement) {
        document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
      }
    };
    /**
     * @desciption 显示音量的设置
     * TODO:这部分控制选项的显示和隐藏的逻辑可以复用
     */
    this.volumeBtn.onmouseenter = (e) => {
      this.volumeSet.style.display = "block";
      let {x,y} = getDOMPoint(this.volumeBtn);
      let top = y - parseInt(this.volumeSet.style.bottom) - this.volumeSet.clientHeight;
      let bottom =  y - this.volumeBtn.clientHeight;
      let left = x + Math.round(this.volumeBtn.clientWidth / 2) - Math.round(this.volumeSet.clientWidth / 2);
      let right = x + Math.round(this.volumeBtn.clientWidth / 2) + Math.round(this.volumeSet.clientWidth / 2);
      document.body.onmousemove = (e) => {
        let pX = e.pageX,pY = e.pageY;
        if(!((pX >= left && pX <= right && pY <= y && pY >=top) || (pX >= x && pX <= x + this.volumeBtn.clientWidth && pY >= y && pY <= y + this.volumeBtn.clientHeight))) {
          this.volumeSet.style.display = "none";
        }
      }
    }
    
  }

  initEvent() {
    this.on("play", () => {
      this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
    });

    this.on("pause", () => {
      this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
    });

    this.on("loadedmetadata", (summary: number) => {
      this.summaryTime.innerHTML = formatTime(summary);
    });

    this.on("timeupdate", (current: number) => {
      this.currentTime.innerHTML = formatTime(current);
    });

    /**
     * @description 模板字符已经渲染到页面上，可以获取DOM元素了
     */
    this.on("mounted", () => {
      this.videoPlayBtn = this.container.querySelector(
        `.${styles["video-start-pause"]} i`
      );
      this.currentTime = this.container.querySelector(
        `.${styles["video-duration-completed"]}`
      );
      this.summaryTime = this.container.querySelector(
        `.${styles["video-duration-all"]}`
      );

      this.video = this.container.querySelector("video")!;
      this.fullScreen = this.container.querySelector(
        `.${styles["video-fullscreen"]}`
      );
      this.volumeBtn = this.container.querySelector(`.${styles["video-volume"]}`);
      console.log(this.volumeBtn)
      this.volumeSet = this.container.querySelector(`.${styles["video-volume-set"]}`);

      this.initControllerEvent();
    });
  }
}
