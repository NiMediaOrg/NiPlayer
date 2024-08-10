import { EventEmitter3 } from "./base/event-emitter3";
import { defaultConfig } from "./default-config";
import { MediaPlugin } from "./plugin/media.plugin";
import { RootStore } from "./store/root.store";
import { PlayerConfig } from "../trash/types/config";
import { NI_PLAYER_EVENT } from "./events";
import { render } from "solid-js/web";
import { createEffect } from "solid-js";
interface Plugin {
    new (player: NiPlayer):void;
}
/**
 * @desc 播放器的入口文件
 */
export default class NiPlayer extends EventEmitter3 {

    public config: PlayerConfig;
    public rootStore: RootStore;

    public nodes: {
        container: HTMLDivElement,
        videoArea: HTMLDivElement,
        videoElement: HTMLVideoElement,
        controllerBar: HTMLDivElement
    } = {
        container: null,
        videoArea: null,
        videoElement: null,
        controllerBar: null,
    };

    private plugins: Plugin[] = [
        MediaPlugin
    ];

    constructor(options?: PlayerConfig) {
        super();
        this.config = Object.assign(defaultConfig,options);
        this.rootStore = new RootStore(this);
        this.renderPlugin();
        this.renderTemplate();
    }

    /**
     * @desc 初始化内置插件
     */
    private renderPlugin() {
        this.plugins.forEach(P => {
            new P(this);
        })
    }
    /**
     * @desc 构造播放器的整体模板
     */
    private renderTemplate(): void {
        const App = () => (
            <div class="niplayer-container" ref={this.nodes.container}>
                <div class="niplayer-video-area" ref={this.nodes.videoArea}>
                    {this.config.video ? '' : <video src={this.config.url} ref={this.nodes.videoElement}></video>}
                </div>
                <div class="niplayer-controller-area" ref={this.nodes.controllerBar}>

                </div>
            </div>
        );

        render(() => <App/>, this.config.container);

        this.emit(NI_PLAYER_EVENT.MOUNTED);
    }
    /**
     * @desc 注册插件
     */
    public registerPlugin(plugin: Plugin) {
        new plugin(this);
    }
    /**
     * @desc 注册并且订阅播放器内部的state
     * @param getter
     */
    public useState<T>(getter: () => T, callback: (newVal: T) => void) {
        createEffect(() => {
            const val = getter();
            callback(val);
        });
    }
    /**
     * @desc 注册一个副作用函数
     * @param handle 
     */
    public useEffect(handle: () => void) {
        createEffect(handle);
    }
}