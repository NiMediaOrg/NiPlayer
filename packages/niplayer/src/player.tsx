import { EventEmitter3 } from "./base/event-emitter3";
import { defaultConfig } from "./default-config";
import { RootStore } from "./store/root.store";
import { PlayerConfig } from "../trash/types/config";
import { NI_PLAYER_EVENT } from "./events";
import { render } from "solid-js/web";
import { createEffect } from "solid-js";
import { PlayButton } from "./plugin/play-button";
import { TimeLabel } from "./plugin/time-label";
import { FullScreen } from "./plugin/ctrl-fullscreen";
import { PipInPip } from "./plugin/pip-in-pip";
import { Volume } from "./plugin/volume";
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
        controllerBar: HTMLDivElement,
        controllerBarTop:HTMLDivElement,
        controllerBarMiddle: HTMLDivElement,
        controllerBarBottom: HTMLDivElement,
        controllerBarMiddleLeft: HTMLDivElement,
        controllerBarMiddleMiddle: HTMLDivElement,
        controllerBarMiddleRight: HTMLDivElement,
    } = {
        container: null,
        videoArea: null,
        videoElement: null,
        controllerBar: null,
        controllerBarTop: null,
        controllerBarMiddle: null,
        controllerBarBottom: null,
        controllerBarMiddleLeft: null,
        controllerBarMiddleMiddle: null,
        controllerBarMiddleRight: null
    };

    private plugins: Plugin[] = [
        PlayButton,
        Volume,
        TimeLabel,
        PipInPip,
        FullScreen
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
     * @desc 构造播放器的整体DOM模板
     */
    private renderTemplate(): void {
        const App = () => (
            <div class="niplayer-container" ref={this.nodes.container}>
                <div class="niplayer-video-area" ref={this.nodes.videoArea}>
                    {this.config.video ? '' : <video src={this.config.url} ref={this.nodes.videoElement} autoplay></video>}
                </div>
                <div class="niplayer-controller-area" ref={this.nodes.controllerBar}>
                    <div class="niplayer-controller-area-top" ref={this.nodes.controllerBarTop}></div>
                    <div class="niplayer-controller-area-middle" ref={this.nodes.controllerBarMiddle}>
                        <div class="niplayer-controller-area-middle-left" ref={this.nodes.controllerBarMiddleLeft}></div>
                        <div class="niplayer-controller-area-middle-middle" ref={this.nodes.controllerBarMiddleMiddle}></div>
                        <div class="niplayer-controller-area-middle-right" ref={this.nodes.controllerBarMiddleRight}></div>
                    </div>
                    <div class="niplayer-controller-area-bottom" ref={this.nodes.controllerBarBottom}>                        
                    </div>
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
    public useState<T>(getter: () => T, callback: (newVal: T) => void, options?: {fireImmediately?: boolean}) {
        let isFirst = true;
        createEffect(() => {
            const val = getter();
            if (options.fireImmediately && isFirst) {
                callback(val);
            } else if (!isFirst) {
                callback(val);
            }

            isFirst = false;
        });
    }
    /**
     * @desc 注册一个副作用函数, 可以自动进行依赖收集和依赖触发
     * @param handle 
     */
    public useEffect(handle: () => void) {
        createEffect(handle);
    }
    /**
     * @desc 开始播放
     * @returns {Promise<any>}
     */
    public play(): Promise<any> {
        return this.nodes.videoElement.play();
    }
    /**
     * @desc 暂停播放
     * @returns {void}
     */
    public pause(): void {
        this.nodes.videoElement.pause();
    }
    /**
     * @desc 播放器进入全屏模式
     */
    public requestFullScreen() {
        this.config.container.requestFullscreen();
    }
    /**
     * @desc 播放器退出全屏模式
     */
    public exitFullScreen() {
        document.fullscreenElement && document.fullscreenEnabled && document.exitFullscreen();
    }
    /**
     * @description 播放器进入画中画模式
     */
    public requestPipInPip() {
        this.nodes.videoElement.requestPictureInPicture();
    }
    /**
     * @description 播放器退出画中画模式
     */
    public exitPipInPip() {
        document.exitPictureInPicture();
    }
}