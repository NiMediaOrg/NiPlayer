import { Options } from "../Options";
import { Player } from "../../../../../page/player";
import { storeControlComponent } from "../../../../../utils/store";
import { subSettingPath } from "../../../../../svg";
import {
  $,
  addClass,
  createSvg,
  includeClass,
  removeClass,
} from "../../../../../utils/domUtils";
import { wrap } from "ntouch.js";
import { SubsettingsMain } from "./parts/SubsettingsMain";
import { SubsettingsPlayrate } from "./parts/SubsettingsPlayrate";
import { SubsettingsItem } from "../../../../../types/Player";

export class SubSetting extends Options {
  readonly id = "SubSetting";
  clickOrTap: "click" | "singleTap";
  mask: HTMLElement;
  subsettingsMain: SubsettingsMain;
  subsettingsPlayrate: SubsettingsPlayrate;
  currenttShow: HTMLElement;
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
    this.icon = createSvg(subSettingPath);
    this.iconBox.appendChild(this.icon);
    this.el.appendChild(this.iconBox);
    this.el.appendChild(this.hideBox);

    this.initSubSettingTemplate();
  }

  initSubSettingTemplate() {
    this.subsettingsMain = new SubsettingsMain(this.player);
    this.subsettingsPlayrate = new SubsettingsPlayrate(this.player);
    this.hideBox.appendChild(this.subsettingsMain.el);
    this.hideBox.appendChild(this.subsettingsPlayrate.el);
    this.currenttShow = this.subsettingsMain.el;
    this.hideBox.style.width = this.subsettingsMain.el.dataset.width + "px";
  }

  initEvent(): void {
    if (this.player.env === "PC") {
      this.initPCEvent();
    } else {
      this.initMobileEvent();
    }

    this.el.onmouseenter = null;
    wrap(this.iconBox).addEventListener(this.clickOrTap, (e) => {
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
    });

    this.player.on("MainSubsettingsItemClick",(item: SubsettingsItem, index: number) => {
      if(index === 0) { //展示播放速率的设置界面
        this.currenttShow.style.display = "none";
        this.subsettingsPlayrate.el.style.display = "";
        this.hideBox.style.width = this.subsettingsPlayrate.el.dataset.width + "px"
        this.currenttShow = this.subsettingsPlayrate.el; 
      }
    })
  }

  initPCEvent(): void {
    this.clickOrTap = "click";
  }

  initMobileEvent(): void {
    this.clickOrTap = "singleTap";
  }
}
