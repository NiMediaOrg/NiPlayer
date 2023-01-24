class BaseEvent {
    constructor() {
        this.$events = {};
    }
    //事件触发
    emit(event, ...args) {
        if (this.$events[event]) {
            this.$events[event].forEach((cb) => {
                cb.call(this, ...args);
            });
        }
    }
    //事件监听
    on(event, cb) {
        this.$events[event] = this.$events[event] || [];
        this.$events[event].push(cb);
    }
}

function getDOMPoint(dom) {
    var t = 0;
    var l = 0;
    //判断是否有父容器，如果存在则累加其边距
    while (dom !== document.body) {
        t += dom.offsetTop; //叠加父容器的上边距
        l += dom.offsetLeft; //叠加父容器的左边距
        //if(dom.style.borderLeftWidth) l += Number(dom.style.borderLeftWidth);
        //if(dom.style.borderTopWidth) t += Number(dom.style.borderTopWidth);
        dom = dom.parentNode;
    }
    return { x: l, y: t };
}
/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent
 * @param topChild
 * @param pageX
 * @param pageY
 * @returns {boolean}
 */
function checkIsMouseInRange(parent, topChild, pageX, pageY) {
    let { x, y } = getDOMPoint(parent);
    let allTop = y - parseInt(topChild.style.bottom) - topChild.clientHeight;
    let allBottom = y + parent.clientHeight;
    let allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2);
    let allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2);
    let parentLeft = x;
    let parentRight = x + parent.clientWidth;
    if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop)
        return true;
    if (pageX >= parentLeft - 5 && pageX <= parentRight + 5 && pageY >= y && pageY <= allBottom)
        return true;
    return false;
}
const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;
/**
 * @description 根据desc的标签描述和props的属性描述来创建一个DOM对象，并且在实例上挂载各种属性
 * @param {string} desc
 * @param {DOMProps} props
 * @param {Node[]} children
 * @returns
 */
function $(desc, props, children) {
    let match = [];
    let regArray = SELECTOR_REG.exec(desc);
    match[0] = regArray[1] || undefined;
    match[1] = regArray[2] || undefined;
    match[2] = regArray[3] || undefined;
    let el = match[0] ? document.createElement(match[0]) : document.createElement("div");
    if (match[1]) {
        el.id = match[1];
    }
    match[2] && addClass(el, [match[2]]);
    for (let key in props) {
        if (typeof props[key] === "object") {
            if (key === "style") {
                let str = "";
                let styles = props[key];
                for (let k in styles) {
                    str += `${k}: ${styles[k]};`;
                }
                el.setAttribute("style", str);
            }
        }
        else {
            el.setAttribute(key, String(props[key]));
        }
    }
    if (typeof children === "string") {
        el.innerHTML += children;
    }
    else if (children) {
        for (let child of children) {
            el.appendChild(child.el);
        }
    }
    return el;
}
function addClass(dom, classNames) {
    let classList = dom.classList;
    for (let name of classNames) {
        if (!includeClass(dom, name)) {
            classList.add(name);
        }
    }
}
function removeClass(dom, classNames) {
    let classList = dom.classList;
    classList.remove(...classNames);
}
function includeClass(dom, className) {
    let classList = dom.classList;
    for (let key in classList) {
        if (classList[key] === className)
            return true;
    }
    return false;
}
function getElementSize(dom) {
    const clone = dom.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.opacity = '0';
    clone.removeAttribute('hidden');
    const parent = dom.parentNode || document.body;
    parent.appendChild(clone);
    const rect = clone.getBoundingClientRect();
    parent.removeChild(clone);
    return rect;
}
const svgNS = 'http://www.w3.org/2000/svg';
function createSvg(d, viewBox = '0 0 1024 1024') {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    if (d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', d);
        svg.appendChild(path);
    }
    return svg;
}

class Component extends BaseEvent {
    constructor(container, desc, props, children) {
        super();
        let dom = $(desc, props, children);
        this.el = dom;
        // 安装组件成功
        container.append(dom);
    }
}

