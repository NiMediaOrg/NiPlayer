import { Component } from "@/class/Component";
import { Player } from "@/page/player";
import { ComponentItem, DOMProps } from "@/types/Player";
import { addClass } from "@/utils/domUtils";
export class Toast extends Component implements ComponentItem {
  readonly id = "Toast";
  readonly player: Player;
  readonly dom: HTMLElement | null;
  readonly props?: DOMProps;

  static ToastQueue: Toast[] = [];
  constructor(player: Player, dom?: HTMLElement, props?: DOMProps) {
    super(null, "div", props, null);
    this.player = player;
    this.props = props;
    this.dom = dom || null;
    this.init();
  }

  init(): void {
    this.initTemplate();
    this.initEvent();
  }

  initTemplate(): void {
    if (this.dom) {
      this.el.appendChild(this.dom);
    }
    addClass(this.el, ["video-toast-wrapper"]);
    this.player.el.appendChild(this.el);
    window.setTimeout(() => {
      addClass(this.el, ["video-toast-animate"]);
      let start = 30;
      for (let i in Toast.ToastQueue) {
        start += Toast.ToastQueue[i].el.clientHeight + 10;
      }
      this.el.style.transform = `translateY(${start}px)`;
      Toast.ToastQueue.push(this);
    });
  }

  initEvent(): void {}

  dispose(): void {
    let index = Toast.ToastQueue.indexOf(this);
    Toast.ToastQueue.splice(index, 1);

    this.el.parentElement.removeChild(this.el);
    for (let i = index; i < Toast.ToastQueue.length; i++) {
      let toast = Toast.ToastQueue[i];
      if (i === index) {
        toast.el.style.transform = `translateY(${10 + this.el.clientHeight}px)`;
      } else {
        toast.el.style.transform = `translateY(${
          10 + Toast.ToastQueue[i - 1].el.clientHeight
        }px)`;
      }
    }
  }
}
