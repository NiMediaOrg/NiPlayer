import { RenderObject } from "./material/RenderObject";
import { autorun } from "./reactivity/effects";
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
        const _draw = () => {
            console.log('draw');
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