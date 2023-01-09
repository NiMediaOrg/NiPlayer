import { BaseEvent } from "../../index";
import "./pregress.less";
export declare class Progress extends BaseEvent {
    private template_;
    private container;
    private video;
    private progress;
    private bufferedProgress;
    private completedProgress;
    private pretime;
    private dot;
    private mouseDown;
    constructor(container: HTMLElement);
    get template(): HTMLElement | string;
    init(): void;
    initProgressEvent(): void;
    initEvent(): void;
}
