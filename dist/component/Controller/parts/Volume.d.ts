import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { CompletedProgress } from "../../Progress/parts/CompletedProgress";
export declare class Volume extends Options {
    readonly id = "Volume";
    volumeProgress: HTMLElement;
    volumeShow: HTMLElement;
    volumeCompleted: CompletedProgress;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
}
