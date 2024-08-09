import NiPlayer from "@/player";

/**
 * @instance 插件基类，插件类型包括：UI类插件 + 功能类插件
 */
export default abstract class BasePlugin {
    protected abstract name: string;
    protected abstract install(): void;
    protected player: NiPlayer;

    constructor(player: NiPlayer) {
        this.player = player;
        this.install();
    }
}