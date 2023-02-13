import { Player } from "../../../../../../page/player";
import { leftarrowPath } from "../../../../../../svg";
import { SubsettingsItem } from "../../../../../../types/Player";
import { $, createSvg } from "../../../../../../utils/domUtils";
import { storeControlComponent } from "../../../../../../utils/store";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsSubtitle {
  readonly id = "SubsettingsSubtitle";

  readonly player: Player;
  el: HTMLElement;
  SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(leftarrowPath, "0 0 1024 1024"),
      leftText: "字幕设置",
    },
    {
      leftText: "字幕显示",
      rightTip: "Show",
    },
  ];
  constructor(player: Player) {
    this.player = player;
    this.init();

    storeControlComponent(this);
  }

  init() {
    this.el = $("div.video-subsettings-subtitle");
    this.el.dataset.width = "180";
    this.el.style.display = "none";
    this.initSubsettingsItem();
    this.initEvent();
  }

  initSubsettingsItem() {
    this.SubsettingsItem.forEach((item) => {
      let instance = new SubsettingItem(
        this.player,
        item.leftIcon,
        item.leftText,
        item.rightTip,
        item.rightIcon
      );
      this.el.appendChild(instance.el);
      item.instance = instance;
      instance.el.dataset.SubsettingsSubtitleType = item.leftText;
    });
  }

  initEvent() {
    for (let i = 1; i < this.SubsettingsItem.length; i++) {
        this.SubsettingsItem[i].instance.el.onclick = () => {
            this.player.emit("SubsettingsSubtitleClick", this.SubsettingsItem[i], i);
        };
    }

    this.SubsettingsItem[0].instance.el.onclick = () => {
      this.player.emit("SubsettingsSubtitleClick", this.SubsettingsItem[0], 0);
    };
  }

  // 在Subtitle设置中注册一个选项
  registerSubsettingsItem(
    item: SubsettingsItem & {
        click?: (item: SubsettingsItem) => any
    }
  ): SubsettingsItem {
    this.SubsettingsItem.push(item);

    let instance = new SubsettingItem(this.player,item.leftIcon,item.leftText,item.rightTip,item.rightIcon);
    item.instance = instance;
    this.el.appendChild(instance.el);

    instance.el.addEventListener("click",(e) => {
        this.player.emit("SubsettingsSubtitleClick", item, this.SubsettingsItem.length - 1);

        if(item.click) item.click(item);
    })

    return item;
  }
}
