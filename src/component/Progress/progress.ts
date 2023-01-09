import { $warn, BaseEvent, styles } from "../../index";
import "./pregress.less";
export class Progress extends BaseEvent {
  private template_!: HTMLElement | string;
  private container!: HTMLElement;
  private progress!: HTMLElement;
  private bufferedProgress!: HTMLElement;
  private completedProgress!: HTMLElement;
  private pretime!: HTMLElement;
  private dot!: HTMLElement;
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
        <div class="${styles["video-progress"]}">
            <div class="${styles["video-pretime"]}">00:00</div>
            <div class="${styles["video-buffered"]}"></div>
            <div class="${styles["video-completed"]} "></div>
            <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}"></div>
        </div>
        `;
  }

  initEvent() {
    this.on("mounted", () => {
      this.progress = this.container.querySelector(
        `.${styles["video-controls"]} .${styles["video-progress"]}`
      )!;
      this.pretime = this.progress.children[0] as HTMLElement;
      this.bufferedProgress = this.progress.children[1] as HTMLElement;
      this.completedProgress = this.progress.children[2] as HTMLElement;
      this.dot = this.progress.children[3] as HTMLElement;
    });
  }
}
