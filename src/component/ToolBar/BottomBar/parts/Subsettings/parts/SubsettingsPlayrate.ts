import { Player } from "@/page/player";
import { leftarrowPath, settingsConfirmPath } from "@/svg";
import { SubsettingsItem } from "@/types/Player";
import { $, createSvg } from "@/utils/domUtils";
import { SubSetting } from "../SubSetting";
import { SubsettingsBase } from "./SubsettingsBase";
import { SubsettingsMain } from "./SubsettingsMain";

export class SubsettingsPlayrate extends SubsettingsBase {
  readonly id = "SubsettingsPlayrate"
  readonly SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(leftarrowPath, "0 0 1024 1024"),
      leftText: "播放速度",
      target: SubsettingsMain
    },
    {
      leftText: "0.5",
      target: SubsettingsMain
    },
    {
      leftText: "0.75",
      target: SubsettingsMain
    },
    {
      leftIcon: createSvg(settingsConfirmPath),
      leftText: "正常",
      target: SubsettingsMain
    },
    {
      leftText: "1.5",
      target: SubsettingsMain
    },
    {
      leftText: "2",
      target: SubsettingsMain
    },
  ];
  constructor(subsetting: SubSetting, player: Player) {
    super(subsetting, player);
    this.init();
  }

  init() {
    this.el = $("div.video-subsettings-playrate");
    this.el.dataset.width = "170";
    this.el.style.display = "none";
    this.initSubsettingsItem();
    this.initEvent();
  }

  initSubsettingsItem() {
    this.initBaseSubsettingsItem();
  }

  initEvent() {
    this.SubsettingsItem.forEach((item, index) => {
      item.instance.el.onclick = (e: MouseEvent) => {
        e.stopPropagation();

        if (item.leftText === "播放速度") {
          this.el.style.display = "none";

          let instance = this.subsetting.subsettingsBaseGraph.get(this)[0];
          instance.el.style.display = "";

          return;
        } else {
          if (item.leftText === "正常") {
            this.player.video.playbackRate = 1;
          } else {
            this.player.video.playbackRate = Number(item.leftText);
          }
        }

        item.leftIcon = createSvg(settingsConfirmPath);
        item.instance.leftIconBox.innerHTML = "";
        item.instance.leftIconBox.appendChild(item.leftIcon);

        for (let another of this.SubsettingsItem) {
          if (another !== item) {
            another.instance.leftIconBox.innerHTML = "";
          }
        }
      };
    });
  }
}
