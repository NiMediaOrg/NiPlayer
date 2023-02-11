import { SingleTapEvent, wrap } from "ntouch.js";
import { EVENT } from "../../../../events";
import { Player } from "../../../../page/player";
import { DOMProps, Node } from "../../../../types/Player";
import { addClass, createSvg } from "../../../../utils/domUtils";
import { storeControlComponent } from "../../../../utils/store";
import { fullscreenExitPath, fullscreenPath } from "../../../../svg/index";
import { Options } from "./Options";
import {beFull, exitFull, isFull} from 'be-full';

export class FullScreen extends Options {
  readonly id = "FullScreen";
  enterFullScreen: boolean = false;
  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(player, container, 0, 0, desc, props, children);
    this.init();
  }

  init() {
    this.initTemplate();
    this.initEvent();
    storeControlComponent(this);
  }

  initTemplate() {
    addClass(this.el, ["video-fullscreen", "video-controller"]);
    this.icon = createSvg(fullscreenPath);
    this.iconBox.appendChild(this.icon);
    this.el.appendChild(this.iconBox);

    this.hideBox.innerText = "全屏";
    this.hideBox.style.fontSize = "13px";
  }

  initEvent() {
    this.onClick = this.onClick.bind(this);
    if (this.player.env === "PC") {
      this.el.onclick = this.onClick;
    } else {
      wrap(this.el).addEventListener("singleTap", this.onClick);
    }
  }

  onClick(e: Event | SingleTapEvent) {
    if (!isFull(this.player.container)) {
      // 调用浏览器提供的全屏API接口去请求元素的全屏，原生全屏分为  竖屏全屏 + 横屏全屏
      beFull(this.player.container);
      this.iconBox.removeChild(this.icon);
      this.icon = createSvg(fullscreenExitPath);
      this.iconBox.appendChild(this.icon);
      this.player.container.addEventListener("fullscreenchange", (e) => {
        this.player.emit(EVENT.ENTER_FULLSCREEN);
      });
    } else if (isFull(this.player.container)) {
      exitFull();
      this.iconBox.removeChild(this.icon);
      this.icon = createSvg(fullscreenPath);
      this.iconBox.appendChild(this.icon);
      this.player.container.addEventListener("fullscreenchange", (e) => {
        this.player.emit(EVENT.LEAVE_FULLSCREEN);
      });
    }
  }
}
