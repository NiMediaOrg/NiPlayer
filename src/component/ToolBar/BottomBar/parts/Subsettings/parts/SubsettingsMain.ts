import { Player } from "../../../../../../page/player";
import { flipPath, playratePath, propotionPath$1, propotionPath$2, rightarrowPath } from "../../../../../../svg";
import { SubsettingsItem } from "../../../../../../types/Player";
import { $, containsDOM, createSvg, createSvgs } from "../../../../../../utils/domUtils";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsMain {
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
        this.player = player;
        this.init();
    }

    init() {
        this.el = $("div.video-subsettings-main")
        this.el.dataset.width = "250"
        this.initSubsettingsItem();
        this.initEvent()
    }

    initSubsettingsItem() {
        this.SubsettingsItem.forEach(item => {
            let dom = new SubsettingItem(this.player,item.leftIcon,item.leftText,item.rightTip,item.rightIcon);
            this.el.appendChild(dom.el);
            item.instance = dom;
        })
    }

    initEvent() {
        this.el.addEventListener("click",(e:MouseEvent) => {
            let index = 0;
            for(let item of this.SubsettingsItem) {
                if(e.target === item.instance.el || containsDOM(item.instance.el, e.target as Element)) {
                    this.player.emit("MainSubsettingsItemClick",item, index);
                    break;
                }
                index ++;
            }
        })
    }
}