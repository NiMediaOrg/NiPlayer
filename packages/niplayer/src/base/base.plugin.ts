import { NI_PLAYER_EVENT } from "@/events";
import NiPlayer from "@/player";

/**
 * @instance 插件基类，插件类型包括：UI类插件 + 功能类插件
 */
export default abstract class BasePlugin {
    protected abstract name: string;
    protected abstract install(): void;

    constructor(public player: NiPlayer) {
        this.player.on(NI_PLAYER_EVENT.MOUNTED, () => {
            this.install();
            this.log();
        })
    }

    private log() {
        console.log(`[Plugin Installed] The UIPlugin "${this.name}" has been installed`);
    }
}