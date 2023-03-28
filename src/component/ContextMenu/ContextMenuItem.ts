import { $ } from "@/utils";

export class ContextMenuItem {
  readonly id = "ContextMenuItem";
  el: HTMLElement;
  container: HTMLElement;
  content: HTMLElement | string;
  constructor(container: HTMLElement, content: HTMLElement | string) {
    this.container = container;
    this.content = content;
    this.init();
  }

  init() {
    this.initTemplate();
    this.initEvent();
  }

  initTemplate() {
    this.el = $("div.video-context-menu-item");
    this.container.append(this.el);

    if (typeof this.content === "string") {
      this.el.innerHTML = this.content;
    } else {
      this.el.append(this.content);
    }
  }

  initEvent() {}
}
