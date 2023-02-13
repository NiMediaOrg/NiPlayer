// 字幕功能  -- 包含外挂字幕以及软字幕

import { Player } from "../../page/player";
import { SubsettingsItem, Subtitles } from "../../types/Player";
import HTTPRequest from "../../mp4/net/HTTPRequest";
import { XHRLoader } from "../../mp4/net/XHRLoader";
import { $, addClass, createSvg, removeClass } from "../../utils/domUtils";
import { EVENT } from "../../events";
import { ONCE_COMPONENT_STORE, storeControlComponent } from "../../utils/store";
import { nextTick } from "../../utils/nextTick";
import { SubsettingsSubtitle } from "../ToolBar/BottomBar/parts/Subsettings/parts/SubsettingsSubtitle";
import { settingsConfirmPath } from "../../svg";
import { SubsettingItem } from "../ToolBar/BottomBar/parts/Subsettings/SubsettingItem";
export class Subtitle {
  readonly id = "Subtitle";
  player: Player;
  subtitles: (Subtitles & { instance?: SubsettingItem })[];
  defaultSubtitle: Subtitles;
  trackElement: HTMLTrackElement;
  textTrack: TextTrack; //一个textTrack对应一个字幕文件
  xhrLoader: XHRLoader;
  subsettingsSubtitle: SubsettingsSubtitle;
  el: HTMLElement;
  constructor(player: Player, subtitles: Subtitles[]) {
    this.player = player;
    this.subtitles = subtitles;
    this.init();
  }

  init() {
    this.initTemplate();
    this.initTextTrack();
    this.initEvent();
    storeControlComponent(this);

    nextTick(() => {
      let ctx = this;
      this.subsettingsSubtitle = ONCE_COMPONENT_STORE.get(
        "SubsettingsSubtitle"
      ) as SubsettingsSubtitle;
      this.subtitles.forEach((item) => {
        let leftIcon = null;
        if (item === this.defaultSubtitle) {
          leftIcon = createSvg(settingsConfirmPath, "0 0 1024 1024");
        }
        let subsettingsItem = this.subsettingsSubtitle.registerSubsettingsItem({
          leftIcon: leftIcon,
          leftText: item.tip,
          click(value: SubsettingsItem) {
            ctx.trackElement.src = item.source;
            for (let index in ctx.subtitles) {
              ctx.subtitles[index].instance.leftIconBox.innerHTML = "";
              if (value.leftIcon) delete value.leftIcon;
              if (ctx.subtitles[index].instance === value.instance) {
                value.leftIcon = createSvg(
                  settingsConfirmPath,
                  "0 0 1024 1024"
                );
                ctx.subtitles[index].instance.leftIconBox.appendChild(
                  value.leftIcon
                );
              }
            }
          },
        });

        item.instance = subsettingsItem.instance;
      });
    });
  }

  initTemplate() {
    this.el = $("div.video-texttrack-container");
    this.player.el.appendChild(this.el);
  }

  initTextTrack() {
    this.xhrLoader = new XHRLoader();
    this.onsuccess = this.onsuccess.bind(this);
    this.defaultSubtitle = this.subtitles[0];
    for (let subtitle of this.subtitles) {
      if (subtitle.default) {
        this.defaultSubtitle = subtitle;
        break;
      }
    }
    this.trackElement = document.createElement("track");

    this.player.video.appendChild(this.trackElement);
    this.loadVTTFile(this.defaultSubtitle.source);
  }

  initEvent() {
    this.player.on(EVENT.SHOW_TOOLBAR, () => {
      addClass(this.el, ["video-texttrack-container-showtoolbar"]);
    });

    this.player.on(EVENT.HIDE_TOOLBAR, () => {
      removeClass(this.el, ["video-texttrack-container-showtoolbar"]);
    });

    this.textTrack = this.player.video.textTracks[0];

    this.textTrack.mode = "hidden"; //默认隐藏弹幕，使用我们自己的样式
    this.textTrack.addEventListener("cuechange", (e) => {
      this.el.innerHTML = "";
      if (this.textTrack.activeCues.length > 0) {
        [...this.textTrack.activeCues].forEach((cue: VTTCue) => {
          if (!cue) return;
          let texts = cue.text.split("\n");
          texts.forEach((text) => {
            let p = $("p");
            p.innerText = text;
            this.el.appendChild(p);
          });
        });
      }
    });
  }

  // 加载字幕文件
  loadVTTFile(source: string) {
    let request = new HTTPRequest({
      url: source,
      method: "get",
    });
    this.xhrLoader.load({
      request,
      success: (response: ArrayBuffer) => {
        this.onsuccess(response);
      }, //指定成功加载的回调
    });
  }

  onsuccess(response: ArrayBuffer) {
    let url = window.URL.createObjectURL(new Blob([response]));
    this.trackElement.src = url;
    this.trackElement.default = true;
    this.trackElement.srclang = this.defaultSubtitle.tip;
    this.trackElement.kind = "subtitles";
  }
}
