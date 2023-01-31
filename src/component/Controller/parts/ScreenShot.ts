import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { addClass, createSvgs, removeClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { screenShot$1, screenShot$2 } from "../path/defaultPath";
import { Options } from "./Options";
import { nanoid } from "nanoid"
 
export class ScreenShot extends Options {
    readonly id = "ScreenShot";
    player: Player;
    props: DOMProps;
    icon: SVGSVGElement;
    constructor(player:Player,container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
        super(player, container,0,0, desc,props,children);
        this.player = player;
        this.props = props || {};
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
        this.el.onclick = this.onClick;
    }

    onClick(e:MouseEvent) {
        this.screenShot();
    }

    screenShot() {
        const canvas = document.createElement('canvas')
        let video = this.player.video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

        const fileName = `${nanoid()}_${video.currentTime}.png`
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