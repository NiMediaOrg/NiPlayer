import { IRenderObject, RenderObject } from "./material/RenderObject";
import { IApplicationConfig } from "./types";
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

    draw() {
        if (!this.dirty) this.dirty = true;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.root.draw(this.context);
    }

    appendChild(child: RenderObject) {
        this.root.appendChild(child);
        this.changeStyleProxy(child);
    }

    removeChild(child: RenderObject) {
        this.root.removeChild(child);
    }

    changeStyleProxy(item: RenderObject) {
        item.style = new Proxy(item.style, {
            get: (target: IRenderObject, key: string) => {
                return target[key];
            },
            set: (target: IRenderObject, key: string, value) => {
                if (target[key] === value) return true;
                return Reflect.set(target, key, value);
            }
        })

        item.children.forEach(child => this.changeStyleProxy(child));
    } 
}