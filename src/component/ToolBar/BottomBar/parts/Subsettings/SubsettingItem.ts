import { Player } from "@/page/player";
import { $ } from "@/utils/domUtils";

export class SubsettingItem {
  el: HTMLElement;
  player: Player;
  leftArea: HTMLElement;
  rightArea: HTMLElement;
  leftIconBox: HTMLElement;
  leftTextBox: HTMLElement;
  rightTipBox: HTMLElement;
  rightElementBox: HTMLElement;
  constructor(
    player: Player,
    leftIcon?: HTMLElement | SVGSVGElement,
    leftText?: string,
    rightTip?: string,
    rightElement?: HTMLElement | SVGSVGElement
  ) {
    this.player = player;
    this.init();

    if(leftIcon) this.leftIconBox.appendChild(leftIcon)
    if(leftText) this.leftTextBox.innerText = leftText
    if(rightTip) this.rightTipBox.innerText = rightTip
    if(rightElement) this.rightElementBox.appendChild(rightElement)

  }
  init() {
    this.el = $("div.video-subsettings-item");
    this.leftArea = $("div.video-subsettings-itemleft");
    this.rightArea = $("div.video-subsettings-itemright");
    this.leftIconBox = $("div.video-subsettings-itemleft-icon");
    this.leftTextBox = $("div.video-subsettings-itemleft-text");
    this.rightTipBox = $("div.video-subsettings-itemright-tip");
    this.rightElementBox = $("div.video-subsettings-itemright-icon");
    this.el.append(this.leftArea, this.rightArea);
    this.leftArea.append(this.leftIconBox, this.leftTextBox);
    this.rightArea.append(this.rightTipBox, this.rightElementBox);
  }
}
