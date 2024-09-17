import BasePlugin from "@/base/base.plugin";
import { Mp4NativeAgent } from "./mp4-native.agent";
import { Mp4StreamAgent } from "./mp4-stream.agent";

export class PlayAgent extends BasePlugin {
    protected name: string = 'play-agent';
    protected install(): void {
        if (this.player.config.streamPlay) {
            new Mp4StreamAgent(this.player.nodes.videoElement, this.player.config);
        } else {
            new Mp4NativeAgent(this.player.nodes.videoElement, this.player.config);
        }
    }
}