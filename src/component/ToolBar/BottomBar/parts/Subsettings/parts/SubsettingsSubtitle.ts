import { Player } from "@/page/player";
import {
  leftarrowPath,
  subtitleShowPath,
  switchOffPath,
  switchOnPath,
} from "@/svg";
import { SubsettingsItem } from "@/types/Player";
import { storeControlComponent } from "@/utils";
import { $, addClass, createSvg } from "@/utils/domUtils";
import { SubSetting } from "../SubSetting";
import { SubsettingsBase } from "./SubsettingsBase";
import { SubsettingsMain } from "./SubsettingsMain";

export class SubsettingsSubtitle extends SubsettingsBase {
  readonly id = "SubsettingsSubtitle";
  leadItem: SubsettingsItem;
  el: HTMLElement;
  switchOnIcon: SVGSVGElement = createSvg(switchOffPath, "0 0 1024 1024");
  switchOffIcon: SVGSVGElement = createSvg(switchOnPath, "0 0 1024 1024");
  status: "show" | "hide" = "show";
  SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(leftarrowPath, "0 0 1024 1024"),
      leftText: "字幕设置",
      target: SubsettingsMain
    },
    {
      leftIcon: createSvg(subtitleShowPath),
      leftText: "字幕显示",
      rightTip: "Show",
      rightIcon: this.switchOnIcon,
    },
  ];
  constructor(subsetting: SubSetting, player: Player) {
    super(subsetting, player);
    this.init();
  }

  init() {
    this.el = $("div.video-subsettings-subtitle");
    this.el.dataset.width = "180";
    this.el.style.display = "none";
    addClass(this.switchOffIcon, ["video-switch-off"]);
    addClass(this.switchOnIcon, ["video-switch-on"]);
    this.initSubsettingsItem();
    this.initEvent();

    storeControlComponent(this);
  }

  initSubsettingsItem() {
    this.initBaseSubsettingsItem();

    this.SubsettingsItem[1].instance.rightElementBox.appendChild(
      this.switchOffIcon
    );
    this.switchOffIcon.style.display = "none";
  }

  initEvent() {
    for (let i = 0; i < this.SubsettingsItem.length; i++) {
      this.SubsettingsItem[i].instance.el.onclick = (e) => {
        e.stopPropagation();
        if (i === 1) {
          if (this.status === "show") {
            this.player.emit("HideSubtitle");
            this.switchOffIcon.style.display = "";
            this.switchOnIcon.style.display = "none";
            this.status = "hide";
            this.SubsettingsItem[i].instance.rightTipBox.innerText = "Hide";
          } else {
            this.player.emit("ShowSubtitle");
            this.switchOffIcon.style.display = "none";
            this.switchOnIcon.style.display = "";
            this.status = "show";
            this.SubsettingsItem[i].instance.rightTipBox.innerText = "Show";
          }
          return;
        }
        this.player.emit(
          "SubsettingsSubtitleClick",
          this.SubsettingsItem[i],
          i
        );
      };
    }

    
  }
}
