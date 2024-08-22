import bind from "bind-decorator";
import { IRenderObject, RenderObject } from "./material/RenderObject";
import { IApplicationConfig } from "./types";
import { nextTick } from "./utils/next-tick";
const map = new Map<RenderObject, Map<string, Set<Function>>>();
class ApplicationRoot extends RenderObject {
    constructor() {
        super();
        this.style = {};
    }

    public draw(context: CanvasRenderingContext2D): void {
        this.children.forEach(child => child.draw(context));
    }
}
export class Application {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private root: ApplicationRoot;

    private dirty: boolean = false;

    public get view() {
        return this.canvas;
    }

    constructor(config: IApplicationConfig) {
        this.canvas = document.createElement("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;
        this.canvas.style.width = config.width + 'px';
        this.canvas.style.height = config.height + 'px';
        this.canvas.width = config.width * window.devicePixelRatio;
        this.canvas.height = config.height * window.devicePixelRatio;
        this.root = new ApplicationRoot();
    }

    @bind
    draw() {
        if (!this.dirty) {
            this.changeStyleProxy(this.root);   
            this.dirty = true;
        }
        console.log(this)
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.root.draw(this.context);
    }

    appendChild(child: RenderObject) {
        this.root.appendChild(child);
    }

    removeChild(child: RenderObject) {
        this.root.removeChild(child);
    }

    changeStyleProxy(item: RenderObject) {
        const queue: Set<Function> = new Set();
        let pending = false;
        item.style = new Proxy(item.style, {
            get: (target: IRenderObject, key: string) => {
                if (!map.has(item)) map.set(item, new Map());
                if (!map.get(item)?.has(key)) map.get(item)?.set(key, new Set());
                map.get(item)?.get(key)?.add(this.draw);
                return target[key];
            },
            set: (target: IRenderObject, key: string, value: any) => {
                if (target[key] === value) return true;
                target[key] = value;
                const callbacks = map.get(item)?.get(key);
                map.get(item)?.delete(key);
                callbacks?.forEach(callback => queue.add(callback));
                
                if (!pending) {
                    pending = true;
                    nextTick(() => {
                        pending = false;
                        queue.forEach(callback => callback());
                    });
                }
                return true;
            }
        })

        item.children.forEach(child => this.changeStyleProxy(child));
    } 
}