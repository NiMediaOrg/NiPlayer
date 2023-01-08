import { $warn, styles } from "../../index";
import "loading-mask.less";
export class LoadingMask {
  private template_!: string | HTMLElement;
  private container!: HTMLElement;
  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  get template(): string | HTMLElement {
    return this.template_;
  }

  init() {
    
    this.template_ = this.generateLoadingMask();
  }

  generateLoadingMask(): HTMLElement {
    let mask = document.createElement("div") as HTMLElement;
    mask.className = styles["loading-mask"];
    let loadingContainer = document.createElement("div") as HTMLElement;
    loadingContainer.className = styles["loading-container"];
    let loaadingItem = document.createElement("div") as HTMLElement;
    loaadingItem.className = styles["loading-item"];
    let loadingTitle = document.createElement("div") as HTMLElement;
    loadingTitle.className = styles["loading-title"];
    loadingTitle.innerText = "视频正在努力加载中...";
    loadingContainer.appendChild(loaadingItem);
    loadingContainer.appendChild(loadingTitle);
    mask.appendChild(loadingContainer);

    return mask;
  } 

  addLoadingMask() {
    if(![...this.container.children].includes(this.template as HTMLElement)) {
      this.container.appendChild(this.template as HTMLElement);
    }
    
  }

  removeLoadingMask() { 
    if([...this.container.children].includes(this.template as HTMLElement)) {
      this.container.removeChild(this.template as HTMLElement);
    }
    
  }
}
