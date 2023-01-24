import { ComponentItem, PlayerOptions, ToolBar } from "../index";
import "./player.less";
import "../main.less";
import { Component } from "../class/Component";
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
    constructor(options: PlayerOptions);
    init(): void;
    initEvent(): void;
    attendSource(url: string): void;
}
export { Player };
