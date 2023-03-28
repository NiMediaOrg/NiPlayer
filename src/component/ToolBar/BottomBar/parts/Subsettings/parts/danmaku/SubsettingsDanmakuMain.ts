import { Player } from "@/page/player";
import { leftarrowPath, rightarrowPath } from "@/svg";
import { SubsettingsItem } from "@/types/Player";
import { $, createSvg } from "@/utils";
import { SubSetting } from "../../SubSetting";
import { SubsettingsBase } from "../SubsettingsBase";
import { SubsettingsMain } from "../SubsettingsMain";
import { SubsettingsDanmakuOpacity } from "./SubSettingsDanmakuOpacity";
import { SubsettingsDanmakuRange } from "./SubsettingsDanmakuRange";
import { SubsettingsDanmakuSize } from "./SubsettingsDanmakuSize";

export class SubsettingsDanmakuMain extends SubsettingsBase {
    readonly id = "SubsettingsDanmakuMain";
    readonly SubsettingsItem: SubsettingsItem[] = [
        {
            leftIcon: createSvg(leftarrowPath, "0 0 1024 1024"),
            leftText: "弹幕设置",
            target: SubsettingsMain,
        },
        {
            leftText: "弹幕速度",
            rightTip: "适中",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024')
        },
        {
            leftText: "弹幕透明度",
            rightTip: "100%",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024'),
            target: SubsettingsDanmakuOpacity,       
        },
        {
            leftText: "字体大小",
            rightTip: "适中",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024'),
            target: SubsettingsDanmakuSize
        },
        {
            leftText: "显示范围",
            rightTip: "半屏",
            rightIcon: createSvg(rightarrowPath,'0 0 1024 1024'),
            target: SubsettingsDanmakuRange
        }
    ]

    constructor(subsetting: SubSetting, player: Player) {
        super(subsetting, player);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
       
        this.initSubsettingsItem();
    }

    initSubsettingsItem() {
        this.initBaseSubsettingsItem();
    }

    initTemplate() {
        this.el = $("div.video-subsettings-danmaku-main");
        this.el.dataset.width = "250";
        this.el.style.display = "none"
    }

    initEvent() {
        this.subsetting.on("OpacityChange",(opacity: number) => {
            this.player.danmakuController.setOpacity(opacity);
            this.SubsettingsItem[2].instance.rightTipBox.innerText = opacity * 100 + "%";
        })

        this.subsetting.on("RangeChange",(leftText: string) => {
            let range = null;
            if(leftText === "满屏") {
                range = 1;
            } else if(leftText === "半屏") {
                range = 1/2;
            } else if(leftText === "1/4") {
                range = 1/4;
            } else if(leftText === "3/4") {
                range = 3/4;
            }
            this.player.danmakuController.setTrackNumber(range);
            this.SubsettingsItem[4].instance.rightTipBox.innerText = leftText;
        })

        this.subsetting.on("SizeChange",(leftText: string) => {
            let size = null;
            if(leftText === "极小") {
                size = 0.5;
            } else if(leftText === "小") {
                size = 0.75
            } else if(leftText === "适中") {
                size = 1;
            } else if(leftText === "大") {
                size = 1.25;
            } else if(leftText === "极大") {
                size = 1.5
            }
            this.player.danmakuController.setFontSize(size);
            this.SubsettingsItem[3].instance.rightTipBox.innerText = leftText;
        })
    }

}