class Player extends Component {
    constructor(options) {
        super(options.container, "div.video-wrapper");
        this.id = "Player";
        // 播放器的默认配置
        this.playerOptions = {
            url: "",
            autoplay: false,
            width: "100%",
            height: "100%",
        };
        this.playerOptions = Object.assign(this.playerOptions, options);
        options.container.className = "video-container";
        options.container.style.width = this.playerOptions.width + "px";
        options.container.style.height = this.playerOptions.height + "px";
        this.init();
    }
    init() {
        this.video = $("video");
        this.video.src = this.playerOptions.url || "";
        this.el.appendChild(this.video);
        this.toolBar = new ToolBar(this, this.el, "div");
        this.initEvent();
    }
    initEvent() {
        this.el.onmousemove = (e) => {
            this.emit("showtoolbar", e);
        };
        this.el.onmouseenter = (e) => {
            this.emit("showtoolbar", e);
        };
        this.el.onmouseleave = (e) => {
            this.emit("hidetoolbar", e);
        };
        this.video.onloadedmetadata = (e) => {
            this.emit("loadedmetadata", e);
        };
        this.video.ontimeupdate = (e) => {
            this.emit("timeupdate", e);
        };
        this.video.onplay = (e) => {
            this.emit("play", e);
        };
        this.video.onpause = (e) => {
            this.emit("pause", e);
        };
        this.on("progress-click", (e, ctx) => {
            let scale = e.offsetX / ctx.el.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.video.currentTime = Math.floor(scale * this.video.duration);
            this.video.paused && this.video.play();
        });
    }
    attendSource(url) {
        this.video.src = url;
    }
}

class ToolBar extends Component {
    // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Toolbar";
        this.timer = 0;
        this.player = player;
        this.props = props;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initComponent();
        this.initEvent();
    }
    /**
     * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
     */
    initTemplate() {
        addClass(this.el, ["video-controls", "video-controls-hidden"]);
    }
    initComponent() {
        this.progress = new Progress(this.player, this.el, "div.video-progress");
        this.controller = new Controller(this.player, this.el, "div.video-play");
    }
    initEvent() {
        this.player.on("showtoolbar", (e) => {
            this.onShowToolBar(e);
        });
        this.player.on("hidetoolbar", (e) => {
            this.onHideToolBar(e);
        });
    }
    hideToolBar() {
        if (!includeClass(this.el, "video-controls-hidden")) {
            addClass(this.el, ["video-controls-hidden"]);
        }
    }
    showToolBar(e) {
        if (includeClass(this.el, "video-controls-hidden")) {
            removeClass(this.el, ["video-controls-hidden"]);
        }
        if (e.target === this.player.video) {
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000);
        }
    }
    onShowToolBar(e) {
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.showToolBar(e);
    }
    onHideToolBar(e) {
        this.hideToolBar();
    }
}

class Dot extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Dot";
        this.props = props;
        this.player = player;
        this.init();
    }
    init() {
        addClass(this.el, ["video-dot", "video-dot-hidden"]);
        this.initEvent();
    }
    initEvent() {
        this.player.on("progress-mouseenter", (e) => {
            this.onShowDot(e);
        });
        this.player.on("progress-mouseleave", (e) => {
            this.onHideDot(e);
        });
        this.player.on("progress-click", (e, ctx) => {
            this.onChangePos(e, ctx);
        });
    }
    onShowDot(e) {
        if (includeClass(this.el, "video-dot-hidden")) {
            removeClass(this.el, ["video-dot-hidden"]);
        }
    }
    onHideDot(e) {
        if (!includeClass(this.el, "video-dot-hidden")) {
            addClass(this.el, ["video-dot-hidden"]);
        }
    }
    onChangePos(e, ctx) {
        e.offsetX / ctx.el.offsetWidth;
        this.el.style.left = e.offsetX - getElementSize(this.el).width / 2 + 'px';
    }
}

class CompletedProgress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "CompletedProgress";
        this.props = props;
        this.player = player;
        this.init();
    }
    init() {
        this.initEvent();
    }
    initEvent() {
        this.player.on("progress-click", (e, ctx) => {
            this.onChangeSize(e, ctx);
        });
        // this.player.on("volume-progress-click",(e:MouseEvent,ctx:))
    }
    onChangeSize(e, ctx) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        }
        else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}

class BufferedProgress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "BufferedProgress";
        this.props = props;
        this.player = player;
        this.init();
    }
    init() {
        this.initEvent();
    }
    initEvent() {
        this.player.on("progress-click", (e, ctx) => {
            this.onChangeWidth(e, ctx);
        });
    }
    onChangeWidth(e, ctx) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        }
        else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}

