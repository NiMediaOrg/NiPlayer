import bind from "bind-decorator";
import { RenderObject } from "./material/RenderObject";
import { autorun } from "./reactivity/effects";
import { IApplicationConfig, IPoint, renderType } from "./types";
import { MouseEvent } from "./events/MouseEvent";
class ApplicationRoot extends RenderObject {
    public anchor: { x: number; y: number; };
    public contains(point: { x: number; y: number; }): boolean {
        return true;
    }

    public draw(context: CanvasRenderingContext2D | WebGL2RenderingContext): void {
        this.children.forEach(child => child.draw(context));
    }

    public drawContent2d(context: CanvasRenderingContext2D): void {}

    public drawContentWebgl(context: WebGL2RenderingContext): void {}
}
export class Application {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | WebGL2RenderingContext;
    private overTargets: RenderObject[] = [];
    private pressTargets: RenderObject[] = [];

    private ticksFunction: (() => void)[] = [];

    public root: ApplicationRoot;
    public ticker = {
        add: (cb: () => void) => {
            if (this.ticksFunction.includes(cb)) return;
            this.ticksFunction.push(cb);
        },
        remove: (cb: () => void) => {
            const index = this.ticksFunction.indexOf(cb);
            if (index === -1) return;
            this.ticksFunction.splice(index, 1);
        }
    }

    public get view() {
        return this.canvas;
    }

    constructor(config: IApplicationConfig) {
        this.canvas = document.createElement("canvas") as HTMLCanvasElement;
        this.canvas.style.width = config.width + 'px';
        this.canvas.style.height = config.height + 'px';
        this.canvas.style.background = config.background ?? 'white';
        this.canvas.width = config.width * window.devicePixelRatio;
        this.canvas.height = config.height * window.devicePixelRatio;

        this.initContext(config.type ?? '2d');
        this.root = new ApplicationRoot();
        this.addEvents();
        this.play();
    }

    private initContext(type: renderType) {
        if (type === 'webgl') {
            this.context = this.canvas.getContext("webgl2")!;
        } else {
            this.context = this.canvas.getContext("2d")!;
        }
    }

    @bind
    private _onPointerMove(e: PointerEvent) {
        const x = e.offsetX * window.devicePixelRatio;
        const y = e.offsetY * window.devicePixelRatio;
        const point = {x,y}
        const hitTarget = this.hitCheck(this.root, point);
        const topTarget = this.overTargets.length > 0 ? this.overTargets[0] : null;
        const event = new MouseEvent();
        //* -1: 触发mouseleave事件
        if (topTarget && hitTarget !== topTarget) {
            if (!hitTarget.composedPath.includes(topTarget)) {
                event.type = 'mouseleave';
                event.global = {
                    x: point.x,
                    y: point.y
                };
                if (!hitTarget) {
                    topTarget.composedPath.forEach(item => {
                        event.currentTarget = item;
                        event.currentTarget.emit('mouseleave', event);
                    })
                } else {
                    let target = topTarget;
                    while (target && !hitTarget.composedPath.includes(target)) {
                        event.currentTarget = target;
                        event.currentTarget.emit('mouseleave', event)
                        target = target.parent;
                    }
                }
            }
        }
        //* 0. 触发mouseenter事件
        if (hitTarget && topTarget !== hitTarget) {
            event.target = hitTarget;
            event.type = 'mouseenter';
            event.global = {
                x: point.x,
                y: point.y
            };
            if (!topTarget) {
                hitTarget.composedPath.forEach(item => {
                    event.currentTarget = item;
                    item.emit('mouseenter', event);
                })
            } else {
                let index = hitTarget.composedPath.length - 1;
                for (; index >= 0; index--) {
                    if (!topTarget.composedPath.includes(hitTarget.composedPath[index])) {
                        break;
                    }
                }

                for (let i = 0; i <= index; i++) {
                    event.currentTarget = hitTarget.composedPath[i];
                    event.currentTarget.emit('mouseenter', event);
                }

            }
        }
        //* 1.首先检测 mousemove 事件
        if (hitTarget) {
            event.target = hitTarget;
            event.currentTarget = hitTarget;
            event.timeStamp = Date.now();
            event.type = 'mousemove';
            event.global = {
                x: point.x,
                y: point.y
            };
            //todo 事件捕获的处理
            // [...hitTarget.composedPath].reverse().forEach(item => {
            //     item.emit('mousemove', event);
            // })
            hitTarget.composedPath.forEach(item => {
                event.currentTarget = item;
                item.emit('mousemove', event);
            })
        }

        this.overTargets = hitTarget?.composedPath ?? [];
    }

