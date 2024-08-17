import { defaultConfig } from "./default-config";
import { PriorityQueue } from "./priority-queue";
import { TimeController } from "./time-controller";

//* 使用canvas实现弹幕的demo
export interface IDanmaku {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    duration?: number;
    text: string;
}

export interface IDanmakuRender extends IDanmaku {
    on?: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    middleTime: number;
    endTime: number;
}

export interface IDanmakuEngineConfig {
    container: HTMLElement;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    bold?: boolean;
    duration?: number;
    timeline?: () => number;
}
/**
 * @desc canvas 绘制弹幕
 * @param canvas 
 * @param options 
 */
// export function drawCanvasDanmaku(canvas: HTMLCanvasElement, options: IDanmakuOptions) {
//     const ctx = canvas.getContext('2d')!;
//     const speed = canvas.width / options.duration;
//     ctx.font = `${options.fontSize}px ${options.fontFamily}`;
//     ctx.fillStyle = options.color;
//     ctx.textAlign = 'center';

//     let x = canvas.width;

//     let timer: number;
//     const draw = () => {
//         if (x + ctx.measureText(options.text).width + 10 < 0) {
//             window.cancelAnimationFrame(timer);
//             return;
//         }
//         ctx.beginPath();
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.fillText(options.text, x, options.y);
//         ctx.closePath();
//         x -= speed / 1000 * 33;
//         timer = window.requestAnimationFrame(draw);
//     }

//     draw();
// }

export class NiDanmakuEngine {
    private list: IDanmaku[] = [];
    private renderList: PriorityQueue<IDanmakuRender> = new PriorityQueue();

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private timeController: TimeController;
    private timer: number = -1;
    private listIndex: number = 0;
    private numberPerSecond: number = 100;
    private lastFetchDmTime: number | null = null;

    get renderTime() {
        return this.timeController.renderTime;
    }

    constructor(public config: IDanmakuEngineConfig) {
        this.config = Object.assign(defaultConfig, config);
        this.timeController = new TimeController(this.config.timeline);
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;
        this.canvas.width = this.config.container.offsetWidth;
        this.canvas.height = this.config.container.offsetHeight;
        this.config.container.appendChild(this.canvas);
    }

    private fetchDanmaku() {
        const list = this.list.filter((_, index) => index >= this.listIndex && index <= this.listIndex + this.numberPerSecond);
        this.listIndex = this.listIndex + this.numberPerSecond;
        if (this.listIndex > this.list.length) {
            this.listIndex = 0;
        }
        return list.map(this.parseDanmaku);
    }

    private parseDanmaku(dm: IDanmaku): IDanmakuRender {
        const { text } = dm;
        this.context.font = `${dm.fontSize}px ${dm.fontFamily}`;
        this.context.fillStyle = dm.color;
        this.context.textAlign = 'center';
        this.context.beginPath();
        
        this.context.fillText(text, this.canvas.width, 0);
        this.context.closePath();

        const { width } = this.context.measureText(text);
        return {
            ...dm,
            on: false,
            x: 0,
            y: 0,
            width: width,
            height: dm.fontSize,
            middleTime: this.canvas.width / dm.duration,
            endTime: (this.canvas.width + width) / dm.duration,
        }
    }

    public addList(l: IDanmaku[]) {
        this.list.push(...l);
    }

    public clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public clearSomewhere(s: {x: number, y: number}, e: {x: number, y: number}) {
        this.context.clearRect(s.x, s.y, e.x - s.x, e.y - s.y);
    }

    public start() {
        this.timeController.start();
        this.timer = window.requestAnimationFrame(this.schedule);
    }

    public stop() {
        this.timeController.pause();
        window.cancelAnimationFrame(this.timer);
    }

    public schedule() {
        this.timeController.update();
        const dead: IDanmakuRender[] = [];

        if (!this.lastFetchDmTime || this.renderTime - this.lastFetchDmTime >= 1) {
            this.lastFetchDmTime = this.renderTime;
            const dmList = this.fetchDanmaku();
            dmList.forEach((dm) => {
                if (dm.on) return;
                const res = this.collisionCheck(dm);
                if (!res) {
                    this.clearSomewhere({
                        x: dm.x,
                        y: dm.y,
                    }, {
                        x: dm.x + dm.width,
                        y: dm.y + dm.height,
                    });
                } else {
                    this.renderList.push(dm);
                    dm.on = true;
                }
            });
        }

        this.renderList.forEach((dm) => {
            this.clearSomewhere({x: dm.x, y: dm.y}, {x: dm.x + dm.width, y: dm.y + dm.height})
            if (dm.x + dm.width < 0) {
                dead.push(dm);
                return;
            }
            dm.x -= this.config.container.clientWidth / dm.duration / 1000 * 33.3;
            this.context.beginPath();
            this.context.fillText(dm.text, dm.x, dm.y);
            this.context.closePath();
        });

        dead.forEach(dm => {
            this.clearSomewhere({x: dm.x, y: dm.y}, {x: dm.x + dm.width, y: dm.y + dm.height});
            dm.on = false;
            dm.x = 0;
            dm.y = this.canvas.width
            this.renderList.delete(dm);
        })

        this.timer = window.requestAnimationFrame(this.schedule);
    }

    private collisionCheck(dm: IDanmakuRender): boolean {
        if (this.renderList.size() === 0) {
            dm.y = 0;
            dm.x = this.canvas.width;
            return true;
        } else {
            for (let index = 0; index < this.renderList.array.length; index++) {
                const space = this.renderList.array[index];
                if (dm.y + dm.height < space.y) {
                    return true;
                }
                if (dm.y > space.y + space.height) {
                    continue;
                }
                if (dm.x + dm.width < space.x && dm) {


                }
            }   
        }
    }
}
