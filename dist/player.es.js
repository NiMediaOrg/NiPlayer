import 'loading-mask.less';

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

class Player extends BaseEvent {
    constructor(options) {
        super();
        this.playerOptions = {
            url: "",
            autoplay: false,
            width: "100%",
            height: "100%",
        };
        this.playerOptions = Object.assign(this.playerOptions, options);
        console.log(this.playerOptions);
        this.init();
        this.initComponent();
        this.initContainer();
        // 初始化播放器的事件
        this.initEvent();
    }
    init() {
        let container = this.playerOptions.container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container;
    }
    initComponent() {
        this.toolbar = new ToolBar(this.container);
        this.loadingMask = new LoadingMask(this.container);
        this.errorMask = new ErrorMask(this.container);
    }
    initContainer() {
        this.container.style.width = this.playerOptions.width;
        this.container.style.height = this.playerOptions.height;
        this.container.className = styles["video-container"];
        this.container.innerHTML = `
      <div class="${styles["video-wrapper"]}">
        <video>
          <source src="${this.playerOptions.url}" type="video/mp4">
            你的浏览器暂不支持HTML5标签,非常抱歉
          </source>
        </video>
      </div>
    `;
        this.container.appendChild(this.toolbar.template);
        this.video = this.container.querySelector("video");
    }
    initEvent() {
        this.toolbar.emit("mounted");
        this.emit("mounted", this);
        this.container.onclick = (e) => {
            if (e.target == this.video) {
                if (this.video.paused) {
                    this.video.play();
                }
                else if (this.video.played) {
                    this.video.pause();
                }
            }
        };
        this.container.addEventListener("mouseenter", (e) => {
            this.toolbar.emit("showtoolbar", e);
        });
        this.container.addEventListener("mousemove", (e) => {
            this.toolbar.emit("showtoolbar", e);
        });
        this.container.addEventListener("mouseleave", (e) => {
            this.toolbar.emit("hidetoolbar");
        });
        this.video.addEventListener("loadedmetadata", (e) => {
            console.log("元数据加载完毕", this.video.duration);
            this.playerOptions.autoplay && this.video.play();
            this.toolbar.emit("loadedmetadata", this.video.duration);
        });
        this.video.addEventListener("timeupdate", (e) => {
            this.toolbar.emit("timeupdate", this.video.currentTime);
        });
        // 当视频可以再次播放的时候就移除loading和error的mask，通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
        this.video.addEventListener("play", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.toolbar.emit("play");
        });
        this.video.addEventListener("pause", (e) => {
            this.toolbar.emit("pause");
        });
        this.video.addEventListener("waiting", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.loadingMask.addLoadingMask();
        });
        //当浏览器请求视频发生错误的时候
        this.video.addEventListener("stalled", (e) => {
            console.log("视频加载发生错误");
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
        this.video.addEventListener("error", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
        this.video.addEventListener("abort", (e) => {
            this.loadingMask.removeLoadingMask();
            this.errorMask.removeErrorMask();
            this.errorMask.addErrorMask();
        });
    }
    isTagValidate(ele) {
        if (window.getComputedStyle(ele).display === "block")
            return true;
        if (window.getComputedStyle(ele).display === "inline")
            return false;
        if (window.getComputedStyle(ele).display === "inline-block") {
            if (ele instanceof HTMLImageElement ||
                ele instanceof HTMLAudioElement ||
                ele instanceof HTMLVideoElement ||
                ele instanceof HTMLInputElement ||
                ele instanceof HTMLCanvasElement ||
                ele instanceof HTMLButtonElement) {
                return false;
            }
            return true;
        }
        return true;
    }
}

// 视频播放器的工具栏组件
class ToolBar extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initComponent();
        this.initTemplate();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    showToolBar(e) {
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]}`;
        if (e.target !== this.video) ;
        else {
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000);
        }
    }
    hideToolBar() {
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    }
    init() { }
    initComponent() {
        this.progress = new Progress(this.container);
        this.controller = new Controller(this.container);
    }
    initTemplate() {
        let div = document.createElement("div");
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += this.progress.template;
        div.innerHTML += this.controller.template;
        this.template_ = div;
    }
    initEvent() {
        this.on("showtoolbar", (e) => {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.showToolBar(e);
        });
        this.on("hidetoolbar", () => {
            this.hideToolBar();
        });
        this.on("play", () => {
            this.controller.emit("play");
        });
        this.on("pause", () => {
            this.controller.emit("pause");
        });
        this.on("loadedmetadata", (summary) => {
            this.controller.emit("loadedmetadata", summary);
            this.progress.emit("loadedmetadata", summary);
        });
        this.on("timeupdate", (current) => {
            this.controller.emit("timeupdate", current);
            this.progress.emit("timeupdate", current);
        });
        this.on("mounted", () => {
            this.video = this.container.querySelector("video");
            this.controller.emit("mounted");
            this.progress.emit("mounted");
        });
    }
}

class Progress extends BaseEvent {
    constructor(container) {
        super();
        this.mouseDown = false;
        this.container = container;
        this.init();
        this.initEvent();
    }
    get template() {
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
        `;
    }
    initProgressEvent() {
        this.progress.onmouseenter = () => {
            this.dot.className = `${styles["video-dot"]}`;
        };
        this.progress.onmouseleave = () => {
            if (!this.mouseDown) {
                this.dot.className = `${styles["video-dot"]} ${styles["video-dot-hidden"]}`;
            }
        };
        this.progress.onmousemove = (e) => {
            let scale = e.offsetX / this.progress.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            let preTime = formatTime(scale * this.video.duration);
            this.pretime.style.display = "block";
            this.pretime.innerHTML = preTime;
            this.pretime.style.left = e.offsetX - 17 + "px";
            e.preventDefault();
        };
        this.progress.onmouseleave = (e) => {
            this.pretime.style.display = "none";
        };
        this.progress.onclick = (e) => {
            let scale = e.offsetX / this.progress.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
            this.bufferedProgress.style.width = scale * 100 + "%";
            this.completedProgress.style.width = scale * 100 + "%";
            this.video.currentTime = Math.floor(scale * this.video.duration);
            if (this.video.paused)
                this.video.play();
        };
        this.dot.addEventListener("mousedown", (e) => {
            let left = this.completedProgress.offsetWidth;
            let mouseX = e.pageX;
            this.mouseDown = true;
            document.onmousemove = (e) => {
                let scale = (e.pageX - mouseX + left) / this.progress.offsetWidth;
                if (scale < 0) {
                    scale = 0;
                }
                else if (scale > 1) {
                    scale = 1;
                }
                this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
                this.bufferedProgress.style.width = scale * 100 + "%";
                this.completedProgress.style.width = scale * 100 + "%";
                this.video.currentTime = Math.floor(scale * this.video.duration);
                if (this.video.paused)
                    this.video.play();
                e.preventDefault();
            };
            document.onmouseup = (e) => {
                document.onmousemove = document.onmouseup = null;
                this.mouseDown = false;
                e.preventDefault();
            };
            e.preventDefault();
        });
    }
    initEvent() {
        this.on("mounted", () => {
            this.progress = this.container.querySelector(`.${styles["video-controls"]} .${styles["video-progress"]}`);
            this.pretime = this.progress.children[0];
            this.bufferedProgress = this.progress.children[1];
            this.completedProgress = this.progress.children[2];
            this.dot = this.progress.children[3];
            this.video = this.container.querySelector("video");
            this.initProgressEvent();
        });
        this.on("timeupdate", (current) => {
            let scaleCurr = (this.video.currentTime / this.video.duration) * 100;
            let scaleBuffer = ((this.video.buffered.end(0) + this.video.currentTime) /
                this.video.duration) *
                100;
            this.completedProgress.style.width = scaleCurr + "%";
            this.dot.style.left =
                this.progress.offsetWidth * (scaleCurr / 100) - 5 + "px";
            this.bufferedProgress.style.width = scaleBuffer + "%";
        });
        this.on("loadedmetadata", (summary) => { });
    }
}

