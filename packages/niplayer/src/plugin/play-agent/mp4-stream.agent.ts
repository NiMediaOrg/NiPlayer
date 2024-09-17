import { PlayerConfig } from "@/types";

export class Mp4StreamAgent {
    constructor(private video: HTMLVideoElement, private config: PlayerConfig) {
        this.init();
    }

    private init() {
        console.log("mp4-stream agent init");
    }
}