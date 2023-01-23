import { Component } from "../../../class/Component"
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps,Node } from "../../../types/Player";

export class PlayButton extends Component implements ComponentItem {
    readonly id = "PlayButton";
    props: DOMProps;
    player: Player;
    constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container,desc,props,children);
        this.player = player;
    }

    init() {
        
    }
}