class Controller extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = `
        <div class="${styles["video-play"]}">
            <div class="${styles["video-subplay"]}">
                <div class="${styles["video-start-pause"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
                </div>
                <div class="${styles["video-duration"]}">
                    <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
                </div>
            </div>
            <div class="${styles["video-settings"]}">
                <div class="${styles["video-subsettings"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-shezhi"]}"></i>
                </div>
                <div class="${styles["video-volume"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-yinliang"]}"></i>
                    <div class="${styles["video-volume-progress"]}">
                    <div class="${styles["video-volume-completed"]}"></div>
                    <div class="${styles["video-volume-dot"]}"></div>
                    </div>
                </div>
                <div class="${styles["video-fullscreen"]}">
                    <i class="${icon["iconfont"]} ${icon["icon-quanping"]}"></i>
                </div>
            </div>
        </div>
    `;
    }
    initControllerEvent() {
        this.videoPlayBtn.onclick = (e) => {
            if (this.video.paused) {
                this.video.play();
            }
            else if (this.video.played) {
                this.video.pause();
            }
        };
        this.fullScreen.onclick = () => {
            if (this.container.requestFullscreen && !document.fullscreenElement) {
                this.container.requestFullscreen(); //该函数请求全屏
            }
            else if (document.fullscreenElement) {
                document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            }
        };
    }
    initEvent() {
        this.on("play", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
        });
        this.on("pause", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
        });
        this.on("loadedmetadata", (summary) => {
            this.summaryTime.innerHTML = formatTime(summary);
        });
        this.on("timeupdate", (current) => {
            this.currentTime.innerHTML = formatTime(current);
        });
        this.on("mounted", () => {
            this.videoPlayBtn = this.container.querySelector(`.${styles["video-start-pause"]} i`);
            this.currentTime = this.container.querySelector(`.${styles["video-duration-completed"]}`);
            this.summaryTime = this.container.querySelector(`.${styles["video-duration-all"]}`);
            this.video = this.container.querySelector("video");
            this.fullScreen = this.container.querySelector(`.${styles["video-fullscreen"]} i`);
            this.initControllerEvent();
        });
    }
}

class LoadingMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = this.generateLoadingMask();
    }
    generateLoadingMask() {
        let mask = document.createElement("div");
        mask.className = styles["loading-mask"];
        let loadingContainer = document.createElement("div");
        loadingContainer.className = styles["loading-container"];
        let loaadingItem = document.createElement("div");
        loaadingItem.className = styles["loading-item"];
        let loadingTitle = document.createElement("div");
        loadingTitle.className = styles["loading-title"];
        loadingTitle.innerText = "视频正在努力加载中...";
        loadingContainer.appendChild(loaadingItem);
        loadingContainer.appendChild(loadingTitle);
        mask.appendChild(loadingContainer);
        return mask;
    }
    addLoadingMask() {
        if (![...this.container.children].includes(this.template)) {
            this.container.appendChild(this.template);
        }
    }
    removeLoadingMask() {
        if ([...this.container.children].includes(this.template)) {
            this.container.removeChild(this.template);
        }
    }
}

class ErrorMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = this.generateErrorMask();
    }
    generateErrorMask() {
        let mask = document.createElement("div");
        mask.className = styles["error-mask"];
        let errorContainer = document.createElement("div");
        errorContainer.className = styles["error-container"];
        let errorItem = document.createElement("div");
        errorItem.className = styles["error-item"];
        let i = document.createElement("i");
        i.className = `${icon["iconfont"]} ${icon["icon-cuowutishi"]}`;
        errorItem.appendChild(i);
        let errorTitle = document.createElement("div");
        errorTitle.className = styles["error-title"];
        errorTitle.innerText = "视频加载发生错误";
        errorContainer.appendChild(errorItem);
        errorContainer.appendChild(errorTitle);
        mask.appendChild(errorContainer);
        return mask;
    }
    addErrorMask() {
        if (![...this.container.children].includes(this.template)) {
            // ToDo
            this.container.appendChild(this.template);
        }
    }
    removeErrorMask() {
        if ([...this.container.children].includes(this.template)) {
            // ToDo
            this.container.removeChild(this.template);
        }
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
    let hours, minutes, seconds;
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
let checkUtils = {
    checkMediaType,
    checkBaseURL,
    checkAdaptationSet,
    checkSegmentTemplate,
    checkRepresentation,
    checkSegmentList,
    checkInitialization,
    checkSegmentURL,
    checkSegmentBase
};
function findSpecificType(array, type) {
    array.forEach(item => {
        if (checkUtils[`check${type}`] && checkUtils[`check${type}`].call(this, item)) {
            return true;
        }
    });
    return false;
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

const styles = {
    "video-container": "player_video-container__ndwL-",
    "video-wrapper": "player_video-wrapper__zkaDS",
    "video-controls": "toolbar_video-controls__z6g6I",
    "video-controls-hidden": "toolbar_video-controls-hidden__Fyvfe",
    "video-progress": "pregress_video-progress__QjWkP",
    "video-pretime": "pregress_video-pretime__JInJt",
    "video-buffered": "pregress_video-buffered__N25SV",
    "video-completed": "pregress_video-completed__CnWX-",
    "video-dot": "pregress_video-dot__giuCI",
    "video-dot-hidden": "pregress_video-dot-hidden__SceSE",
    "video-play": "controller_video-play__fP3BY",
    "video-subplay": "controller_video-subplay__WTnV2",
    "video-start-pause": "controller_video-start-pause__MAW2N",
    "video-duration": "controller_video-duration__4mxGN",
    "video-duration-completed": "controller_video-duration-completed__aKEo3",
    "video-settings": "controller_video-settings__vL60f",
    "video-subsettings": "controller_video-subsettings__lRckv",
    "video-volume": "controller_video-volume__6xzJB",
    "video-volume-progress": "controller_video-volume-progress__f4U3J",
    "video-volume-completed": "controller_video-volume-completed__R0FaX",
    "video-volume-dot": "pregress_video-dot__giuCI",
    "video-fullscreen": "controller_video-fullscreen__1-aJA",
    "video-duration-all": "controller_video-duration-all__MOXNR",
    "loading-mask": "",
    "loading-container": "",
    "loading-item": "",
    "loading-title": "",
    "error-mask": "",
    "error-container": "",
    "error-item": "",
    "error-title": ""
};

const icon = {
    iconfont: "main_iconfont__23ooR",
    "icon-bofang": "main_icon-bofang__SU-ss",
    "icon-shezhi": "main_icon-shezhi__y-8S0",
    "icon-yinliang": "main_icon-yinliang__ZFc2R",
    "icon-quanping": "main_icon-quanping__eGMiv",
    "icon-cuowutishi": "main_icon-cuowutishi__fy-Bm",
    "icon-zanting": "main_icon-zanting__BtGq5",
};

function initMpdFile(mpd) {
    return {
        tag: "File",
        root: initMpd(mpd.querySelector("MPD")),
    };
}
function initMpd(mpd) {
    let type = mpd.getAttribute("type");
    let availabilityStartTime = mpd.getAttribute("availabilityStartTime");
    let mediaPresentationDuration = mpd.getAttribute("mediaPresentationDuration");
    let minBufferTime = mpd.getAttribute("minBufferTime");
    let minimumUpdatePeriod = mpd.getAttribute("minimumUpdatePeriod");
    let maxSegmentDuration = mpd.getAttribute("maxSegmentDuration");
    let children = new Array();
    mpd.querySelectorAll("Period").forEach((item) => {
        children.push(initPeriod(item));
    });
    return {
        tag: "MPD",
        type,
        children,
        maxSegmentDuration,
        availabilityStartTime,
        mediaPresentationDuration,
        minBufferTime,
        minimumUpdatePeriod,
    };
}
function initPeriod(period) {
    let id = period.getAttribute("id");
    let duration = period.getAttribute("duration");
    let start = period.getAttribute("start");
    let children = new Array();
    period.querySelectorAll("AdaptationSet").forEach((item) => {
        children.push(initAdaptationSet(item));
    });
    return {
        tag: "Period",
        id,
        duration,
        start,
        children,
    };
}
function initAdaptationSet(adaptationSet) {
    let segmentAlignment = string2booolean(adaptationSet.getAttribute("segmentAlignment"));
    let mimeType = adaptationSet.getAttribute("mimeType");
    if (checkMediaType(mimeType)) {
        let startWithSAP = string2number(adaptationSet.getAttribute("startWithSAP"));
        let segmentTemplate = adaptationSet.querySelector("SegmentTemplate");
        let children = new Array();
        if (segmentTemplate) {
            children.push(initSegmentTemplate(segmentTemplate));
        }
        adaptationSet.querySelectorAll("Representation").forEach((item) => {
            children.push(initRepresentation(item));
        });
        return {
            tag: "AdaptationSet",
            children,
            segmentAlignment,
            mimeType,
            startWithSAP,
        };
    }
    else {
        $warn("传入的MPD文件中的AdaptationSet标签上的属性mimeType的值不合法，应该为MIME类型");
    }
}
function initRepresentation(representation) {
    let bandWidth = Number(representation.getAttribute("bandwidth"));
    let codecs = representation.getAttribute("codecs");
    let id = representation.getAttribute("id");
    let width = Number(representation.getAttribute("width"));
    let height = Number(representation.getAttribute("height"));
    let mimeType = representation.getAttribute("mimeType");
    let audioSamplingRate = representation.getAttribute("audioSamplingRate");
    let children = new Array();
    if (mimeType && !checkMediaType(mimeType)) {
        $warn("");
    }
    else {
        //如果representation没有子节点
        if (representation.childNodes.length === 0) {
            return {
                tag: "Representation",
                bandWidth,
                codecs,
                audioSamplingRate,
                id,
                width,
                height,
                mimeType: mimeType,
            };
        }
        else {
            //对于Representation标签的children普遍认为有两种可能
            if (representation.querySelector("SegmentList")) {
                //1. (BaseURL)+SegmentList
                let list = initSegmentList(representation.querySelector("SegmentList"));
                if (representation.querySelector("BaseURL")) {
                    children.push(initBaseURL(representation.querySelector("BaseURL")), list);
                }
                else {
                    children.push(list);
                }
            }
            else if (representation.querySelector("SegmentBase")) {
                //2. BaseURL+SegmentBase 适用于每个rep只有一个Seg的情况
                let base = initSegmentBase(representation.querySelector("SegmentBase"));
                if (representation.querySelector("BaseURL")) {
                    children.push(initBaseURL(representation.querySelector("BaseURL")), base);
                }
                else {
                    $warn("传入的MPD文件中Representation中的子节点结构错误");
                }
            }
            return {
                tag: "Representation",
                bandWidth,
                codecs,
                audioSamplingRate,
                id,
                width,
                height,
                mimeType: mimeType,
                children,
            };
        }
    }
}
function initSegmentTemplate(segmentTemplate) {
    let initialization = segmentTemplate.getAttribute("initialization");
    let media = segmentTemplate.getAttribute("media");
    return {
        tag: "SegmentTemplate",
        initialization,
        media,
    };
}
function initSegmentBase(segmentBase) {
    let range = segmentBase.getAttribute("indexRange");
    if (!range) {
        $warn("传入的MPD文件中SegmentBase标签上不存在属性indexRange");
    }
    let initialization = initInitialization(segmentBase.querySelector("Initialization"));
    return {
        tag: "SegmentBase",
        indexRange: range,
        child: initialization,
    };
}
function initSegmentList(segmentList) {
    let duration = segmentList.getAttribute("duration");
    if (!duration) {
        $warn("传入的MPD文件中SegmentList标签上不存在属性duration");
    }
    duration = Number(duration);
    let children = [
        initInitialization(segmentList.querySelector("Initialization")),
    ];
    segmentList.querySelectorAll("SegmentURL").forEach((item) => {
        children.push(initSegmentURL(item));
    });
    return {
        tag: "SegmentList",
        duration: duration,
        children,
    };
}
function initInitialization(initialization) {
    return {
        tag: "Initialization",
        sourceURL: initialization.getAttribute("sourceURL"),
        range: initialization.getAttribute("range"),
    };
}
function initSegmentURL(segmentURL) {
    let media = segmentURL.getAttribute("media");
    if (!media) {
        $warn("传入的MPD文件中SegmentURL标签上不存在属性media");
    }
    return {
        tag: "SegmentURL",
        media,
    };
}
function initBaseURL(baseURL) {
    return {
        tag: "BaseURL",
        url: baseURL.innerHTML,
    };
}

function parseMpd(mpd) {
    let mpdModel = initMpdFile(mpd).root;
    let type = mpdModel.type;
    console.log(parseDuration(mpdModel.mediaPresentationDuration));
    let mediaPresentationDuration = switchToSeconds(parseDuration(mpdModel.mediaPresentationDuration));
    let maxSegmentDuration = switchToSeconds(parseDuration(mpdModel.maxSegmentDuration));
    let sumSegment = maxSegmentDuration
        ? Math.ceil(mediaPresentationDuration / maxSegmentDuration)
        : null;
    // 代表的是整个MPD文档中的需要发送的所有xhr请求地址，包括多个Period对应的视频和音频请求地址
    let mpdRequest = [];
    // 遍历文档中的每一个Period，Period代表着一个完整的音视频，不同的Period具有不同内容的音视频，例如广告和正片就属于不同的Period
    mpdModel.children.forEach((period) => {
        let path = "";
        let videoRequest;
        let audioRequest;
        for (let i = period.children.length - 1; i >= 0; i--) {
            let child = period.children[i];
            if (checkBaseURL(child)) {
                path += child.url;
                break;
            }
        }
        period.children.forEach((child) => {
            if (checkAdaptationSet(child)) {
                if (child.mimeType === "audio/mp4") {
                    audioRequest = parseAdaptationSet(child, path, sumSegment, child.mimeType);
                }
                else if (child.mimeType === "video/mp4") {
                    videoRequest = parseAdaptationSet(child, path, sumSegment, child.mimeType);
                }
            }
        });
        mpdRequest.push({ videoRequest, audioRequest });
    });
    return {
        mpdRequest,
        type,
        mediaPresentationDuration,
        maxSegmentDuration,
    };
}
function parseAdaptationSet(adaptationSet, path = "", sumSegment, type) {
    let children = adaptationSet.children;
    let hasTemplate = false;
    let template;
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkSegmentTemplate(child)) {
            hasTemplate = true;
            template = child;
            break;
        }
    }
    let mediaResolve = {};
    children.forEach((child) => {
        if (checkRepresentation(child)) {
            let generateInitializationUrl, initializationFormat, generateMediaUrl, mediaFormat;
            if (hasTemplate) {
                [generateInitializationUrl, initializationFormat] =
                    generateTemplateTuple(template.initialization);
                [generateMediaUrl, mediaFormat] = generateTemplateTuple(template.media);
            }
            let obj = parseRepresentation(child, hasTemplate, path, sumSegment, type, [generateInitializationUrl, initializationFormat], [generateMediaUrl, mediaFormat]);
            Object.assign(mediaResolve, obj);
        }
    });
    return mediaResolve;
}
function parseRepresentation(representation, hasTemplate = false, path = "", sumSegment, type, initializationSegment, mediaSegment) {
    let resolve;
    if (type === "video/mp4") {
        resolve = `${representation.width}*${representation.height}`;
    }
    else if (type === "audio/mp4") {
        resolve = `${representation.audioSamplingRate}`;
    }
    let obj = {};
    // 一. 如果该适应集 中具有标签SegmentTemplate，则接下来的Representation中请求的Initialization Segment和Media Segment的请求地址一律以SegmentTemplate中的属性为基准
    if (hasTemplate) {
        obj[resolve] = parseRepresentationWithSegmentTemplateOuter(representation, path, sumSegment, initializationSegment, mediaSegment);
    }
    else {
        //二. 如果没有SegmentTemplate标签，则根据Representation中的子结构具有三种情况,前提是Representation中必须具有子标签，否则报错
        //情况1.(BaseURL)+SegmentList
        if (findSpecificType(representation.children, "SegmentList")) ;
        else if (findSpecificType(representation.children, "SegmentBase")) ;
    }
    return obj;
}
/**
 * @description 应对Representation外部具有SegmentTemplate的结构这种情况
 */
