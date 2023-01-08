import { PlayerOptions, BaseEvent } from "../../index";
import "./player.less";
declare class Player extends BaseEvent {
    private playerOptions;
    private container;
    private toolbar;
    private video;
    constructor(options: PlayerOptions);
    init(): void;
    initComponent(): void;
    initContainer(): void;
    initEvent(): void;
    isTagValidate(ele: HTMLElement): boolean;
}
export { Player };
