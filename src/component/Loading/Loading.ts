import { Component } from "@/class/Component";
import { Player } from "@/page/player";
import { ComponentItem, DOMProps,Node } from "@/types/Player";
import { $, addClass } from "@/utils/domUtils";
export class Loading extends Component implements ComponentItem {
    id = "Loading";
    props: DOMProps;
    player: Player;
    container: HTMLElement;
    loadingBox: HTMLElement;
    messageBox: HTMLElement;
    message: string;
    constructor(player:Player, msg:string, container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
        super(null,desc,props,children);
        this.props = props || {};
        this.player = player;
        this.container = container;
        this.message = msg;
        this.init();
    }

    init() {
        this.initTemplate()
        this.initEvent()
    }

    initTemplate(): void {
        addClass(this.el,["video-loading"]);
        this.loadingBox = $("div");
        this.messageBox = $("div");
        this.messageBox.innerText = this.message;
        addClass(this.messageBox ,["video-loading-msgbox"])
        this.el.appendChild(this.loadingBox);
        this.el.appendChild(this.messageBox);
    }

    initEvent(): void {}

    addLoading() {
        if(![...this.container.childNodes].includes(this.el)) {
            this.container.appendChild(this.el);
        }
    }

    removeLoading() {
        if([...this.container.childNodes].includes(this.el)) {
            this.container.removeChild(this.el);
        }
    }
}