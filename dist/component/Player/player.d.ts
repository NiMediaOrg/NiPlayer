import { PlayerOptions, BaseEvent } from "../../index";
import "./player.less";
import "../../main.less";
declare class Player extends BaseEvent {
    private playerOptions;
    private container;
    private video;
    private toolbar;
    private loadingMask;
    private errorMask;
    constructor(options: PlayerOptions);
    init(): void;
    initComponent(): void;
    initContainer(): void;
    initEvent(): void;
    isTagValidate(ele: HTMLElement): boolean;
}
export { Player };
