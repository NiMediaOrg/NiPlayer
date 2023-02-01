import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps,Node } from "../../types/Player";
import { $, addClass } from "../../utils/domUtils";
import "./loading.less"
export class Loading extends Component implements ComponentItem {
    id = "Loading";
    props: DOMProps;
    player: Player;
    container: HTMLElement;
    loadingBox: HTMLElement;
    msgBox: HTMLElement;
    message: string;
    constructor(player:Player,msg:string, container:HTMLElement,desc?:string, props?:DOMProps,children?:Node[]) {
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
        this.msgBox = $("div.video-loading-msgbox"); 
        this.msgBox.innerText = this.message;
        this.el.appendChild(this.loadingBox);
        this.el.appendChild(this.msgBox);   
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