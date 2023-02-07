import { wrap } from "ntouch.js";
import { Player } from "../../../page/player";
import { DOMProps, Node } from "../../../types/Player";
import { addClass, createSvg } from "../../../utils/domUtils";
import { storeControlComponent } from "../../../utils/store";
import { videoShotPath } from "../path/defaultPath";
import { Options } from "./Options";
 
export class VideoShot extends Options {
    readonly id = "VideoShot";
    player: Player;
    props: DOMProps;
    icon: SVGSVGElement;
    countDown = 30;
    timer: number | null = null;
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
        addClass(this.el,["video-videoshot","video-controller"])
        this.icon = createSvg(videoShotPath,"0 0 1024 1024")
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);

        this.hideBox.innerText = "视频录制"
        this.hideBox.style.fontSize = "13px"
    }
    
    initEvent() {
        this.onDown = this.onDown.bind(this);
        if(this.player.env === "PC") {
            this.el.onmousedown = this.onDown;
        } else {
            this.el.ontouchstart = this.onDown;
        }
    }

    onDown() {
        if(this.player.video.played) {
            this.videoShot();
        }
    }

    videoShot() {
        let recorder = new MediaRecorder(
            (this.player.video as HTMLMediaElement as HTMLMediaElementWithCaputreStream).captureStream(60)
        )

        recorder.addEventListener("start",(e)=>{
            console.log("开始录制视频")
        })

        recorder.addEventListener("stop",(e)=>{
            console.log("结束录制视频")
        })

        recorder.addEventListener("dataavailable",(e:BlobEvent)=>{
            let data = e.data;
            let a = document.createElement("a");
            a.href = window.URL.createObjectURL(data);
            a.download = "Test.mp4";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            a = null;
        })

        recorder.start();

        this.timer = window.setInterval(()=>{
            console.log(this.countDown);
            if(this.countDown === 0) {
                this.stop(recorder);
                return;
            }
            this.countDown--;
        },1000)

        if(this.player.env === "Mobile") {
            this.el.ontouchend = (e) => {
                this.stop(recorder);
            }
        } else {
            this.el.onmouseup = (e) => {
                this.stop(recorder);
            }
        }
    }

    stop(recorder:MediaRecorder) {
        recorder.stop();
        recorder = null;
        window.clearInterval(this.timer);
        this.timer = 0;
        this.el.onmouseup = null;
        this.el.ontouchend = null;
        this.countDown = 30;
    }
}