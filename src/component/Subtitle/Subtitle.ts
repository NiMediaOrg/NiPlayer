// 字幕功能  -- 包含外挂字幕以及软字幕
import { Player } from "@/page/player";
import { SubsettingsBaseConstructor, SubsettingsItem, Subtitles } from "@/types/Player";
import HTTPRequest from "@/mp4/net/HTTPRequest";
import { XHRLoader } from "@/mp4/net/XHRLoader";
import { $, addClass, createSvg, createSvgs, removeClass } from "@/utils/domUtils";
import { EVENT } from "@/events";
import { nextTick } from "@/utils/nextTick";
import { SubsettingsSubtitle } from "../ToolBar/BottomBar/parts/Subsettings/parts/SubsettingsSubtitle";
import { rightarrowPath, settingsConfirmPath, subtitlePath$1, subtitlePath$2 } from "@/svg";
import { SubsettingItem } from "../ToolBar/BottomBar/parts/Subsettings/SubsettingItem";
import { SubsettingsMain } from "../ToolBar";
export class Subtitle {
  player: Player;
  subtitles: (Subtitles & { instance?: SubsettingItem })[];
  defaultSubtitle: Subtitles;
  trackElement: HTMLTrackElement;
  textTrack: TextTrack; //一个textTrack对应一个字幕文件
  xhrLoader: XHRLoader;
  subsettingsSubtitle: SubsettingsSubtitle;
  subsettingsMain: SubsettingsMain;
  leadItem: SubsettingsItem;
  currentSource: string;
  el: HTMLElement;
  constructor(player: Player, subtitles: Subtitles[]) {
    this.player = player;
    this.subtitles = subtitles;
    this.init();
  }

  init() {
    this.initTemplate();
    this.initTextTrack();

    this.adjustSubtitleStyle(this.defaultSubtitle);
    this.initEvent();
  }

  initTemplate() {
    // 设置字幕的样式
    this.el = $("div.video-texttrack-container");
    this.player.el.appendChild(this.el);

    this.subsettingsMain = (SubsettingsMain as SubsettingsBaseConstructor).instance as SubsettingsMain
    this.leadItem = this.subsettingsMain.registerSubsettingsItem({
        leftIcon: createSvgs([subtitlePath$1, subtitlePath$2], "0 0 1024 1024"),
        leftText: "字幕设置",
        rightTip: "默认",
        rightIcon: createSvg(rightarrowPath, "0 0 1024 1024"),
        target: SubsettingsSubtitle   
    })
  }

  // 调整字幕的样式
  adjustSubtitleStyle(subtitle: Subtitles) {
    console.log(subtitle.style)
    for(let key in this.defaultSubtitle.style) {
      this.el.style[key] = ""
    }

    if(subtitle.style) {
      for(let key in subtitle.style) {
        this.el.style[key] = subtitle.style[key];
      }
    }
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

    this.player.on("HideSubtitle",() => {
        this.currentSource = this.trackElement.src;
        this.trackElement.src = ""
        this.el.innerHTML = ""
    }) 

    this.player.on("ShowSubtitle",() => {
        this.trackElement.src = this.currentSource;
    })

    // 初始化设置栏中的字幕设置选项
    nextTick(() => {
      let ctx = this;
      this.subsettingsSubtitle = (SubsettingsSubtitle as SubsettingsBaseConstructor).instance as SubsettingsSubtitle;
      this.subtitles.forEach((item) => {
        let leftIcon = null;
        if (item === this.defaultSubtitle) {
          leftIcon = createSvg(settingsConfirmPath, "0 0 1024 1024");
        }
        let subsettingsItem = this.subsettingsSubtitle.registerSubsettingsItem({
          leftIcon: leftIcon,
          leftText: item.tip,
          target: SubsettingsMain,
          click: (value: SubsettingsItem) => {
            this.leadItem.instance.rightTipBox.innerText = value.leftText;
            ctx.trackElement.src = item.source; //改变字幕，就是修改字幕的源文件
            ctx.adjustSubtitleStyle(item); //每次修改字幕时都需要调整其字幕样式
            ctx.defaultSubtitle = item;
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
          }
        });

        item.instance = subsettingsItem.instance;
      });
    });

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
