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
import { SubsettingsSubtitle } from "./parts/SubsettingsSubtitle";

export class SubSetting extends Options {
  readonly id = "SubSetting";
  clickOrTap: "click" | "singleTap";
  mask: HTMLElement;
  subsettingsMain: SubsettingsMain;
  subsettingsPlayrate: SubsettingsPlayrate;
  subsettingsSubtitle: SubsettingsSubtitle;
  currentShow: HTMLElement;

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

    this.initSubSettingTemplate();
  }

  initSubSettingTemplate() {
    this.subsettingsMain = new SubsettingsMain(this.player);
    this.subsettingsPlayrate = new SubsettingsPlayrate(this.player);
    this.subsettingsSubtitle = new SubsettingsSubtitle(this.player);
    this.hideBox.appendChild(this.subsettingsMain.el);
    this.hideBox.appendChild(this.subsettingsPlayrate.el);
    this.hideBox.appendChild(this.subsettingsSubtitle.el);
    this.currentShow = this.subsettingsMain.el;
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
      e.stopPropagation();
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
      if(item.instance.el.dataset.SubsettingsMainType === "播放速度") { //展示播放速率的设置界面
        this.currentShow.style.display = "none";
        this.subsettingsPlayrate.el.style.display = "";
        this.subsettingsPlayrate.leadItem = item;
        this.hideBox.style.width = this.subsettingsPlayrate.el.dataset.width + "px"
        this.currentShow = this.subsettingsPlayrate.el; 
      } else if( item.instance.el.dataset.SubsettingsMainType === "画面比例") {
        
      } else if(item.instance.el.dataset.SubsettingsMainType === "字幕设置") {
        this.currentShow.style.display = "none";
        this.subsettingsSubtitle.el.style.display = "";
        this.subsettingsSubtitle.leadItem = item;
        this.hideBox.style.width = this.subsettingsSubtitle.el.dataset.width + "px"
        this.currentShow = this.subsettingsSubtitle.el; 
      }
    })

    this.player.on("SubsettingsPlayrateClick", (item: SubsettingsItem,index: number) => {
      this.currentShow.style.display = "none";
      this.currentShow = this.subsettingsMain.el;
      this.currentShow.style.display = "";
      this.hideBox.style.width = this.currentShow.dataset.width + "px";
      if(item.instance.el.dataset.SubsettingsPlayrate !== "0") {
        this.player.video.playbackRate = Number(item.instance.el.dataset.SubsettingsPlayrate);
      }
    })

    this.player.on("SubsettingsSubtitleClick",(item: SubsettingsItem,index: number) => {
      this.currentShow.style.display = "none";
      this.currentShow = this.subsettingsMain.el;
      this.currentShow.style.display = "";
      this.hideBox.style.width = this.currentShow.dataset.width + "px";
    })
  }

  initPCEvent(): void {
    this.clickOrTap = "click";
  }

  initMobileEvent(): void {
    this.clickOrTap = "singleTap";
  }
}
