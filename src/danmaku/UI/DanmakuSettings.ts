import { SubsettingsMain } from "@/component";
import { SubsettingsDanmakuMain } from "@/component/ToolBar/BottomBar/parts/Subsettings/parts/danmaku/SubsettingsDanmakuMain";
import { Player } from "@/page/player";
import { danmakuPath$1, danmakuPath$2, rightarrowPath } from "@/svg";
import { SubsettingsBaseConstructor } from "@/types/Player";
import { createSvg, createSvgs } from "@/utils";

export class DanmakuSettings {
  readonly id = "DanmakuSettings";
  player: Player;
  subsettingsMain: SubsettingsMain;
  constructor(
    player: Player,
  ) {
    this.player = player;
    this.init();
  }

  init(): void {
    this.initTemplate();
  }

  initTemplate(): void {
    this.subsettingsMain = (SubsettingsMain as SubsettingsBaseConstructor)
      .instance as SubsettingsMain;

    this.subsettingsMain.registerSubsettingsItem({
      leftIcon: createSvgs([danmakuPath$1,danmakuPath$2],"0 0 1024 1024"),
      leftText: "弹幕设置",
      rightTip: "更多",
      rightIcon: createSvg(rightarrowPath, '0 0 1024 1024'),
      target: SubsettingsDanmakuMain
    })
  }
}
