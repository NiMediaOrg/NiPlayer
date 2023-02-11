import { Options } from "../../component";
import { danmakuSettingPath } from "../../svg";
import { Player } from "../../page/player";
import { DOMProps, Node } from "../../types/Player";
import { addClass, createSvg } from "../../utils/domUtils";

export class DanmakuSettings extends Options {
  readonly id = "DanmakuSettings";
  player: Player;
  props: DOMProps;

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
  }

  initTemplate(): void {
      addClass(this.el,["video-danmaku-settings","video-controller"])
      // 设置画布大小为1024 * 1024
      this.icon = createSvg(danmakuSettingPath,'0 0 1024 1024');
      this.iconBox.appendChild(this.icon)
  }
}
