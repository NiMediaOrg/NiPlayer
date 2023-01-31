import { queue } from "../mock/queue";
import { Player } from "../page/player";
import { Danmaku } from "./Danmaku";
import { DanmakuInput } from "./UI/DanmakuInput";

export class DanmakuController {
    private video: HTMLVideoElement;
    private container: HTMLElement;
    private player: Player;
    private danmaku: Danmaku;
    private danmakuInput: DanmakuInput;
    private timer: number | null = null;
    private index = 0;
    constructor(player: Player) {
        this.player = player
        this.video = player.video;
        this.container = player.container;
        this.init();
    }

    init() {
        this.danmaku = new Danmaku([],this.container);
        this.initTemlate();
        this.initializeEvent();
    }

    initTemlate() {
        let ctx = this;
        this.danmakuInput = new DanmakuInput(this.player, null,"div");
        this.player.use({
            install(player) {
                player.registerControls(ctx.danmakuInput.id,ctx.danmakuInput,"medium");
            }
        })
    }


    initializeEvent() {
        this.video.addEventListener("timeupdate",(e:Event)=>{
            this.onTimeupdate(e);
        })

        this.video.addEventListener("seeking",(e:Event) => {
            this.onSeeking(e);
        })

        this.video.addEventListener("play",(e:Event)=>{
            this.start();
            this.danmaku.resume();
        })

        this.video.addEventListener("pause",(e:Event) => {
            this.pause();
            this.danmaku.pause();
        })

        this.video.addEventListener("loadedmetadata",(e) => {})
        this.danmakuInput.on("sendData",function(data) {
            // 此处为发送弹幕的逻辑
            // console.log(data);
            queue.push(data);
            // console.log(queue);
        })
    }

    start() {
        this.timer = window.setInterval(()=>{
            // console.log(queue);
            this.danmaku.addData(queue[(this.index++)%queue.length]);
        },50)
    }

    pause() {
        window.clearInterval(this.timer);
    }

    onTimeupdate(e:Event) {
        let video = e.target as HTMLVideoElement;
        let currentTime = video.currentTime;
        
    }

    onSeeking(e:Event) {
        this.danmaku.flush();
    }
}