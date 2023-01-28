import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentConstructor, ComponentItem, DOMProps, Node } from "../../types/Player";
import "./controller.less";
export declare class Controller extends Component implements ComponentItem {
    readonly id = "Controller";
    subPlay: HTMLElement;
    settings: HTMLElement;
    props: DOMProps;
    player: Player;
    leftControllers: ComponentConstructor[];
    rightController: ComponentConstructor[];
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initControllers(): void;
    initTemplate(): void;
    initComponent(): void;
}
