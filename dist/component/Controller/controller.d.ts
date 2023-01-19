import { BaseEvent } from "../../index";
import "./controller.less";
export declare class Controller extends BaseEvent {
    private template_;
    private container;
    private video;
    private videoPlayBtn;
    private currentTime;
    private summaryTime;
    private fullScreen;
    private volumeBtn;
    private volumeSet;
    private volumeDot;
    private volumeProgress;
    private playRate;
    private resolvePower;
    private settings;
    constructor(container: HTMLElement);
    get template(): HTMLElement | string;
    init(): void;
    initControllerEvent(): void;
    initEvent(): void;
    handleMouseMove(e: MouseEvent): void;
}
