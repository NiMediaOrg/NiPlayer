export class DanmakuController {
    private video: HTMLVideoElement;
    constructor(video:HTMLVideoElement) {
        this.video = video;
        this.init();
    }

    init() {
        this.initializeEvent();
    }


    initializeEvent() {
        this.video.ontimeupdate = (e: Event) => {
            this.onTimeupdate(e);
        };
    }

    onTimeupdate(e:Event) {
        let video = e.target as HTMLVideoElement;
        let currentTime = video.currentTime;

    }
}