import { NI_PLAYER_EVENT } from "@/shared/events";
import NiPlayer from "@/player";

/**
 * @instance 插件基类，插件类型包括：UI类插件 + 功能类插件
 */
export default abstract class BasePlugin {
    /**
     * @desc 插件名称
     */
    protected abstract name: string;
    /**
     * @desc 插件安装
     */
    protected abstract install(): void;
    /**
     * @desc 插件卸载
     */
    protected abstract dispose(): void;

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