function parseRepresentationWithSegmentTemplateOuter(representation, path = "", sumSegment, initializationSegment, mediaSegment) {
    let requestArray = new Array();
    let [generateInitializationUrl, initializationFormat] = initializationSegment;
    let [generateMediaUrl, mediaFormat] = mediaSegment;
    // 1.处理对于Initialization Segment的请求
    for (let i in initializationFormat) {
        if (initializationFormat[i] === "RepresentationID") {
            initializationFormat[i] = representation.id;
        }
        else if (initializationFormat[i] === "Number") {
            initializationFormat[i] = "1";
        }
    }
    requestArray.push({
        type: "segement",
        url: path + generateInitializationUrl(...initializationFormat),
    });
    // 2.处理对于Media Segment的请求
    for (let i in mediaFormat) {
        if (mediaFormat[i] === "RepresentationID") {
            mediaFormat[i] = representation.id;
        }
    }
    for (let index = 1; index <= sumSegment; index++) {
        for (let i in mediaFormat) {
            if (mediaFormat[i] === "Number") {
                mediaFormat[i] = `${index}`;
            }
        }
        requestArray.push({
            type: "segement",
            url: path + generateMediaUrl(...mediaFormat),
        });
    }
    return requestArray;
}
/**
 * @description 应对Representation内部具有(BaseURL)+SegmentList的结构这种情况
 */
