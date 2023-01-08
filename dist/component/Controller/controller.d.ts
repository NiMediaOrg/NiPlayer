import { BaseEvent } from "../../index";
import "./controller.less";
export declare class Controller extends BaseEvent {
    private template_;
    private container;
    private videoPlayBtn;
    private currentTime;
    private summaryTime;
    constructor(container: HTMLElement);
    get template(): HTMLElement | string;
    init(): void;
    initEvent(): void;
}
