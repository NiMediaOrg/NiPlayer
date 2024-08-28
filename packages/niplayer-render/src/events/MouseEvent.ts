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
}
export class MouseEvent {
    public timeStamp = 0;
    public type: keyof EventMap = 'mousemove';
    public global: IPoint = { x: 0, y: 0 };
    public propagationStopped = false;
    public target: RenderObject;
    public currentTarget: RenderObject;

    public stopPropagation() {
        this.propagationStopped = true
    }
}