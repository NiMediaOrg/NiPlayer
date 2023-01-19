export function getDOMPoint(dom:HTMLElement):{x:number,y:number} {
    var t = 0; 
    var l = 0; 
    //判断是否有父容器，如果存在则累加其边距
    while (dom !== document.body) {
        t += dom.offsetTop; //叠加父容器的上边距
        l += dom.offsetLeft; //叠加父容器的左边距
        //if(dom.style.borderLeftWidth) l += Number(dom.style.borderLeftWidth);
        //if(dom.style.borderTopWidth) t += Number(dom.style.borderTopWidth);
        dom = dom.parentNode as HTMLElement;
    }
    return {x:l,y:t};
}

/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent 
 * @param topChild 
 * @param pageX 
 * @param pageY 
 * @returns {boolean}
 */
export function checkIsMouseInRange(parent:HTMLElement,topChild:HTMLElement,pageX:number,pageY:number) {
    let {x,y} = getDOMPoint(parent);
    let allTop = y - parseInt(topChild.style.bottom) - topChild.clientHeight;
    let allBottom = y + parent.clientHeight;
    let allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2);
    let allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2);
    let childBottom = y - parseInt(topChild.style.bottom);
    let parentLeft = x;
    let parentRight = x + parent.clientWidth;
    if(pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop) return true;
    if(pageX >= parentLeft && pageX <= parentRight && pageY >= y && pageY <= allBottom) return true;
    return false;
}