    @bind
    private _onPointerLeave() {
        this.overTargets = [];
    }

    @bind
    private _onPointerDown(e: PointerEvent) {
        const x = e.offsetX * window.devicePixelRatio;
        const y = e.offsetY * window.devicePixelRatio;
        const hitTarget = this.hitCheck(this.root, {x,y});
        const event = new MouseEvent();
        event.type = 'mousedown';
        event.timeStamp = Date.now();
        event.target = hitTarget;
        event.currentTarget = hitTarget;
        event.global = {
            x: x,
            y: y
        }
        hitTarget.composedPath.forEach(item => {
            event.currentTarget = item;
            item.emit('mousedown', event);
        })
        this.pressTargets = hitTarget.composedPath;
    }

    @bind
    private _onPointerUp(e: PointerEvent) {
        const x = e.offsetX * window.devicePixelRatio;
        const y = e.offsetY * window.devicePixelRatio;
        const hitTarget = this.hitCheck(this.root, {x,y});
        const event = new MouseEvent();
        event.type = 'mouseup';
        event.timeStamp = Date.now();
        event.target = hitTarget;
        event.currentTarget = hitTarget;
        hitTarget.composedPath.forEach(item => {
            event.currentTarget = item;
            item.emit('mouseup', event);
        })

        const clickEvent = new MouseEvent();
        clickEvent.type ='click';
        clickEvent.timeStamp = Date.now();
        let target = hitTarget;
        while(target) {
            if (this.pressTargets.includes(target)) break;
            target = target.parent;
        }

        clickEvent.target = target;
        while(target) {
            clickEvent.currentTarget = target;
            target.emit('click', event);
            target = target.parent;
        }
    }

    private addEvents() {
        this.canvas.addEventListener('pointermove', this._onPointerMove);
        this.canvas.addEventListener('pointerleave', this._onPointerLeave);
        this.canvas.addEventListener('pointerdown', this._onPointerDown);
        this.canvas.addEventListener('pointerup', this._onPointerUp);
    }

    /**
     * @desc canvas中的碰撞检测实现，使用后序遍历，优先实现子节点
     * @param node {RenderObject}
     * @param point {IPoint}
     */
    private hitCheck(node: RenderObject, point: IPoint): RenderObject | null {
        let hitTarget: RenderObject | null = null;
        node.children.forEach(child => {
            hitTarget = this.hitCheck(child, point) ?? hitTarget;
        });

        if (!hitTarget) {
            if (node.contains?.(point)) {
                return node;
            } else {
                return null;
            }
        } else {
            return hitTarget;
        }
    }

    public play() {
        window.requestAnimationFrame(() => {
            this.ticksFunction.forEach(fn => fn());
            window.requestAnimationFrame(() => {
                this.play();
            })
        })
    }

    public draw() {
        const _draw = () => {
            if (this.context instanceof CanvasRenderingContext2D) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            } else if (this.context instanceof WebGL2RenderingContext) {
                this.context.clear(this.context.COLOR_BUFFER_BIT);
            }
            this.root.draw(this.context);
        }
        autorun(_draw)
    }

    public appendChild(child: RenderObject) {
        this.root.appendChild(child);
    }

    public removeChild(child: RenderObject) {
        this.root.removeChild(child);
    }
}