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
