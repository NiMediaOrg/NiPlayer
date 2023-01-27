import { ComponentItem, DOMProps, PlayerOptions, ToolBar } from "../index";
import "./player.less";
import "../main.less";
import { Component } from "../class/Component";
import { Plugin } from "../index";
declare class Player extends Component implements ComponentItem {
    readonly id = "Player";
    readonly playerOptions: {
        url: string;
        autoplay: boolean;
        width: string;
        height: string;
    };
    video: HTMLVideoElement;
    toolBar: ToolBar;
    container: HTMLElement;
    props: DOMProps;
    constructor(options: PlayerOptions);
    init(): void;
    initEvent(): void;
    attendSource(url: string): void;
    registerControls(id: string, component: Partial<ComponentItem>): void;
    /**
     * @description 注册对应的组件
     * @param plugin
     */
    use(plugin: Plugin): void;
}
export { Player };
