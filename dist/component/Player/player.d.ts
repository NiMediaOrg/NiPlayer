import { PlayerOptions } from "../../index";
import "./player.less";
declare class Player {
    private playerOptions;
    private container;
    private toolbar;
    constructor(options: PlayerOptions);
    init(): void;
    initComponent(): void;
    initContainer(): void;
    isTagValidate(ele: HTMLElement): boolean;
}
export { Player };
