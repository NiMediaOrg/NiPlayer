import { EVENT } from "../events";
import { queue } from "../mock/queue";
import { Player } from "../page/player";
import { Danmaku } from "./Danmaku";
import { DanmakuInput } from "./UI/DanmakuInput";
import { DanmakuOpenClose } from "./UI/DanmakuOpenClose";
import { DanmakuSettings } from "./UI/DanmakuSettings";

/**
 * @description 控制弹幕的类 Controller层
 */
export class DanmakuController {
  private video: HTMLVideoElement;
  private container: HTMLElement;
  private player: Player;
  private danmaku: Danmaku;
  private danmakuInput: DanmakuInput;
  private danmakuSettings: DanmakuSettings;
  private danmakuOpenClose: DanmakuOpenClose;
  private timer: number | null = null;
  private index = 0;
  constructor(player: Player) {
    this.player = player;
    this.video = player.video;
    this.container = player.el;
    this.init();
  }

  init() {
    this.danmaku = new Danmaku(this.container, this.player);
    this.initTemlate();
    this.initializeEvent();
  }

  initTemlate() {
    let ctx = this;
    this.danmakuInput = new DanmakuInput(this.player, null, "div");
    this.danmakuSettings = new DanmakuSettings(this.player,null,"div");
    this.danmakuOpenClose = new DanmakuOpenClose(this.player,null,"div");
    this.player.use({
      install(player) {
        player.mountComponent(ctx.danmakuOpenClose.id,ctx.danmakuOpenClose, {
            mode: {
                type: "BottomToolBar",
                pos: "medium"
            }
        })

        player.mountComponent(ctx.danmakuSettings.id,ctx.danmakuSettings, {
            mode: {
                type: "BottomToolBar",
                pos: "medium"
            }
        })

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

    this.video.addEventListener("play", () => {
      this.danmaku.resume();
    });
    this.danmakuInput.on("sendData", function (data) {
      // 此处为发送弹幕的逻辑
      // console.log(data);
      queue.push(data);
      // console.log(queue);
    });

    this.player.on(EVENT.DOT_DRAG, (e) => {
      this.danmaku.flush();
    });

    this.player.on("closeDanmaku",() => {
        this.danmaku.close();
    })

    this.player.on("openDanmaku",() => {
        this.danmaku.open()
    })

  }

  onTimeupdate(e: Event) {
    let video = e.target as HTMLVideoElement;
    for (let i = 0; i < 30; i++) {
      this.danmaku.addData(queue[i % queue.length]);
    }
  }

  onSeeking(e: Event) {
    this.danmaku.flush();
  }
}