class Progress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Progress";
        this.mouseDown = false;
        this.player = player;
        this.init();
    }
    init() {
        this.initComponent();
        this.initEvent();
    }
    initComponent() {
        this.dot = new Dot(this.player, this.el, "div");
        this.completedProgress = new CompletedProgress(this.player, this.el, "div.video-completed");
        this.bufferedProgress = new BufferedProgress(this.player, this.el, "div.video-buffered");
    }
    initEvent() {
        this.el.onmouseenter = (e) => {
            this.player.emit("progress-mouseenter", e, this);
        };
        this.el.onmouseleave = (e) => {
            this.player.emit("progress-mouseleave", e, this);
        };
        this.el.onclick = (e) => {
            this.player.emit("progress-click", e, this);
        };
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

const playPath = "M254.132978 880.390231c-6.079462 0-12.155854-1.511423-17.643845-4.497431-11.828396-6.482645-19.195178-18.85851-19.195178-32.341592L217.293955 180.465165c0-13.483082 7.366781-25.898857 19.195178-32.346709 11.787464-6.483668 26.226315-5.928013 37.57478 1.363044L789.797957 481.028615c10.536984 6.77531 16.908088 18.456351 16.908088 30.979572 0 12.523221-6.371104 24.203238-16.908088 30.982642L274.063913 874.53385C267.983427 878.403994 261.060761 880.390231 254.132978 880.390231L254.132978 880.390231zM254.132978 880.390231";
const pausePath = "M304 176h80v672h-80zM712 176h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z";

class PlayButton extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "PlayButton";
        this.player = player;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
    }
    initTemplate() {
        this.pauseIcon = createSvg(pausePath);
        this.playIcon = createSvg(playPath);
        this.button = this.playIcon;
        this.el.appendChild(this.button);
    }
    initEvent() {
        this.player.on("play", (e) => {
            this.el.removeChild(this.button);
            this.button = this.pauseIcon;
            this.el.appendChild(this.button);
        });
        this.player.on("pause", (e) => {
            this.el.removeChild(this.button);
            this.button = this.playIcon;
            this.el.appendChild(this.button);
        });
        this.el.onclick = (e) => {
            if (this.player.video.paused) {
                this.player.video.play();
            }
            else {
                this.player.video.pause();
            }
        };
    }
}

class Options extends Component {
    constructor(player, container, hideWidth, hideHeight, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Options";
        this.player = player;
        props ? (this.props = props) : (this.props = null);
        this.hideHeight = hideHeight;
        this.hideWidth = hideWidth;
        this.initBase();
    }
    initBase() {
        this.initBaseTemplate();
        this.initBaseEvent();
    }
    initBaseTemplate() {
        this.hideBox = $("div", { style: { display: "none" } });
        if (this.hideHeight && this.hideHeight > 0) {
            this.hideBox.style.height = this.hideHeight + 'px';
        }
        if (this.hideWidth && this.hideWidth > 0) {
            this.hideBox.style.width = this.hideWidth + 'px';
        }
        this.el.appendChild(this.hideBox);
        this.iconBox = $("div");
        this.el.appendChild(this.iconBox);
    }
    initBaseEvent() {
        this.el.onmouseenter = (e) => {
            let ctx = this;
            ctx.hideBox.style.display = "";
            document.body.onmousemove = ctx.handleMouseMove.bind(this);
        };
    }
    handleMouseMove(e) {
        let pX = e.pageX, pY = e.pageY;
        let ctx = this;
        if (!checkIsMouseInRange(ctx.el, ctx.hideBox, pX, pY)) {
            ctx.hideBox.style.display = "none";
            document.body.onmousemove = null;
        }
    }
}

class Volume extends Options {
    constructor(player, container, desc, props, children) {
        super(player, container, 0, 0, desc);
        this.id = "Volume";
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
    }
    initTemplate() {
        this.el["aria-label"] = "音量";
        this.hideBox.style.bottom = "41px";
        addClass(this.hideBox, ["video-volume-set"]);
        this.volumeProgress = $("div.video-volume-progress", { style: { height: "70px" } });
        this.volumeShow = $("div.video-volume-show");
        this.volumeShow.innerText = "50";
        this.volumeCompleted = new CompletedProgress(this.player, this.volumeProgress, "div.video-volume-completed");
        this.hideBox.appendChild(this.volumeShow);
        this.hideBox.appendChild(this.volumeProgress);
    }
    initEvent() {
        this.player.on("volume-progress-click", (e, ctx) => {
            let offsetY = this.volumeProgress.clientHeight - e.offsetY;
            let scale = offsetY / this.volumeProgress.clientHeight;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.volumeCompleted.el.style.height = scale * 100 + "%";
        });
        this.volumeProgress.onclick = (e) => {
            this.player.emit("volume-progress-click", e, this);
        };
    }
}

