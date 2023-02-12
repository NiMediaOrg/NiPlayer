import { Player } from "../../../../../../page/player";
import { leftarrowPath, settingsConfirmPath } from "../../../../../../svg";
import { SubsettingsItem } from "../../../../../../types/Player";
import { $, createSvg } from "../../../../../../utils/domUtils";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsPlayrate {
    el: HTMLElement;
    readonly player: Player;
    readonly SubsettingsItem: SubsettingsItem[] = [
        {
            leftIcon:createSvg(leftarrowPath,'0 0 1024 1024'),
            leftText: "播放速度",
        },
        {
            leftText: "0.5"
        },
        {
            leftText: "0.75"
        },
        {
            leftIcon: createSvg(settingsConfirmPath,'0 0 1024 1024'),
            leftText: "正常"
        },
        {
            leftText: "1.5"
        },
        {
            leftText: "2"
        }
    ]
    constructor(player: Player) {
        this.player = player;
        this.init()
    }

    init() {
        this.el = $("div.video-subsettings-playrate");
        this.el.dataset.width = "200";
        this.el.style.display = "none"
        this.initSubsettingsItem()
    }

    initSubsettingsItem() {
        this.SubsettingsItem.forEach(item => {
            let dom = new SubsettingItem(this.player,item.leftIcon,item.leftText).el
            this.el.append(dom);
        })
    }
}