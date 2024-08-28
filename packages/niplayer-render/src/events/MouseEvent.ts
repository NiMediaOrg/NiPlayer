import { RenderObject } from "../material/RenderObject";
import { IPoint } from "../types";
export interface AddEventListenerOptions {
    /**
     * @description 是否在事件捕获阶段执行该逻辑
     */
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    useCapture?: boolean;
}
export interface EventMap {
    mouseenter: (ev: MouseEvent) => any;
    mouseleave: (ev: MouseEvent) => any;
    mousemove: (ev: MouseEvent) => any;
    mousedown: (ev: MouseEvent) => any;
    mouseup: (ev: MouseEvent) => any;
    click: (ev: MouseEvent) => any;
}
export class MouseEvent {
    public timeStamp = 0;
    public type: keyof EventMap = 'mousemove';
    public global: IPoint = { x: 0, y: 0 };
    public propagationStopped = false;
    public target: RenderObject = null;
    public currentTarget: RenderObject = null;

    public stopPropagation() {
        this.propagationStopped = true
    }
}