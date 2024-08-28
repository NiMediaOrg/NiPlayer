export class TimeController {
    private startTime: number | null = null;
    private pauseTime: number | null = null;
    /**
     * @desc 弹幕引擎的渲染时间
     */
    public renderTime: number = 0;
    constructor(public timeline: () => number) {}

    get now() {
        return window.performance.now() / 1000;

    }
    start() {
        if (!this.startTime) {
            this.startTime = this.now;
        } else {
            this.startTime += this.now - this.pauseTime;
            this.pauseTime = null;
        }
    }

    pause() {
        this.pauseTime = this.now;
    }

    update() {
        this.renderTime = this.now - this.startTime;
    }
}