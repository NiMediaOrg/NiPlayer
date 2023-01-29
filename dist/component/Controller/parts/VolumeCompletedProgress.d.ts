import { Component } from "../../../class/Component";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
import { Player } from "../../../page/player";
export declare class VolumeCompletedProgress extends Component implements ComponentItem {
    readonly id = "VolumeCompletedProgress";
    props: DOMProps;
    player: Player;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initEvent(): void;
}
