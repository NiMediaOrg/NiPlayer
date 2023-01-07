import { PlayerOptions } from "../index";
import "../less/player.less";
import "../less/test.less";
declare class Player {
    private playerOptions;
    private container;
    constructor(options: PlayerOptions);
    init(): void;
    initContainer(): void;
    isTagValidate(ele: HTMLElement): boolean;
}
export { Player };