class Controller extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Controller";
        this.player = player;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initComponent();
    }
    initTemplate() {
        this.subPlay = $("div.video-subplay");
        this.settings = $("div.video-settings");
        this.el.appendChild(this.subPlay);
        this.el.appendChild(this.settings);
    }
    initComponent() {
        this.playButton = new PlayButton(this.player, this.subPlay, "div.video-start-pause");
        this.volume = new Volume(this.player, this.settings, "div");
        addClass(this.volume.el, ["video-volume", "video-controller"]);
    }
}

function $warn(msg) {
    throw new Error(msg);
}

function addZero(num) {
    return num > 9 ? "" + num : "0" + num;
}
function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minute = Math.floor(seconds / 60);
    let second = seconds % 60;
    return addZero(minute) + ":" + addZero(second);
}
function switchToSeconds(time) {
    let sum = 0;
    if (time.hours)
        sum += time.hours * 3600;
    if (time.minutes)
        sum += time.minutes * 60;
    if (time.seconds)
        sum += time.seconds;
    return sum;
}
// 解析MPD文件的时间字符串
function parseDuration(pt) {
    // Parse time from format "PT#H#M##.##S"
    let hours = 0, minutes = 0, seconds = 0;
    for (let i = pt.length - 1; i >= 0; i--) {
        if (pt[i] === "S") {
            let j = i;
            while (pt[i] !== "M" && pt[i] !== "H" && pt[i] !== "T") {
                i--;
            }
            i += 1;
            seconds = parseInt(pt.slice(i, j));
        }
        else if (pt[i] === "M") {
            let j = i;
            while (pt[i] !== "H" && pt[i] !== "T") {
                i--;
            }
            i += 1;
            minutes = parseInt(pt.slice(i, j));
        }
        else if (pt[i] === "H") {
            let j = i;
            while (pt[i] !== "T") {
                i--;
            }
            i += 1;
            hours = parseInt(pt.slice(i, j));
        }
    }
    return {
        hours,
        minutes,
        seconds,
    };
}

/**
 * @description 类型守卫函数
 */
function checkMediaType(s) {
    if (!s)
        return true;
    return (s === "video/mp4" ||
        s === "audio/mp4" ||
        s === "text/html" ||
        s === "text/xml" ||
        s === "text/plain" ||
        s === "image/png" ||
        s === "image/jpeg");
}
function checkMpd(s) {
    if (s.tag === "MPD")
        return true;
    return false;
}
function checkPeriod(s) {
    return s.tag === "Period";
}
/**
 * @description 类型守卫函数
 */
function checkBaseURL(s) {
    if (s.tag === "BaseURL" && typeof s.url === "string")
        return true;
    return false;
}
/**
 * @description 类型守卫函数
 */
function checkAdaptationSet(s) {
    if (s.tag === "AdaptationSet")
        return true;
    return false;
}
/**
 * @description 类型守卫函数
 */
function checkSegmentTemplate(s) {
    return s.tag === "SegmentTemplate";
}
/**
 * @description 类型守卫函数
 */
function checkRepresentation(s) {
    return s.tag === "Representation";
}
/**
 * @description 类型守卫函数
 */
function checkSegmentList(s) {
    return s.tag === "SegmentList";
}
function checkInitialization(s) {
    return s.tag === "Initialization";
}
function checkSegmentURL(s) {
    return s.tag === "SegmentURL";
}
function checkSegmentBase(s) {
    return s.tag === "SegmentBase";
}

function string2booolean(s) {
    if (s === "true") {
        return true;
    }
    else if (s === "false") {
        return false;
    }
    else {
        return null;
    }
}
function string2number(s) {
    let n = Number(s);
    if (isNaN(n))
        return n;
    else
        return null;
}

export { $warn, BaseEvent, Controller, Player, Progress, ToolBar, addZero, checkAdaptationSet, checkBaseURL, checkInitialization, checkMediaType, checkMpd, checkPeriod, checkRepresentation, checkSegmentBase, checkSegmentList, checkSegmentTemplate, checkSegmentURL, formatTime, parseDuration, string2booolean, string2number, switchToSeconds };
