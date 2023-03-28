import { Player } from "@/page/player";
import { leftarrowPath, settingsConfirmPath } from "@/svg";
import { SubsettingsItem } from "@/types/Player";
import { $, createSvg } from "@/utils";
import { SubSetting } from "../../SubSetting";
import { SubsettingsBase } from "../SubsettingsBase";
import { SubsettingsDanmakuMain } from "./SubsettingsDanmakuMain";

export class SubsettingsDanmakuOpacity extends SubsettingsBase {
    readonly id = "SubsettingsDanmakuOpacity";
    readonly SubsettingsItem: SubsettingsItem[] = [
        {
            leftIcon: createSvg(leftarrowPath, "0 0 1024 1024"),
            leftText: "弹幕透明度",
            target: SubsettingsDanmakuMain
        },
        {
            leftText: "100%",
            leftIcon: createSvg(settingsConfirmPath),
            target: SubsettingsDanmakuMain
        },
        {
            leftText: "75%",
            target: SubsettingsDanmakuMain
        },
        {
            leftText: "50%",
            target: SubsettingsDanmakuMain
        },
        {
            leftText: "0",
            target: SubsettingsDanmakuMain
        }
    ]

    constructor(subsetting: SubSetting, player: Player) {
        super(subsetting, player);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initSubsettingsItem();
        this.initEvent();
    }

    initSubsettingsItem() {
        this.initBaseSubsettingsItem();
    }

    initTemplate() {
        this.el = $("div.video-subsettings-danmaku-opacity");
        this.el.dataset.width = "200";
        this.el.style.display = "none"
    }

    initEvent() {
        this.SubsettingsItem.forEach((item,index) => {
            if(index === 0) return;
            item.instance.el.onclick = () => {
                this.subsetting.emit("OpacityChange", parseFloat(item.leftText) * 0.01)

                item.instance.leftIconBox.innerHTML = ""
                item.instance.leftIconBox.appendChild(createSvg(settingsConfirmPath))

                for(let i = 1;i<this.SubsettingsItem.length;i++) {
                    let another = this.SubsettingsItem[i];
                    if(another !== item) {
                        another.instance.leftIconBox.innerHTML = "";
                    }
                }
            }
        })
    }

}