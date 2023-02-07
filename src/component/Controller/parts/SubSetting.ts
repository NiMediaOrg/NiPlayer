import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { storeControlComponent } from "../../../utils/store";
import { subSettingPath } from "../path/defaultPath";
import { $, addClass, createSvg } from "../../../utils/domUtils";

export class SubSetting extends Options {
    readonly id = "SubSetting";
    constructor(player: Player,container: HTMLElement, desc?: string, props?: DOMProps,children?: Node[]) {
        super(player,container,0,0,desc);
        this.init();
    }

    init() {
        this.initTemplate();
        storeControlComponent(this);
    }

    initTemplate() {
        addClass(this.el,["video-subsettings","video-controller"]);
        addClass(this.hideBox,["video-subsettings-set"])
        this.el["aria-label"] = "设置";
        this.icon = createSvg(subSettingPath);
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);
        this.el.appendChild(this.hideBox);
    }
}