import BasePlugin from "@/base/base.plugin";
import { Mp4NativeAgent } from "./native-play/mp4-native.agent";
import { Mp4StreamAgent } from "./stream-play/mp4-stream.agent";

export class PlayAgent extends BasePlugin {
    protected name: string = 'play-agent';
    protected install(): void {
        if (this.player.config.streamPlay) {
            new Mp4StreamAgent(this.player);
        } else {
            new Mp4NativeAgent(this.player);
        }
    }

    protected dispose(): void {
        console.log(`${this.name} dispose`)
    }
}