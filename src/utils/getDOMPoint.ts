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