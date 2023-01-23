import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentItem, DOMProps,Node } from "../../../types/Player";

export class Options extends Component implements ComponentItem{
    id = "Options";
    props: DOMProps;
    constructor(player: Player, container: HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
        super(container, desc, props,children);
    }
    

}