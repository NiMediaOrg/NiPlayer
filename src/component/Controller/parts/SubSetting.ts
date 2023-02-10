import { Options } from "./Options";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { storeControlComponent } from "../../../utils/store";
import { subSettingPath } from "../path/defaultPath";
import { $, addClass, createSvg, includeClass, removeClass } from "../../../utils/domUtils";
import { wrap } from "ntouch.js";
import { SubsettingItem } from "./SubsettingItem";

export class SubSetting extends Options {
    readonly id = "SubSetting";
    clickOrTap: "click" | "singleTap";
    subsettingItem = ["关灯模式","护眼模式","洗脑循环"];
    mask: HTMLElement;
    constructor(player: Player,container: HTMLElement, desc?: string, props?: DOMProps,children?: Node[]) {
        super(player,container,0,0,desc);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
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

        this.initSubSettingTemplate()
    }

    initSubSettingTemplate() {
        this.mask = $("div.fullscreen-mask");

        for(let str of this.subsettingItem) {
            let instance = new SubsettingItem(str,this.player);
            this.hideBox.appendChild(instance.el);
        }
    }

    initEvent(): void {
        if(this.player.env === "PC") {
            this.initPCEvent();
        } else {
            this.initMobileEvent();
        }

        this.player.on("checkBox",(e:Event , msg: string) => {
            let checked = (e.target as HTMLInputElement).checked;
            switch(msg){
            case "洗脑循环":
                if(checked) {
                    this.player.video.loop = true
                } else {
                    this.player.video.loop = false;
                } 
                break;
            case "关灯模式":
                if(checked) {
                    document.body.appendChild(this.mask);
                    this.player.el.style.zIndex = "2001";
                } else {
                    document.body.removeChild(this.mask);
                    this.player.el.style.zIndex = "";
                }
                break;
            case "护眼模式":
                if(checked) {

                } else {

                }
            }
               
            
        })

        this.el.onmouseenter = null;
        wrap(this.iconBox).addEventListener(this.clickOrTap, (e) => {
            if(!includeClass(this.icon,"video-subsettings-animate")) {
                addClass(this.icon,["video-subsettings-animate"]);
            } else {
                removeClass(this.icon,["video-subsettings-animate"])
            }
            if(!includeClass(this.hideBox,"video-set-hidden")) {
                addClass(this.hideBox,["video-set-hidden"]);
            } else {
                removeClass(this.hideBox,["video-set-hidden"]);
            }
            this.player.emit("oneControllerHover",this);
        })

    }

    initPCEvent(): void {
        this.clickOrTap = "click"
    }

    initMobileEvent(): void {
        this.clickOrTap = "singleTap"
    }
}
