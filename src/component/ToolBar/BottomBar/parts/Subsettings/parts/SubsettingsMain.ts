import { Player } from "@/page/player";
import {
  flipPath,
  playratePath,
  propotionPath$1,
  propotionPath$2,
  rightarrowPath,
} from "@/svg";
import { SubsettingsItem } from "@/types/Player";
import { $, createSvg, createSvgs } from "@/utils/domUtils";
import { SubSetting } from "../SubSetting";
import { SubsettingsBase } from "./SubsettingsBase";
import { SubsettingsPlayrate } from "./SubsettingsPlayrate";

export class SubsettingsMain extends SubsettingsBase {
  SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(playratePath, "0 0 1024 1024"),
      leftText: "播放速度",
      rightTip: "正常",
      rightIcon: createSvg(rightarrowPath, "0 0 1024 1024"),
      target: SubsettingsPlayrate
    },
    {
      leftIcon: createSvgs([propotionPath$1, propotionPath$2], "0 0 1024 1024"),
      leftText: "画面比例",
      rightTip: "默认",
      rightIcon: createSvg(rightarrowPath, "0 0 1024 1024"),
    },
    {
      leftIcon: createSvg(flipPath, "0 0 1024 1024"),
      leftText: "画面翻转",
      rightTip: "正常",
      rightIcon: createSvg(rightarrowPath, "0 0 1024 1024"),
    }
  ];
  constructor(subsetting: SubSetting, player: Player) {
    super(subsetting, player);
    this.init()
  }

  init() {
    this.el = $("div.video-subsettings-main");
    this.el.dataset.width = "200";
    this.subsetting.hideBox.style.width = this.el.dataset.width + "px";
    this.initSubsettingsItem();
    this.initEvent();
  }

  initSubsettingsItem() {
    this.initBaseSubsettingsItem();
  }

  initEvent() {}
}
