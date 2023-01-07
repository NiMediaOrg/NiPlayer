import { $warn,styles,Progress,Controller } from "../../index";
import "./toolbar.less";
// 视频播放器的工具栏组件
export class ToolBar {
    private template_!: HTMLElement;
    
    constructor() {
        this.init();
    }

    get template(): HTMLElement {
        return this.template_;
    }

    init() {
        let div = document.createElement("div");
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += new Progress().template as string;
        div.innerHTML += new Controller().template as string;
        this.template_ = div;
    }
}