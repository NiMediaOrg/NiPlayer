import { BaseEvent } from "../../../../../../class/BaseEvent";
import { Player } from "../../../../../../page/player";
import { flipPath, playratePath, propotionPath$1, propotionPath$2, rightarrowPath } from "../../../../../../svg";
import { SubsettingsItem } from "../../../../../../types/Player";
import { $, containsDOM, createSvg, createSvgs } from "../../../../../../utils/domUtils";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsMain extends BaseEvent {
    el: HTMLElement;
    readonly player: Player;
    SubsettingsItem: SubsettingsItem[] = [
        {
            leftIcon: createSvg(playratePath, '0 0 1024 1024'),
            leftText: "播放速度",
            rightTip: "正常",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024')
        },
        {
            leftIcon: createSvgs([propotionPath$1,propotionPath$2],'0 0 1024 1024'),
            leftText: "画面比例",
            rightTip: "默认",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024')
        },
        {
            leftIcon: createSvg(flipPath,'0 0 1024 1024'),
            leftText: "画面翻转",
            rightTip: "正常",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024')
        }
    ]
    constructor(player:Player) {
        super();
        this.player = player;
        this.init();
    }

    init() {
        this.el = $("div.video-subsettings-main")
        this.el.dataset.width = "200"
        this.initSubsettingsItem();
        this.initEvent()
    }

    initSubsettingsItem() {
        this.SubsettingsItem.forEach(item => {
            let instance = new SubsettingItem(this.player,item.leftIcon,item.leftText,item.rightTip,item.rightIcon);
            this.el.appendChild(instance.el);
            item.instance = instance;
            instance.el.dataset.SubsettingsMainType = item.leftText;
        })
    }

    initEvent() {
        this.SubsettingsItem.forEach((item, index) => {
            item.instance.el.addEventListener("click",() => {
                this.player.emit("MainSubsettingsItemClick",item, index);
            })
        })

        this.player.on("SubsettingsPlayrateClick", (item: SubsettingsItem,index: number) => {
            let playrate = item.instance.el.dataset.SubsettingsPlayrate
            if(playrate === "0") return;
            if(playrate === "1") {
                this.SubsettingsItem[0].instance.rightTipBox.innerText = "正常"
            } else {
                this.SubsettingsItem[0].instance.rightTipBox.innerText = playrate;
            }
        })
    }
}