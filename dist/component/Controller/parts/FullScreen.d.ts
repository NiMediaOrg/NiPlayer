import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
export declare class FullScreen extends Component implements ComponentItem {
    readonly id = "FullScreen";
    player: Player;
    props: DOMProps;
    iconBox: HTMLElement;
    icon: SVGSVGElement;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
    onClick(e: MouseEvent): void;
}
