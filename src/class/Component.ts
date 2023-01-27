import { $ } from "../utils/domUtils";
import { BaseEvent } from "./BaseEvent";
import { DOMProps, Node } from "../types/Player";

export class Component extends BaseEvent{
    el: HTMLElement; //el代表着该组件对应的整个HTML元素
    constructor(container:HTMLElement,desc?:string,props?:DOMProps,children?:string | Node[]) {
        super();
        let dom = $(desc,props,children);
        this.el = dom;
        // 安装组件成功
        container.append(dom);
    }

    init() {}
    initEvent() {}
    initTemplate() {}
    initComponent() {}
    resetEvent() {}
}