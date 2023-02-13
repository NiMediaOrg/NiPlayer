import { BaseEvent } from "../../../../../../class/BaseEvent";
import { Player } from "../../../../../../page/player";
import { leftarrowPath, settingsConfirmPath } from "../../../../../../svg";
import { SubsettingsItem } from "../../../../../../types/Player";
import { $, containsDOM, createSvg } from "../../../../../../utils/domUtils";
import { SubsettingItem } from "../SubsettingItem";

export class SubsettingsPlayrate extends BaseEvent{
    leadItem: SubsettingsItem;
    el: HTMLElement;
    readonly player: Player;
    readonly SubsettingsItem: SubsettingsItem[] = [
        {
            leftIcon: createSvg(leftarrowPath,'0 0 1024 1024'),
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
        super();
        this.player = player;
        this.init()
    }

    init() {
        this.el = $("div.video-subsettings-playrate");
        this.el.dataset.width = "170";
        this.el.style.display = "none"
        this.initSubsettingsItem()
        this.initEvent()
    }

    initSubsettingsItem() {
        this.SubsettingsItem.forEach(item => {
            let instance = new SubsettingItem(this.player,item.leftIcon,item.leftText)
            item.instance = instance;
            if(item.leftText === "播放速度") instance.el.dataset.SubsettingsPlayrate = "0"
            else if(item.leftText === "正常") instance.el.dataset.SubsettingsPlayrate = "1";
            else {
                instance.el.dataset.SubsettingsPlayrate = item.leftText;
                
            }
            this.el.append(instance.el);
        })
    }

    initEvent() {
        for(let i = 1; i<this.SubsettingsItem.length; i++) {
            let item = this.SubsettingsItem[i];
            item.instance.el.addEventListener("click", (e) => {
                e.stopPropagation();
                item.leftIcon = createSvg(settingsConfirmPath,'0 0 1024 1024');
                item.instance.leftIconBox.innerHTML = ""
                item.instance.leftIconBox.appendChild(item.leftIcon);

                for(let index in this.SubsettingsItem) {
                    console.log(index);
                    if(index !== "0" && this.SubsettingsItem[index] !== item && this.SubsettingsItem[index].leftIcon) {
                        this.SubsettingsItem[index].instance.leftIconBox.removeChild(this.SubsettingsItem[index].leftIcon);
                        delete this.SubsettingsItem[index].leftIcon;
                    }
                }

                this.player.emit("SubsettingsPlayrateClick",item, i);
            })
        }

        this.SubsettingsItem[0].instance.el.addEventListener("click",(e) => {
            e.stopPropagation();
            this.player.emit("SubsettingsPlayrateClick",this.SubsettingsItem[0], 0);
        })
    }
}