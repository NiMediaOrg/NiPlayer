import { Options } from "@/component";
import { danmakuClosePath, danmakuOpenPath } from "@/svg/index";
import { Player } from "@/page/player";
import { DOMProps, Node } from "@/types/Player";
import { $, addClass, createSvg } from "@/utils/domUtils";

export class DanmakuOpenClose extends Options {
  readonly id = "DanmakuOpenClose";
  player: Player;
  props: DOMProps;
  danmakuClosePath: string = danmakuClosePath;
  danmakuOpenPath: string = danmakuOpenPath;
  status: "open" | "close" = "open"
  msg: "开启弹幕" | "关闭弹幕" = "关闭弹幕"
  constructor(
    player: Player,
    container?: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(player, container, 0, 0 ,desc, props, children);
    this.props = props || {};
    this.player = player;
    this.init();
  }

  init(): void {
      this.initTemplate()
      this.initEvent()
  }

  initTemplate(): void {
      addClass(this.el,["video-danmaku-openclose","video-controller"])
      // 设置画布大小为1024 * 1024
      this.icon = createSvg(this.danmakuOpenPath,'0 0 1024 1024');
      this.iconBox.appendChild(this.icon);
      this.hideBox.innerText = this.msg;
      this.hideBox.style.fontSize = "13px"
  }

  initEvent(): void {
      this.iconBox.addEventListener("click",(e) => {
        e.stopPropagation();
        if(this.status === "open") {
            this.replaceIcon(createSvg(danmakuClosePath,'0 0 1024 1024'))
            this.status = "close"
            this.player.emit("closeDanmaku");
            this.msg = "开启弹幕";
            
        } else {
            this.replaceIcon(createSvg(danmakuOpenPath,'0 0 1024 1024'))
            this.status = "open"
            this.player.emit("openDanmaku")
            this.msg = "关闭弹幕"
        }
        this.hideBox.innerText = this.msg;
      })
  }
}
