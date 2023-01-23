import { DOMProps, Node } from "../types/Player";
export declare function getDOMPoint(dom: HTMLElement): {
    x: number;
    y: number;
};
/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent
 * @param topChild
 * @param pageX
 * @param pageY
 * @returns {boolean}
 */
export declare function checkIsMouseInRange(parent: HTMLElement, topChild: HTMLElement, pageX: number, pageY: number): boolean;
/**
 * @description 根据desc的标签描述和props的属性描述来创建一个DOM对象，并且在实例上挂载各种属性
 * @param {string} desc
 * @param {DOMProps} props
 * @param {Node[]} children
 * @returns
 */
export declare function $<T extends HTMLElement>(desc?: string, props?: DOMProps, children?: string | Array<Node>): T;
/**
 * @description 根据传入的字符串获取对应的DOM元素
 * @param dom
 * @returns {HTMLElement | null}
 */
export declare function getEl(dom: HTMLElement | string): HTMLElement | null;
export declare function addClass(dom: HTMLElement, classNames: Array<string>): void;
export declare function removeClass(dom: HTMLElement, classNames: Array<string>): void;
export declare function changeClass(dom: HTMLElement, className: any): void;
export declare function includeClass(dom: HTMLElement, className: string): boolean;
export declare function getElementSize(dom: HTMLElement): {
    width: number;
    height: number;
};
