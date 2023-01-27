import { Node } from "../../types/Player";
import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps } from "../../types/Player";
import { Dot } from "./parts/Dot";
import { CompletedProgress } from "./parts/CompletedProgress";
import { BufferedProgress } from "./parts/BufferedProgress";
import "./progress.less"
import { storeControlComponent } from "../../utils/store";

export class Progress extends Component implements ComponentItem {
  readonly id = "Progress";
  private mouseDown: boolean = false;
  props: DOMProps;
  player:Player;
  dot: Dot;
  completedProgress: CompletedProgress;
  bufferedProgress: BufferedProgress;
  constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
    super(container,desc,props,children);
    this.player = player;
    this.props = props || {};
    this.init();
  }

  init() {
    this.initComponent();
    this.initEvent();

    storeControlComponent(this);
  }

  initComponent() {
    this.dot = new Dot(this.player,this.el,"div");
    this.completedProgress = new CompletedProgress(this.player,this.el,"div.video-completed");
    this.bufferedProgress = new BufferedProgress(this.player,this.el,"div.video-buffered");
  }

  initEvent() {
    this.el.onmouseenter = (e) => {
      this.onMouseenter(e);
    }

    this.el.onmouseleave = (e) => {
      this.onMouseleave(e);
    }

    this.el.onclick = (e) => {
      this.onClick(e)
    }
  }

  onMouseenter(e:MouseEvent) {
    this.player.emit("progress-mouseenter",e,this);
  }

  onMouseleave(e:MouseEvent) {
    this.player.emit("progress-mouseleave",e,this);
  }

  onClick(e:MouseEvent) {
    this.player.emit("progress-click",e,this);
  }
}
// export class Progress extends BaseEvent {
//   private template_!: HTMLElement | string;
//   private container!: HTMLElement;
//   private video!: HTMLVideoElement;
//   private progress!: HTMLElement;
//   private bufferedProgress!: HTMLElement;
//   private completedProgress!: HTMLElement;
//   private pretime!: HTMLElement;
//   private dot!: HTMLElement;
//   private mouseDown: boolean = false;
//   constructor(container: HTMLElement) {
//     super();
//     this.container = container;
//     this.init();
//     this.initEvent();
//   }

//   get template(): HTMLElement | string {
//     return this.template_;
//   }

//   init() {
//     this.template_ = `
//         <div class="${styles["video-progress"]}">
//             <div class="${styles["video-pretime"]}">00:00</div>
//             <div class="${styles["video-buffered"]}"></div>
//             <div class="${styles["video-completed"]} "></div>
//             <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}">
//               ${televisionSVG}
//             </div>
//         </div>
//         `;
//   }

//   initProgressEvent() {
//     this.progress.onmouseenter = () => {
//       this.dot.className = `${styles["video-dot"]}`;
//     };

//     this.progress.onmouseleave = () => {
//       if (!this.mouseDown) {
//         this.dot.className = `${styles["video-dot"]} ${styles["video-dot-hidden"]}`;
//       }
//     };

//     this.progress.onmousemove = (e: MouseEvent) => {
//       let scale = e.offsetX / this.progress.offsetWidth;
//       if (scale < 0) {
//         scale = 0;
//       } else if (scale > 1) {
//         scale = 1;
//       }

//       let preTime = formatTime(scale * this.video.duration);
//       this.pretime.style.display = "block";
//       this.pretime.innerHTML = preTime;
//       this.pretime.style.left = e.offsetX - 17 + "px";
//       e.preventDefault();
//     };

//     this.progress.onmouseleave = (e: MouseEvent) => {
//       this.pretime.style.display = "none";
//     };
//     this.progress.onclick = (e: MouseEvent) => {
//       let scale = e.offsetX / this.progress.offsetWidth;
//       if (scale < 0) {
//         scale = 0;
//       } else if (scale > 1) {
//         scale = 1;
//       }
//       this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
//       this.bufferedProgress.style.width = scale * 100 + "%";
//       this.completedProgress.style.width = scale * 100 + "%";

//       this.video.currentTime = Math.floor(scale * this.video.duration);
//       if (this.video.paused) this.video.play();
//     };

//     this.dot.addEventListener("mousedown", (e: MouseEvent) => {
//       let left = this.completedProgress.offsetWidth;
//       let mouseX = e.pageX;
//       this.mouseDown = true;
//       document.onmousemove = (e: MouseEvent) => {
//         let scale = (e.pageX - mouseX + left) / this.progress.offsetWidth;
//         if (scale < 0) {
//           scale = 0;
//         } else if (scale > 1) {
//           scale = 1;
//         }
//         this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
//         this.bufferedProgress.style.width = scale * 100 + "%";
//         this.completedProgress.style.width = scale * 100 + "%";

//         this.video.currentTime = Math.floor(scale * this.video.duration);
//         if (this.video.paused) this.video.play();
//         e.preventDefault();
//       };

//       document.onmouseup = (e: MouseEvent) => {
//         document.onmousemove = document.onmouseup = null;
//         this.mouseDown = false;
//         e.preventDefault();
//       };
//       e.preventDefault();
//     });
//   }

//   initEvent() {
//     this.on("mounted", () => {
//       this.progress = this.container.querySelector(
//         `.${styles["video-controls"]} .${styles["video-progress"]}`
//       )!;
//       this.pretime = this.progress.children[0] as HTMLElement;
//       this.bufferedProgress = this.progress.children[1] as HTMLElement;
//       this.completedProgress = this.progress.children[2] as HTMLElement;
//       this.dot = this.progress.children[3] as HTMLElement;
//       this.video = this.container.querySelector("video")!;
//       this.initProgressEvent();
//     });

//     this.on("timeupdate", (current: number) => {
//       let scaleCurr = (this.video.currentTime / this.video.duration) * 100;
//       let scaleBuffer =
//         ((this.video.buffered.end(0) + this.video.currentTime) /
//           this.video.duration) *
//         100;
//       this.completedProgress.style.width = scaleCurr + "%";
//       this.dot.style.left =
//         this.progress.offsetWidth * (scaleCurr / 100) - 5 + "px";
//       this.bufferedProgress.style.width = scaleBuffer + "%";
//     });

//     this.on("loadedmetadata", (summary: number) => {});
//   }
// }
