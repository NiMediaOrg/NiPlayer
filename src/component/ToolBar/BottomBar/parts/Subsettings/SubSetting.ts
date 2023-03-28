import { Options } from "../Options";
import { Player } from "@/page/player";
import { storeControlComponent } from "@/utils/store";
import { subSettingPath } from "@/svg";
import {
  $,
  addClass,
  createSvg,
  includeClass,
  removeClass,
} from "@/utils/domUtils";
import { SingleTapEvent, wrap } from "ntouch.js";
import { SubsettingsMain } from "./parts/SubsettingsMain";
import { SubsettingsBaseConstructor } from "@/types/Player";;
import { SubsettingsBase } from "./parts/SubsettingsBase";

export class SubSetting extends Options {
  readonly id = "SubSetting";
  clickOrTap: "click" | "singleTap";
  mask: HTMLElement;
  subsettingsBaseGraph: Map<SubsettingsBase,SubsettingsBase[] | null> = new Map();
  subsettingsMain: SubsettingsMain;

  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
  ) {
    super(player, container, 0, 0, desc);
    this.init();
  }

  init() {
    this.initTemplate();
    this.initEvent();
    storeControlComponent(this);
  }

  initTemplate() {
    addClass(this.el, ["video-subsettings", "video-controller"]);
    addClass(this.hideBox, ["video-subsettings-set"]);
    this.el["aria-label"] = "设置";
    this.icon = createSvg(subSettingPath, '0 0 1024 1024');
    this.iconBox.appendChild(this.icon);
    this.el.appendChild(this.iconBox);
    this.el.appendChild(this.hideBox);

    this.initSubSettingBase();
  }

  initSubSettingBase() {
   this.subsettingsMain = new SubsettingsMain(this,this.player);

   this.registerSubsettingsBase(this.subsettingsMain);
  }

  initEvent(): void {
    if (this.player.env === "PC") {
      this.initPCEvent();
    } else {
      this.initMobileEvent();
    }

    this.el.onmouseenter = null;
    wrap(this.iconBox).addEventListener(this.clickOrTap, (e: MouseEvent | SingleTapEvent) => {
      if(e instanceof Event) {
        e.stopPropagation();
      }
      if (!includeClass(this.icon, "video-subsettings-animate")) {
        addClass(this.icon, ["video-subsettings-animate"]);
      } else {
        removeClass(this.icon, ["video-subsettings-animate"]);
      }
      if (!includeClass(this.hideBox, "video-set-hidden")) {
        addClass(this.hideBox, ["video-set-hidden"]);
      } else {
        removeClass(this.hideBox, ["video-set-hidden"]);
      }
      this.player.emit("oneControllerHover", this);
    },{
      stopPropagation:true
    });
  }

  initPCEvent(): void {
    this.clickOrTap = "click";
  }

  initMobileEvent(): void {
    this.clickOrTap = "singleTap";
  }

  // 注册基础的子设置项
  registerSubsettingsBase(baseCons: SubsettingsBaseConstructor | SubsettingsBase) {
    if(baseCons instanceof SubsettingsBase) {
      this.hideBox.appendChild(baseCons.el);
    } else {
      let base = new baseCons(this,this.player)
      this.hideBox.appendChild(base.el);
    }
  }
}