function parseRepresentationWithSegmentList(representation, path) {
    let children = representation.children;
    let segmentList;
    let requestArray = new Array();
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkBaseURL(child)) {
            path += child;
            break;
        }
    }
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkSegmentList(child)) {
            segmentList = child;
            break;
        }
    }
    for (let i = segmentList.length - 1; i >= 0; i--) {
        let child = segmentList[i];
        if (checkInitialization(child)) {
            requestArray.push({
                type: "range",
                url: path + child.sourceURL,
            });
            break;
        }
    }
    segmentList.forEach((segment) => {
        if (checkSegmentURL(segment)) {
            if (segment.media) {
                requestArray.push({
                    type: "segement",
                    url: path + segment.media,
                });
            }
            else {
                requestArray.push({
                    type: "range",
                    url: path,
                    range: segment.mediaRange,
                });
            }
        }
    });
    return requestArray;
}
/**
 * @description 应对Representation内部具有(BaseURL)+SegmentBase的结构这种情况
 */
function parseRepresentationWithSegmentBase(representation, path) {
    let children = representation.children;
    let requestArray = new Array();
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkBaseURL(child)) {
            path += child.url;
            break;
        }
    }
    for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        if (checkSegmentBase(child)) {
            requestArray.push({
                type: "range",
                url: path,
                range: child.child.range,
            });
            requestArray.push({
                type: "range",
                url: path,
                range: child.indexRange,
            });
        }
    }
    return requestArray;
}
/**
 * @description 生成模板函数和占位符
 */
