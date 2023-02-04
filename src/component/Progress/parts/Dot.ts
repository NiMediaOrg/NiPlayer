import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node} from "../../../types/Player";
import { addClass, getElementSize, includeClass, removeClass } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { Progress } from "../Progress";
export class Dot extends Component implements ComponentItem {
    readonly id = "Dot";
    props: DOMProps;
    player: Player;
    container: HTMLElement;
    mouseX: number;
    left = 0;
    playScale = 0;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container, desc, props, children);
        this.props = props || {};
        this.player = player;
        this.container = container;
        this.init();
    }

    init() {
        addClass(this.el,["video-dot","video-dot-hidden"]);
        this.initEvent();

        storeControlComponent(this);
    }

    initEvent() {
        this.player.on("progress-mouseenter",(e)=>{
            if(this.player.enableSeek) {
                this.onShowDot(e);
            }
        })

        this.player.on("progress-mouseleave",(e)=>{
            if(this.player.enableSeek) {
                this.onHideDot(e);
            }
        })

        this.player.on("progress-click",(e:MouseEvent, ctx:Progress)=>{
            this.onChangePos(e,ctx);
        })

        this.player.on("timeupdate",(e) => {
            if(this.player.enableSeek) {
                 this.updatePos(e);
            }
        })

        this.el.addEventListener("mousedown", (e) => { 
            e.preventDefault();
            this.onMouseMove = this.onMouseMove.bind(this);
            this.player.emit("dotdown")
            this.mouseX = e.pageX;
            this.left = parseInt(this.el.style.left);
            document.body.addEventListener("mousemove",this.onMouseMove);
            
            document.body.addEventListener("mouseup",(e) => {
                this.player.emit("dotup")
                this.player.video.currentTime = Math.floor(this.playScale * this.player.video.duration);
                document.body.removeEventListener("mousemove",this.onMouseMove);
            })
        })
    }

    onMouseMove(e) {
        let scale = (e.pageX -this.mouseX + this.left) / this.container.offsetWidth;
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this.playScale = scale;
        this.el.style.left = this.container.offsetWidth * scale - getElementSize(this.el).width / 2 + "px";
        
        if (this.player.video.paused) this.player.video.play();
        this.player.emit("dotdrag",this.container.offsetWidth * scale);
    }
 
    onShowDot(e:MouseEvent) {
        if(includeClass(this.el,"video-dot-hidden")) {
            removeClass(this.el,["video-dot-hidden"]);
        }
    }

    onHideDot(e:MouseEvent) {
        if(!includeClass(this.el,"video-dot-hidden")) {
            addClass(this.el,["video-dot-hidden"]);
        }
    }

    onChangePos(e:MouseEvent,ctx: Component) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this.el.style.left = e.offsetX - getElementSize(this.el).width / 2 + 'px';
    }

    updatePos(e:Event) {
        let video = e.target as HTMLVideoElement;
        let scale = video.currentTime / video.duration;
        if(scale < 0) {
            scale = 0;
        } else if(scale > 1) {
            scale = 1;
        }
        this.el.style.left = scale * this.container.clientWidth - getElementSize(this.el).width / 2 + 'px';
    }
}