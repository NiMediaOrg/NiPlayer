import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { VolumeCompletedProgress } from "./VolumeCompletedProgress";
export declare class Volume extends Options {
    readonly id = "Volume";
    volumeProgress: HTMLElement;
    volumeShow: HTMLElement;
    volumeCompleted: VolumeCompletedProgress;
    icon: SVGSVGElement;
    constructor(player: Player, container: HTMLElement, desc?: string, props?: DOMProps, children?: Node[]);
    init(): void;
    initTemplate(): void;
    initEvent(): void;
}
