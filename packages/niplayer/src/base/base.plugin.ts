import { NI_PLAYER_EVENT } from "@/shared/events";
import NiPlayer from "@/player";
/**
 * @desc 声明插件的类型
 */
export interface Plugin {
    new(player: NiPlayer): void
}
/**
 * @instance 插件基类，插件类型包括：UI类插件 + 功能类插件
 */
export default abstract class BasePlugin {
    /**
     * @desc 插件名称
     */
    protected abstract name: string;
    /**
     * @desc 插件初始化前的钩子
     */
    protected beforeInit() {}
    /**
     * @desc 插件安装
     */
    protected abstract install(): void;
    /**
     * @desc 插件卸载
     */
    protected abstract dispose(): void;

    constructor(public player: NiPlayer) {
        this.player.on(NI_PLAYER_EVENT.BEFORE_INIT, () => {
            this.beforeInit();
        })
        this.player.on(NI_PLAYER_EVENT.MOUNTED, () => {
            this.install();
            this.log();
        })
    }

    private log() {
        console.log(`[Plugin Installed] The UIPlugin "${this.name}" has been installed`);
    }
}