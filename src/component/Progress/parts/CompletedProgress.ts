import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node} from "../../../types/Player";
import { storeControlComponent } from "../../../utils/store";
import { Progress } from "../Progress";
export class CompletedProgress extends Component implements ComponentItem {
    readonly id = "CompletedProgress";
    props: DOMProps;
    player: Player;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container, desc, props, children);
        this.props = props || {};
        this.player = player;
        this.init();
    }

    init() {
        this.initEvent();

        storeControlComponent(this);
    }

    initEvent() {
        this.player.on("progress-click",(e:MouseEvent, ctx:Progress)=>{
            this.onChangeSize(e,ctx);
        })

        this.player.on("timeupdate",(e) => {
            this.updatePos(e);
        })
       
        this.player.on("dotdrag",(len:number)=>{
            this.el.style.width = len + "px";
        })
    }

    onChangeSize(e:MouseEvent,ctx:Component) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }

    updatePos(e: Event) {
        let video = e.target as HTMLVideoElement;
        let scale = video.currentTime / video.duration;
        if(scale < 0) {
            scale = 0;
        } else if(scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}