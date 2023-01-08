import { BaseEvent } from "../../index";
import "./toolbar.less";
export declare class ToolBar extends BaseEvent {
    private template_;
    private progress;
    private controller;
    private container;
    constructor(container: HTMLElement);
    get template(): HTMLElement;
    init(): void;
    initComponent(): void;
    initTemplate(): void;
    initEvent(): void;
}
