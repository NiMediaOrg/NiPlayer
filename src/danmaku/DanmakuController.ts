import { queue } from "../mock/queue";
import { Danmaku } from "./Danmaku";

export class DanmakuController {
    private video: HTMLVideoElement;
    private container: HTMLElement;
    private danmaku: Danmaku;
    private timer: number | null = null;
    private index = 0;
    constructor(video:HTMLVideoElement,container: HTMLElement) {
        this.video = video;
        this.container = container;
        this.init();
    }

    init() {
        this.danmaku = new Danmaku([],this.container);
        this.initializeEvent();
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

        this.video.addEventListener("loadedmetadata",(e) => {
            
            
        })
    }

    start() {
        this.timer = window.setInterval(()=>{
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

    }
}