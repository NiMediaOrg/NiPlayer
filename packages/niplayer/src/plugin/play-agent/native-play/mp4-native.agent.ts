import NiPlayer from "@/player";
import { PlayerConfig } from "@/types";

export class Mp4NativeAgent {
    private videoProxy: HTMLVideoElement;
    constructor(private player: NiPlayer) {
        this.videoProxy = this.player.nodes.videoElement;
        this.init();
    }
    init() {
        console.log("[Agent Init] mp4-native agent init");
        this.videoProxy.src = this.player.config.url;
    }
}