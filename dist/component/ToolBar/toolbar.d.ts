import { Component } from "../../class/Component";
import { Node, ComponentItem, DOMProps, Player } from "../../index";
import "./toolbar.less";
export declare class ToolBar extends Component implements ComponentItem {
    readonly id: string;
    props: DOMProps;
    player: Player;
    private timer;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    /**
     * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
     */
    initTemplate(): void;
    initEvent(): void;
    private hideToolBar;
    private showToolBar;
    onShowToolBar(e: MouseEvent): void;
    onHideToolBar(e: MouseEvent): void;
}
