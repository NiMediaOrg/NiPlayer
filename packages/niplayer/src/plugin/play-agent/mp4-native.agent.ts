import { PlayerConfig } from "@/types";

export class Mp4NativeAgent {
    constructor(private video: HTMLVideoElement, private config: PlayerConfig) {
        this.init();
    }
    init() {
        console.log("mp4-native agent init");
        this.video.src = this.config.url;
    }
}