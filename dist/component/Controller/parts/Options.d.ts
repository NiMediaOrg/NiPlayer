import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
export declare class Options extends Component implements ComponentItem {
    id: string;
    props: DOMProps;
    player: Player;
    hideWidth: number;
    hideHeight: number;
    hideBox: HTMLElement;
    iconBox: HTMLElement;
    constructor(player: Player, container: HTMLElement, hideWidth?: number, hideHeight?: number, desc?: string, props?: DOMProps, children?: Node[]);
    initBase(): void;
    initBaseTemplate(): void;
    initBaseEvent(): void;
    handleMouseMove(e: MouseEvent): void;
}
