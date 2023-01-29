import { Component } from "../../../class/Component";
import { ComponentItem, DOMProps, Node } from "../../../types/Player";
import { Player } from "../../../page/player";
import { storeControlComponent } from "../../../utils/store";
export class VolumeCompletedProgress extends Component implements ComponentItem {
    readonly id = "VolumeCompletedProgress";
    props:DOMProps;
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
        
    }
}