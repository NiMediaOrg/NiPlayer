import { wrap } from "ntouch.js";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { addClass, createSvgs } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { screenShot$1, screenShot$2 } from "../path/defaultPath";
import { Options } from "./Options";
 
export class ScreenShot extends Options {
    readonly id = "ScreenShot";
    constructor(player:Player,container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
        super(player, container,0,0, desc,props,children);
        this.init();
    }

    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }

    initTemplate() {
        addClass(this.el,["video-screenshot","video-controller"])
        this.icon = createSvgs([screenShot$1,screenShot$2],"0 0 1024 1024");
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);

        this.hideBox.innerText = "截图"
        this.hideBox.style.fontSize = "13px"
    }
    
    initEvent() {
        this.onClick = this.onClick.bind(this);
        if(this.player.env === "PC") {
            this.el.addEventListener("click",this.onClick)
        } else {
            wrap(this.el).addEventListener("singleTap",this.onClick)
        }
    }
    
    onClick(e:Event) {
        this.screenShot();
    }
    /**
     * @description 进行截屏
     */
    screenShot() {
        const canvas = document.createElement('canvas')
        let video = this.player.video;
        video.setAttribute('crossOrigin', 'anonymous')
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

        const fileName = `${Math.random().toString(36).slice(-8)}_${video.currentTime}.png`
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }, 'image/png')
    }
}