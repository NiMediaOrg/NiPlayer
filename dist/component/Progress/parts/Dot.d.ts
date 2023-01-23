import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
export declare class Dot extends Component implements ComponentItem {
    readonly id = "Dot";
    props: DOMProps;
    player: Player;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initEvent(): void;
    onShowDot(e: MouseEvent): void;
    onHideDot(e: MouseEvent): void;
    onChangePos(e: MouseEvent, ctx: Component): void;
}
