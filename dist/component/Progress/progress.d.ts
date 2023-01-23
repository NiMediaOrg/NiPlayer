import { Node } from "../../types/Player";
import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps } from "../../types/Player";
import { Dot } from "./parts/Dot";
import { CompletedProgress } from "./parts/CompletedProgress";
import { BufferedProgress } from "./parts/BufferedProgress";
export declare class Progress extends Component implements ComponentItem {
    readonly id = "Progress";
    private mouseDown;
    props: DOMProps;
    player: Player;
    dot: Dot;
    completedProgress: CompletedProgress;
    bufferedProgress: BufferedProgress;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initComponent(): void;
    initEvent(): void;
}
