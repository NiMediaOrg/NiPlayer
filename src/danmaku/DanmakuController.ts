import { EVENT } from "../events";
import { Player } from "../page/player";
import { DanmakuOptions } from "../types/Player";
import { Danmaku } from "./Danmaku";
import { DanmakuInput } from "./UI/DanmakuInput";
import { DanmakuOpenClose } from "./UI/DanmakuOpenClose";
import { DanmakuSettings } from "./UI/DanmakuSettings";
import io from "socket.io-client/dist/socket.io";
import "../utils/polyfill";
import { $ } from "../utils/domUtils";
/**
 * @description 控制弹幕的类 Controller层
 */
export class DanmakuController {
  private video: HTMLVideoElement;
  private container: HTMLElement;
  private player: Player;
  private danmaku: Danmaku;
  private danmakuInput: DanmakuInput;
  private danmakuOpenClose: DanmakuOpenClose;
  private options: DanmakuOptions;
  private el: HTMLElement;
  danmakuSettings: DanmakuSettings;
  constructor(player: Player, options: DanmakuOptions) {
    this.player = player;
    this.video = player.video;
    this.container = player.el;

    this.options = Object.assign(
      {
        type: "http",
      },
      options
    );
    this.init();
  }

  init() {
    this.el = $("div.video-danmaku-container");
    this.container.appendChild(this.el)
    this.danmaku = new Danmaku(this.el, this.player);
    this.initTemlate();
    this.initializeEvent();
    if (this.options.type === "websocket") {
      this.initWebSocket();
    } else {
      this.initHTTP();
    }
  }

  initWebSocket() {
    const socket = io(this.options.api, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {

      this.player.video.addEventListener("timeupdate",(e) => {
        socket.emit(EVENT.REQUEST_DANMAKU_DATA,{
          time: this.player.video.currentTime
        })
      })
      
      socket.on(EVENT.SEND_DANMAKU_DATA,(data: any[]) => {
        console.log(`接受到数据${JSON.stringify(data)},当前时间${this.player.video.currentTime}`);
        
        for(let item of data) {
          this.danmaku.addData(item)
        }
      })
    });

    socket.connect();
  }

  initHTTP() {}

  initTemlate() {
    let ctx = this;
    this.danmakuInput = new DanmakuInput(this.player, null, "div");
    this.danmakuSettings = new DanmakuSettings(this.player);
    this.danmakuOpenClose = new DanmakuOpenClose(this.player, null, "div");
    this.player.use({
      install(player) {
        player.mountComponent(ctx.danmakuOpenClose.id, ctx.danmakuOpenClose, {
          mode: {
            type: "BottomToolBar",
            pos: "medium",
          },
        });

        player.mountComponent(ctx.danmakuInput.id, ctx.danmakuInput, {
          mode: {
            type: "BottomToolBar",
            pos: "medium",
          },
        });
      },
    });
  }

  initializeEvent() {
    // 弹幕功能实现的核心是timeupdate方法！！！！
    this.video.addEventListener("timeupdate", (e: Event) => {
      this.onTimeupdate(e);
    });

    this.video.addEventListener("seeking", (e: Event) => {
      this.onSeeking(e);
    });

    this.video.addEventListener("pause", () => {
      //暂停所有的弹幕
      this.danmaku.pause();
    });

    this.video.addEventListener("waiting",() => {
      this.danmaku.pause();
    })

    this.video.addEventListener("abort",() => {
      this.danmaku.flush();
    })

    this.video.addEventListener("play", () => {
      this.danmaku.resume();
    });

    this.danmakuInput.on("sendData", function (data) {
      // 此处为发送弹幕的逻辑
    });

    this.player.on(EVENT.DOT_DRAG, () => {
      this.danmaku.flush();
    });

    this.player.on("closeDanmaku", () => {
      this.danmaku.close();
    });

    this.player.on("openDanmaku", () => {
      this.danmaku.open();
    });
  }

  onTimeupdate(e: Event) {
    // 时间更新
    // 如果默认请求弹幕数据的方式为http请求，则需要进行轮询
  }

  onSeeking(e: Event) {
    this.danmaku.flush();
  }

  setTrackNumber(num: number) {
    this.danmaku.setTrackNumber(num);
  }

  setOpacity(opacity: number) {
    this.danmaku.setOpacity(opacity);
  }
}
