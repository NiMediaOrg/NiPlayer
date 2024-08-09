import BasePlugin from "./base/base.plugin";
import { EventEmitter3 } from "./base/event-emitter3";
import { defaultConfig } from "./default-config";
import { MediaPlugin } from "./plugin/media.plugin";
import { RootStore } from "./store/root.store";
import { PlayerConfig } from "./types/config";
import { NI_PLAYER_EVENT } from "./types/events";

interface Plugin {
    new (player: NiPlayer):void;
}
/**
 * @desc 播放器的入口文件
 */
export default class NiPlayer extends EventEmitter3 {

    public config: PlayerConfig;
    public rootStore: RootStore;

    private videoElement: HTMLVideoElement;
    private plugins: Plugin[] = [
        MediaPlugin
    ];

    constructor(options?: PlayerConfig) {
        super();
        this.config = Object.assign(defaultConfig,options);
        this.rootStore = new RootStore(this);
        this.videoElement = this.config.video ?? document.createElement('video');
        this.emit(NI_PLAYER_EVENT.VIDEO_PREPARED, this.videoElement);
        this.registerPlugin();
    }

    public registerPlugin() {
        this.plugins.forEach(Plugin => {
            new Plugin(this);
        })
    }
}