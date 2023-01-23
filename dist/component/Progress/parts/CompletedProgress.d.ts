import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
export declare class CompletedProgress extends Component implements ComponentItem {
    readonly id = "CompletedProgress";
    props: DOMProps;
    player: Player;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initEvent(): void;
    onChangeWidth(e: MouseEvent, ctx: Component): void;
}
