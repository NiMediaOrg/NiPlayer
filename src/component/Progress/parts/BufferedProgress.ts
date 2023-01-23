import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps, Node} from "../../../types/Player";
import { Progress } from "../Progress";
export class BufferedProgress extends Component implements ComponentItem {
    readonly id = "BufferedProgress";
    props: DOMProps;
    player: Player;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container, desc, props, children);
        this.props = props;
        this.player = player;
        this.init();
    }

    init() {
        this.initEvent();
    }

    initEvent() {
        this.player.on("progress-click",(e:MouseEvent, ctx:Progress)=>{
            this.onChangeWidth(e,ctx);
        })
    }

    onChangeWidth(e:MouseEvent,ctx:Component) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        } else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}