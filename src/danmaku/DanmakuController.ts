import { EVENT } from "../events";
import { Player } from "../page/player";
import { DanmakuOptions } from "../types/Player";
import { Danmaku } from "./Danmaku";
import { DanmakuInput } from "./UI/DanmakuInput";
import { DanmakuOpenClose } from "./UI/DanmakuOpenClose";
import { DanmakuSettings } from "./UI/DanmakuSettings";
import * as io from "socket.io-client";
import "../utils/polyfill";
import { $, addClass, removeClass } from "../utils/domUtils";
import { Axios } from "../utils/net";
import { DanmakuData } from "../types/danmaku";

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
  private danmakuLoading: HTMLElement;
  private instance: Axios;
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
    this.instance = new Axios({
      baseURL: "",
      timeout: this.options.timeout ?? null
    })
    this.init();
  }

  init() {
    this.onTimeupdate = this.onTimeupdate.bind(this);

    this.el = $("div.video-danmaku-container");
    this.el.style.backgroundColor = "#000";
    this.danmakuLoading = $("div");
    addClass(this.danmakuLoading,["video-danmaku-loading-base","video-danmaku-loading","video-danmaku-shaking"])
    this.danmakuLoading.innerHTML = "<span>弹幕数据加载中...</span>"
    this.container.appendChild(this.el)
    this.el.appendChild(this.danmakuLoading)
    this.danmaku = new Danmaku(this.el, this.player);
    this.initTemlate();
    this.initializeEvent();
    if (this.options.type === "websocket") {
      this.initWebSocket();
    } else {
      this.initHTTP();
    }
  }

  //TODO 初始化websocket连接
  initWebSocket() {
    const socket = io.io(this.options.api, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      this.setDanmakuSuccess()
      //* 当播放器时间更新是需要请求新的弹幕数据
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

    socket.io.on("error", () => {
      this.setDanmakuFail()
    });

    socket.connect();
  }

  initHTTP() {
    //TODO  初始化http轮询连接
    this.instance.get(this.options.api,{
      query:{
        time: 0
      }
    }).then((value) => {
      this.setDanmakuSuccess();

      this.player.video.addEventListener("timeupdate",this.onTimeupdate)
    },(err) => {
      this.setDanmakuFail();
    })
  }

  setDanmakuFail() {
    this.el.style.backgroundColor = "";
      (this.danmakuLoading.childNodes[0] as HTMLElement).innerText = '弹幕加载失败';
      removeClass(this.danmakuLoading,["video-danmaku-loading","video-danmaku-shaking"]);

      setTimeout(() => {
        addClass(this.danmakuLoading,["video-danmaku-loading-hide"])
      }, 3000);
  }

  setDanmakuSuccess() {
    this.el.style.backgroundColor = "";
      (this.danmakuLoading.childNodes[0] as HTMLElement).innerText = '弹幕加载成功';
      removeClass(this.danmakuLoading,["video-danmaku-loading","video-danmaku-shaking"]);

      setTimeout(() => {
        addClass(this.danmakuLoading,["video-danmaku-loading-hide"])
      }, 3000);
  }

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

    this.video.addEventListener("seeked", (e: Event) => {
      this.onSeeked(e);
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

    this.video.addEventListener("canplay",() => {
      this.danmaku.resume()
    })

    this.video.addEventListener("timeupdate",() => {
      this.danmaku.setPaused(false)
    })

    this.danmakuInput.on("sendData", function (data) {
      //TODO 此处为发送弹幕的逻辑
    });

    this.player.on("closeDanmaku", () => {
      this.danmaku.close();
    });

    this.player.on("openDanmaku", () => {
      this.danmaku.open();
    });

    this.player.on(EVENT.RESIZE,() => {
      this.setTrackNumber();
    })
  }

  onTimeupdate(e: Event) {
    //TODO 时间更新
    //TODO 如果默认请求弹幕数据的方式为http请求，则需要进行轮询
    this.instance.get(this.options.api,{
      query:{
        time: this.player.video.currentTime
      },
    }).then((value: DanmakuData[]) => {
      for(let data of value) {
        this.danmaku.addData(data);
      }
    })
  }

  onSeeked(e: Event) {
    this.danmaku.flush();
  }

  //* 设置弹幕轨道是数目
  setTrackNumber(num?: number) {
    this.danmaku.setTrackNumber(num || null);
  }

  //* 设置弹幕的透明度
  setOpacity(opacity: number) {
    this.danmaku.setOpacity(opacity);
  }

  setFontSize(scale: number) {
    this.danmaku.setFontSize(scale);
  }
}
