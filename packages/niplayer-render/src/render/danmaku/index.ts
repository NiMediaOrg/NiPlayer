import bind from "bind-decorator";
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
    speed: number;
    lastTime: number;
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

    private running: boolean = false;

    get renderTime() {
        return this.timeController.renderTime;
    }

    constructor(public config: IDanmakuEngineConfig) {
        this.config = Object.assign(defaultConfig, config);
        this.timeController = new TimeController(this.config.timeline);
        this.canvas = document.createElement('canvas');

        this.canvas.style.width = this.config.container.clientWidth + 'px';
        this.canvas.style.height = this.config.container.clientHeight + 'px';

        this.canvas.width = this.config.container.clientWidth * window.devicePixelRatio;
        this.canvas.height = this.config.container.clientHeight * window.devicePixelRatio;

        this.config.container.appendChild(this.canvas);

        this.context = this.canvas.getContext('2d')!;
    }

    private fetchDanmaku() {
        const list = this.list.filter((_, index) => index >= this.listIndex && index <= this.listIndex + this.numberPerSecond);
        this.listIndex = this.listIndex + this.numberPerSecond;
        if (this.listIndex > this.list.length) {
            this.listIndex = 0;
        }
        return list.map((dm) => this.parseDanmaku(dm));
    }

    private parseDanmaku(dm: IDanmaku): IDanmakuRender {
        const { text } = dm;
        this.context.font = `${dm.fontSize * window.devicePixelRatio}px ${dm.fontFamily}`;
        this.context.fillStyle = dm.color;

        this.context.beginPath()
        this.context.fillText(text, this.canvas.width + 10, - dm.fontSize - 10);
        this.context.closePath();

        const { width } = this.context.measureText(text);
        const speed = (this.canvas.width + width) / dm.duration;
        return {
            ...dm,
            on: false,
            x: this.canvas.width,
            y: 20,
            width: width,
            height: dm.fontSize * window.devicePixelRatio,
            middleTime: this.renderTime + (this.canvas.width) / speed,
            endTime: this.renderTime + (this.canvas.width + width) / speed,
            speed,
            lastTime: this.renderTime,
        }
    }

    public addList(l: IDanmaku[]) {
        this.list.push(...l.map(dm => ({
            fontSize: this.config.fontSize,
            fontFamily: this.config.fontFamily,
            color: this.config.color,
            duration: this.config.duration,
            ...dm,
        })));
    }

    public clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public clearSomewhere(s: { x: number, y: number }, e: { x: number, y: number }) {
        this.context.clearRect(s.x, s.y, e.x - s.x, e.y - s.y);
    }

    public start() {
        if (this.running) return;
        this.running = true;
        this.timeController.start();
        this.timer = window.requestAnimationFrame(() => this.schedule());
    }

    public stop() {
        if (!this.running) return;
        this.running = false;
        this.timeController.pause();
        window.cancelAnimationFrame(this.timer);
    }

    @bind
    public schedule() {
        this.timeController.update();
        const dead: IDanmakuRender[] = [];
        this.clear()

        this.renderList.forEach((dm) => {
            dm.x -= dm.speed * (this.renderTime - dm.lastTime);
            dm.lastTime = this.renderTime;
            if (dm.x + dm.width < 0) {
                dead.push(dm);
                return;
            }
            this.context.beginPath();
            this.context.font = `${dm.fontSize}px ${dm.fontFamily}`;
            this.context.fillStyle = dm.color;
            this.context.fillText(dm.text, dm.x + 10, dm.y);
            this.context.closePath();
        });

        if (!this.lastFetchDmTime || this.renderTime - this.lastFetchDmTime >= 0.5) {
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
                    dead.push(dm);
                } else {
                    this.renderList.push(dm);
                    dm.on = true;
                }
            });
        }

        dead.forEach(dm => {
            this.clearSomewhere({ x: dm.x, y: dm.y }, { x: dm.x + dm.width, y: dm.y + dm.height });
            dm.on = false;
            dm.x = this.canvas.width;
            dm.y = 20;
            dm.endTime = 0;
            dm.middleTime = 0;
            this.renderList.delete(dm);
        })

        this.timer = window.requestAnimationFrame(this.schedule);
    }


    /**
     * @desc 弹幕的碰撞检测
     * @param dm 
     * @returns 
     */
    private collisionCheck(dm: IDanmakuRender): boolean {
        // debugger
        if (this.renderList.size() === 0) {
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
                if ((dm.x + dm.width < space.x && dm.endTime < space.middleTime) || (dm.x > space.x + space.width && dm.middleTime > space.endTime)) {
                    if (dm.y < space.y && !this.hasOtherDanmakuToCheck(index + 1, dm)) {
                        return true;;
                    }
                    continue;
                } else {
                    dm.y = space.y + space.height + 10;
                }
            }

            if (dm.y + dm.height > this.canvas.height) {
                return false;
            }

            return true;
        }
    }

    private hasOtherDanmakuToCheck(index: number, dm: IDanmakuRender) {
        for (let i = index; i < this.renderList.array.length; i++) {
            if (this.renderList.array[i].y < dm.y + dm.height) {
                return true;
            }

        }
    }
}
