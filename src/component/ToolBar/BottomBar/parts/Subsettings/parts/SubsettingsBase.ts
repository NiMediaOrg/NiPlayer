import { SingleTapEvent, wrap } from "ntouch.js";
import { BaseEvent } from "@/class/BaseEvent";
import { Player } from "@/page/player";
import {
  SubsettingsBaseConstructor,
  SubsettingsItem,
} from "@/types/Player";
import { SubSetting } from "../SubSetting";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsBase extends BaseEvent {
  id = "SubsettingsBase";
  el: HTMLElement;
  clickOrTap: "click" | "singleTap" = "click"
  readonly player: Player;
  readonly subsetting: SubSetting;

  SubsettingsItem: SubsettingsItem[];

  constructor(subsetting: SubSetting, player: Player) {
    super();
    this.player = player;
    this.subsetting = subsetting;
    (this as any).__proto__.constructor.instance = this;
  }

  initBaseSubsettingsItem() {
    this.SubsettingsItem.forEach((item) => {
      this.registerSubsettingsItem(item);
      item.instance.el.dataset.SubsettingsSubtitleType = item.leftText;
    });
  }

  initPCEvent() {
    this.clickOrTap = "click"
  }


  initMobileEvent() {
    this.clickOrTap = "singleTap"
  }

  // target表示点击你这个item，需要跳转到哪一个SubsettingsBase
  registerSubsettingsItem(
    item: SubsettingsItem
  ) {
    let base = null;
    if (item.target) {
      if (item.target instanceof SubsettingsBase) {
        base = item.target;
      } else {
        if((item.target as SubsettingsBaseConstructor).instance) {
          base = (item.target as SubsettingsBaseConstructor).instance;
        } else {
          base = new item.target(this.subsetting, this.player);
        }
      }
      this.subsetting.registerSubsettingsBase(base);
      
      if (!this.subsetting.subsettingsBaseGraph.has(this)) {
        this.subsetting.subsettingsBaseGraph.set(this, [base]);
      } else {
        let res = this.subsetting.subsettingsBaseGraph.get(this);
        !res.includes(base) && res.push(base);
        this.subsetting.subsettingsBaseGraph.set(this, res);
      }
    }
    if(!this.SubsettingsItem.includes(item)) this.SubsettingsItem.push(item);

    let instance = new SubsettingItem(
      this.player,
      item.leftIcon,
      item.leftText,
      item.rightTip,
      item.rightIcon
    );
    item.instance = instance;
    this.el.appendChild(instance.el);

    if(this.player.env === "PC") {
      this.initPCEvent()
    } else {
      this.initMobileEvent()
    }
    wrap(instance.el).addEventListener(this.clickOrTap, (e: MouseEvent | SingleTapEvent) => {
      if(e instanceof MouseEvent) {
        e.stopPropagation();
      }
      if (item.target) {
        this.el.style.display = "none";
        base.el.style.display = "";

        this.subsetting.hideBox.style.width = base.el.dataset.width
          ? base.el.dataset.width + "px"
          : "200px";
      }
      if (item.click) item.click(item);
    },{
      stopPropagation: true
    });

    return item;
  }
}
