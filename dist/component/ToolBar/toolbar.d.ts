import { BaseEvent } from "../../index";
import "./toolbar.less";
export declare class ToolBar extends BaseEvent {
    private template_;
    private container;
    private video;
    private progress;
    private controller;
    private timer;
    constructor(container: HTMLElement);
    get template(): HTMLElement;
    showToolBar(e: MouseEvent): void;
    hideToolBar(): void;
    init(): void;
    initComponent(): void;
    initTemplate(): void;
    initEvent(): void;
}
