import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { $, addClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { SingleTapEvent, wrap } from "ntouch.js";
/**
 * @description 播放速率的类
 */
export class Playrate extends Options {
  readonly id = "Playrate";
  readonly playrateArray = ["0.5", "0.75", "1.0", "1.25", "1.5", "2.0"];
  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(player, container, 0, 0, desc);
    this.init();
  }

  init() {
    this.initTemplate();
    this.initEvent();
    storeControlComponent(this);
  }

  initTemplate() {
    this.el["aria-label"] = "播放倍速";
    addClass(this.el, ["video-playrate", "video-controller"]);

    this.el.removeChild(this.iconBox);
    this.iconBox = $("span.video-controller-span", null, "倍速");
    this.el.appendChild(this.iconBox);

    this.el.removeChild(this.hideBox);
    // this.hideBox = $("ul",{style:{ display:"none" },"aria-label":"播放速度调节"});
    addClass(this.hideBox, ["video-playrate-set"]);
    this.el.appendChild(this.hideBox);

    for (let i = this.playrateArray.length - 1; i >= 0; i--) {
      let li = $("li");
      li.innerText = this.playrateArray[i];
      if (this.playrateArray[i] === "1.0") {
        li.style.color = "#007aff";
      }
      this.hideBox.appendChild(li);
    }
  }

  initEvent(): void {
    this.onClick = this.onClick.bind(this);
    if(this.player.env === "PC") {
        this.hideBox.addEventListener("click",this.onClick);
    } else {
        wrap(this.hideBox).addEventListener("singleTap",this.onClick);
        wrap(this.el).addEventListener("singleTap",(e) => {
            if(this.hideBox.style.display === "none") {
                this.hideBox.style.display = "";
            }
        })
    }
  }

  onClick(e: Event | SingleTapEvent) {
    let target;
    if(e instanceof Event) {
      target = e.target;
    } else {
      target = (e as SingleTapEvent).e.target
    }
    let text = (target as HTMLElement).innerText;
    let rate = Number(text.slice(0, text.length - 1));
    this.player.video.playbackRate = rate;
    [...this.hideBox.childNodes].forEach((node: HTMLElement) => {
      if (node === target) {
        node.style.color = "#007aff";
      } else {
        node.style.color = "#fff";
      }
    });
  }
}
