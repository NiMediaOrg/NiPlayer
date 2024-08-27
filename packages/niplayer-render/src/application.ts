import bind from "bind-decorator";
import { RenderObject } from "./material/RenderObject";
import { autorun } from "./reactivity/effects";
import { IApplicationConfig, IPoint } from "./types";
import { Circle, Rectangle } from "./material";
class ApplicationRoot extends RenderObject {
    public anchor: { x: number; y: number; };
    public contains(point: { x: number; y: number; }): boolean {
        return true;
    }

    public draw(context: CanvasRenderingContext2D): void {
        this.children.forEach(child => child.draw(context));
    }

    public drawContent(context: CanvasRenderingContext2D): void {}
}
export class Application {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private root: ApplicationRoot;

    private ticksFunction: (() => void)[] = [];

    public ticker = {
        add: (cb: () => void) => {
            this.ticksFunction.push(cb);
        }
    }

    public get view() {
        return this.canvas;
    }

    constructor(config: IApplicationConfig) {
        this.canvas = document.createElement("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;
        this.canvas.style.width = config.width + 'px';
        this.canvas.style.height = config.height + 'px';
        this.canvas.style.background = config.background ?? 'white';
        this.canvas.width = config.width * window.devicePixelRatio;
        this.canvas.height = config.height * window.devicePixelRatio;
        this.root = new ApplicationRoot();

        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.play();
    }

    @bind
    private onMouseMove(e: MouseEvent) {
        const target = this.hitCheck(this.root, {x: e.offsetX, y: e.offsetY});
        if (target instanceof Rectangle) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    /**
     * @desc canvas中的碰撞检测实现，使用后序遍历，优先实现子节点
     * @param point 
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
            // this.draw();
            this.ticksFunction.forEach(fn => fn());
            window.requestAnimationFrame(() => {
                this.play();
            })
        })
    }

    draw() {
        const _draw = () => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.root.draw(this.context);
        }
        autorun(_draw)
    }

    appendChild(child: RenderObject) {
        this.root.appendChild(child);
    }

    removeChild(child: RenderObject) {
        this.root.removeChild(child);
    }
}