function generateTemplateTuple(s) {
    let splitStr = [];
    let format = [];
    for (let i = 0; i < s.length; i++) {
        let str = s.slice(0, i + 1);
        if (/\$.+?\$/.test(str)) {
            format.push(str.match(/\$(.+?)\$/)[1]);
            splitStr.push(str.replace(/\$.+?\$/, ""), "%format%");
            s = s.slice(i + 1);
            i = 0;
            continue;
        }
        if (i + 1 === s.length) {
            splitStr.push(s);
        }
    }
    return [
        (...args) => {
            let index = 0;
            let str = "";
            splitStr.forEach((item) => {
                if (item === "%format%") {
                    str += args[index];
                    index++;
                }
                else {
                    str += item;
                }
            });
            return str;
        },
        format,
    ];
}

export { $warn, BaseEvent, Controller, ErrorMask, LoadingMask, Player, Progress, ToolBar, addZero, checkAdaptationSet, checkBaseURL, checkInitialization, checkMediaType, checkRepresentation, checkSegmentBase, checkSegmentList, checkSegmentTemplate, checkSegmentURL, checkUtils, findSpecificType, formatTime, generateTemplateTuple, icon, initAdaptationSet, initBaseURL, initInitialization, initMpd, initMpdFile, initPeriod, initRepresentation, initSegmentBase, initSegmentList, initSegmentTemplate, initSegmentURL, parseAdaptationSet, parseDuration, parseMpd, parseRepresentation, parseRepresentationWithSegmentBase, parseRepresentationWithSegmentList, parseRepresentationWithSegmentTemplateOuter, string2booolean, string2number, styles, switchToSeconds };
