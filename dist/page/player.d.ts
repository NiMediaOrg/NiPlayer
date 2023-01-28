import { ComponentItem, DOMProps, PlayerOptions, registerOptions, ToolBar } from "../index";
import "./player.less";
import "../main.less";
import { Component } from "../class/Component";
import { Plugin } from "../index";
declare class Player extends Component implements ComponentItem {
    readonly id = "Player";
    readonly playerOptions: PlayerOptions;
    video: HTMLVideoElement;
    toolBar: ToolBar;
    container: HTMLElement;
    props: DOMProps;
    constructor(options: PlayerOptions);
    init(): void;
    initEvent(): void;
    initPlugin(): void;
    initMp4Player(url: string): void;
    initMpdPlayer(url: string): void;
    attendSource(url: string): void;
    registerControls(id: string, component: Partial<ComponentItem> & registerOptions): void;
    /**
     * @description 注册对应的组件
     * @param plugin
     */
    use(plugin: Plugin): void;
}
export { Player };
