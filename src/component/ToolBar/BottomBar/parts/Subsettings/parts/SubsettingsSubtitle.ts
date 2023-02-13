import { Player } from "../../../../../../page/player";
import { leftarrowPath, subtitleShowPath, switchOffPath, switchOnPath } from "../../../../../../svg";
import { SubsettingsItem } from "../../../../../../types/Player";
import { $, addClass, createSvg } from "../../../../../../utils/domUtils";
import { storeControlComponent } from "../../../../../../utils/store";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsSubtitle {
  readonly id = "SubsettingsSubtitle";
  readonly player: Player;
  leadItem: SubsettingsItem;
  el: HTMLElement;
  switchOnIcon: SVGSVGElement = createSvg(switchOffPath,'0 0 1024 1024');
  switchOffIcon: SVGSVGElement = createSvg(switchOnPath,'0 0 1024 1024');
  status: "show" | "hide" = "show";
  SubsettingsItem: SubsettingsItem[] = [
    {
      leftIcon: createSvg(leftarrowPath, "0 0 1024 1024"),
      leftText: "字幕设置",
    },
    {
      leftIcon: createSvg(subtitleShowPath,'0 0 1024 1024'),  
      leftText: "字幕显示",
      rightTip: "Show",
      rightIcon: this.switchOnIcon
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
    addClass(this.switchOffIcon,["video-switch-off"])
    addClass(this.switchOnIcon,["video-switch-on"])
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

    this.SubsettingsItem[1].instance.rightElementBox.appendChild(this.switchOffIcon)
    this.switchOffIcon.style.display = "none";
  }

  initEvent() {
    for (let i = 0; i < this.SubsettingsItem.length; i++) {
        this.SubsettingsItem[i].instance.el.onclick = () => {
            if(i === 1) {
                if(this.status === "show") {
                    this.player.emit("HideSubtitle")
                    this.switchOffIcon.style.display = ""
                    this.switchOnIcon.style.display = "none"
                    this.status = "hide"
                    this.SubsettingsItem[i].instance.rightTipBox.innerText = "Hide"
                } else {
                    this.player.emit("ShowSubtitle")
                    this.switchOffIcon.style.display = "none"
                    this.switchOnIcon.style.display = ""
                    this.status = "show";
                    this.SubsettingsItem[i].instance.rightTipBox.innerText = "Show"
                }
                return;
            }
            this.player.emit("SubsettingsSubtitleClick", this.SubsettingsItem[i], i);
            
        };
    }    
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
