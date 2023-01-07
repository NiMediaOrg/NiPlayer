import { $warn,styles } from "../../index";
import "./pregress.less";
export class Progress {
    private template_!: HTMLElement | string;
    constructor() {
        this.init();
    }

    get template(): HTMLElement | string {
        return this.template_;
    }

    init() {
        this.template_ = `
        <div class="${styles["video-progress"]}">
            <div class="${styles["video-pretime"]}">00:00</div>
            <div class="${styles["video-buffered"]}"></div>
            <div class="${styles["video-completed"]} "></div>
            <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}"></div>
        </div>
        `
    }
}