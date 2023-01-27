import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
export declare class PlayButton extends Component implements ComponentItem {
    readonly id = "PlayButton";
    private pauseIcon;
    private playIcon;
    private button;
    props: DOMProps;
    player: Player;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
    resetEvent(): void;
    onClick(e: MouseEvent): void;
}
