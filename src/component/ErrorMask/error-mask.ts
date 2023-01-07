import { $warn, styles,icon } from "../../index";
import "./error-mask.less";

export class ErrorMask {
  private template_!: string | HTMLElement;
  constructor() {
    this.init();
  }

  get template(): string | HTMLElement {
    return this.template_;
  }

  init() {
    this.template_ = this.generateErrorMask();
  }

  generateErrorMask(): HTMLElement {
    let mask = document.createElement("div") as HTMLElement;
    mask.className = styles["error-mask"];
    let errorContainer = document.createElement("div") as HTMLElement;
    errorContainer.className = styles["error-container"];
    let errorItem = document.createElement("div") as HTMLElement;
    errorItem.className = styles["error-item"];
    let i = document.createElement("i") as HTMLElement;
    i.className = `${icon["iconfont"]} ${icon["icon-cuowutishi"]}`;
    errorItem.appendChild(i);
    let errorTitle = document.createElement("div") as HTMLElement;
    errorTitle.className = styles["error-title"];
    errorTitle.innerText = "视频加载发生错误";
    errorContainer.appendChild(errorItem);
    errorContainer.appendChild(errorTitle);
    mask.appendChild(errorContainer);

    return mask;
  }
}
