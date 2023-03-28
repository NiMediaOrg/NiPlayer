import { Component } from "@/class/Component";
import { Player } from "@/page/player";
import { ComponentItem, DOMProps, Node } from "@/types/Player";
import { $, addClass } from "@/utils/domUtils";
import "./index.less";
export class DanmakuInput extends Component implements ComponentItem {
  readonly id = "DanmakuInput";
  props: DOMProps;
  player: Player;
  inputBox: HTMLInputElement;
  sendBox: HTMLElement;
  constructor(
    player: Player,
    container?: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children);
    this.props = props || {};
    this.player = player;
    this.init();
  }

  init() {
    this.initTemplate();
    this.initEvent();
  }

  initTemplate(): void {
    addClass(this.el, ["danmaku-input-wrapper"]);
    this.inputBox = $("input.danmaku-input", { type: "text" });
    this.sendBox = $("span.danmaku-send");
    this.sendBox.innerText = "发送";
    this.el.appendChild(this.inputBox);
    this.el.appendChild(this.sendBox);
  }

  initEvent(): void {
    this.sendBox.onclick = (e) => {
      e.stopPropagation();
      let value = this.inputBox.value;
      this.emit("sendData", value);
      this.inputBox.value = "";
      this.inputBox.blur();
    };

    this.inputBox.addEventListener("focus", (e) => {
      e.stopPropagation();
      this.player.emit("inputFocus");
    });

    this.inputBox.addEventListener("blur", (e) => {
      e.stopPropagation();
      this.player.emit("inputBlur");
    });

    this.inputBox.addEventListener("click",(e) => {
      e.stopPropagation()
    })
  }
}
