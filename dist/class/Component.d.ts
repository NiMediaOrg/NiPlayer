import { BaseEvent } from "./BaseEvent";
import { DOMProps, Node } from "../types/Player";
export declare class Component extends BaseEvent {
    el: HTMLElement;
    constructor(container: HTMLElement, desc?: string, props?: DOMProps, children?: string | Node[]);
    init(): void;
    initEvent(): void;
    initTemplate(): void;
    initComponent(): void;
    resetEvent(): void;
}
