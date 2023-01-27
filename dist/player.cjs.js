'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
function createSvgs(d, viewBox = '0 0 1024 1024') {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    for (let str of d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', str);
        svg.appendChild(path);
    }
    return svg;
}
/**
 * @description 合并两个组件的实例对象
 * @param target
 * @param another
 */
function patchComponent(target, another, options = { replaceElementType: "replaceOuterHTMLOfComponent" }) {
    var _a, _b;
    if (target.id !== another.id)
        throw new Error("需要合并的两个组件的id不相同");
    for (let key in another) {
        if (key in target) {
            if (key === 'props') {
                patchDOMProps(target[key], another[key], target.el);
            }
            else if (key === 'el') {
                if (options.replaceElementType === "replaceOuterHTMLOfComponent") {
                    target.el = another.el;
                }
                else {
                    for (let child of target.el.childNodes) {
                        target.el.removeChild(child);
                    }
                    target.el.appendChild(another.el);
                }
            }
            else {
                if (target[key] instanceof Function) {
                    if (!(another[key] instanceof Function)) {
                        throw new Error(`属性${key}对应的值应该为函数类型`);
                    }
                    console.log("合并函数", another[key]);
                    target[key] = patchFn(target[key], another[key], target);
                    target.resetEvent();
                }
                else if (target[key] instanceof HTMLElement) {
                    if (!(another[key] instanceof HTMLElement) && typeof another[key] !== 'string') {
                        throw new Error(`属性${key}对应的值应该为DOM元素或者字符串类型`);
                    }
                    if (typeof another[key] === 'string') ;
                    else {
                        (_a = target[key].parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(another[key], target[key]);
                        (_b = target[key].parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(target[key]);
                        target[key] = another[key];
                    }
                }
            }
        }
    }
}
function patchDOMProps(targetProps, anotherProps, el) {
    for (let key in anotherProps) {
        if (targetProps.hasOwnProperty(key)) {
            if (key === 'id') {
                targetProps.id = anotherProps.id;
                el.id = targetProps.id;
            }
            else if (key === "className") {
                targetProps.className.concat(anotherProps.className);
                addClass(el, anotherProps.className);
            }
            else if (key === "style") {
                patchStyle(targetProps.style, anotherProps.style, el);
            }
        }
        else {
            targetProps[key] = anotherProps[key];
            if (key !== "style") {
                el[key] = anotherProps[key];
            }
            else if (key === "style") {
                for (let prop in anotherProps['style']) {
                    el.style[prop] = anotherProps['style'][prop];
                }
            }
        }
    }
}
function patchStyle(targetStyle, anotherStyle, el) {
    for (let key in anotherStyle) {
        targetStyle[key] = anotherStyle[key];
    }
    for (let key in targetStyle) {
        el.style[key] = targetStyle[key];
    }
}
function patchFn(targetFn, anotherFn, context) {
    // let args = targetFn.arguments;
    console.log(targetFn, anotherFn, context);
    function fn(...args) {
        targetFn.call(context, ...args);
        anotherFn.call(context, ...args);
    }
    return fn.bind(context);
}

class Component extends BaseEvent {
    constructor(container, desc, props, children) {
        super();
        let dom = $(desc, props, children);
        this.el = dom;
        // 安装组件成功
        container.append(dom);
    }
    init() { }
    initEvent() { }
    initTemplate() { }
    initComponent() { }
    resetEvent() { }
}

const playPath = "M254.132978 880.390231c-6.079462 0-12.155854-1.511423-17.643845-4.497431-11.828396-6.482645-19.195178-18.85851-19.195178-32.341592L217.293955 180.465165c0-13.483082 7.366781-25.898857 19.195178-32.346709 11.787464-6.483668 26.226315-5.928013 37.57478 1.363044L789.797957 481.028615c10.536984 6.77531 16.908088 18.456351 16.908088 30.979572 0 12.523221-6.371104 24.203238-16.908088 30.982642L274.063913 874.53385C267.983427 878.403994 261.060761 880.390231 254.132978 880.390231L254.132978 880.390231zM254.132978 880.390231";
const pausePath = "M304 176h80v672h-80zM712 176h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z";
const volumePath$1 = "M318.577778 352.711111h-156.444445c-31.288889 0-56.888889 25.6-56.888889 56.888889v206.222222c0 31.288889 25.6 56.888889 56.888889 56.888889h156.444445L512 866.133333c27.022222 27.022222 72.533333 8.533333 72.533333-29.866666V187.733333c0-38.4-45.511111-56.888889-72.533333-29.866666L318.577778 352.711111z m210.488889 448L359.822222 631.466667c-11.377778-11.377778-25.6-17.066667-39.822222-17.066667h-156.444444V409.6h156.444444c15.644444 0 29.866667-5.688889 39.822222-17.066667l169.244445-169.244444v577.422222zM642.844444 341.333333v8.533334c0 7.111111 4.266667 14.222222 9.955556 19.911111 41.244444 34.133333 66.844444 85.333333 66.844444 142.222222s-25.6 108.088889-66.844444 142.222222c-5.688889 4.266667-9.955556 11.377778-9.955556 19.911111v8.533334c0 21.333333 24.177778 32.711111 41.244445 19.911111 56.888889-44.088889 92.444444-112.355556 92.444444-190.577778 0-76.8-35.555556-145.066667-92.444444-190.577778-17.066667-12.8-41.244444-1.422222-41.244445 19.911111z";
const volumePath$2 = "M642.844444 183.466667c0 11.377778 7.111111 21.333333 17.066667 25.6 118.044444 49.777778 201.955556 166.4 201.955556 301.511111 0 136.533333-83.911111 253.155556-201.955556 301.511111-9.955556 4.266667-17.066667 14.222222-17.066667 25.6 0 19.911111 21.333333 34.133333 39.822223 25.6 137.955556-58.311111 236.088889-194.844444 236.088889-354.133333S822.044444 213.333333 682.666667 155.022222c-18.488889-5.688889-39.822222 8.533333-39.822223 28.444445z";
const fullscreenPath = "M290 236.4l43.9-43.9c4.7-4.7 1.9-12.8-4.7-13.6L169 160c-5.1-0.6-9.5 3.7-8.9 8.9L179 329.1c0.8 6.6 8.9 9.4 13.6 4.7l43.7-43.7L370 423.7c3.1 3.1 8.2 3.1 11.3 0l42.4-42.3c3.1-3.1 3.1-8.2 0-11.3L290 236.4zM642.7 423.7c3.1 3.1 8.2 3.1 11.3 0l133.7-133.6 43.7 43.7c4.7 4.7 12.8 1.9 13.6-4.7L863.9 169c0.6-5.1-3.7-9.5-8.9-8.9L694.8 179c-6.6 0.8-9.4 8.9-4.7 13.6l43.9 43.9L600.3 370c-3.1 3.1-3.1 8.2 0 11.3l42.4 42.4zM845 694.9c-0.8-6.6-8.9-9.4-13.6-4.7l-43.7 43.7L654 600.3c-3.1-3.1-8.2-3.1-11.3 0l-42.4 42.3c-3.1 3.1-3.1 8.2 0 11.3L734 787.6l-43.9 43.9c-4.7 4.7-1.9 12.8 4.7 13.6L855 864c5.1 0.6 9.5-3.7 8.9-8.9L845 694.9zM381.3 600.3c-3.1-3.1-8.2-3.1-11.3 0L236.3 733.9l-43.7-43.7c-4.7-4.7-12.8-1.9-13.6 4.7L160.1 855c-0.6 5.1 3.7 9.5 8.9 8.9L329.2 845c6.6-0.8 9.4-8.9 4.7-13.6L290 787.6 423.7 654c3.1-3.1 3.1-8.2 0-11.3l-42.4-42.4z";
const fullscreenExitPath = "M391 240.9c-0.8-6.6-8.9-9.4-13.6-4.7l-43.7 43.7L200 146.3c-3.1-3.1-8.2-3.1-11.3 0l-42.4 42.3c-3.1 3.1-3.1 8.2 0 11.3L280 333.6l-43.9 43.9c-4.7 4.7-1.9 12.8 4.7 13.6L401 410c5.1 0.6 9.5-3.7 8.9-8.9L391 240.9zM401.1 614.1L240.8 633c-6.6 0.8-9.4 8.9-4.7 13.6l43.9 43.9L146.3 824c-3.1 3.1-3.1 8.2 0 11.3l42.4 42.3c3.1 3.1 8.2 3.1 11.3 0L333.7 744l43.7 43.7c4.7 4.7 12.8 1.9 13.6-4.7l18.9-160.1c0.6-5.1-3.7-9.4-8.8-8.8zM622.9 409.9L783.2 391c6.6-0.8 9.4-8.9 4.7-13.6L744 333.6 877.7 200c3.1-3.1 3.1-8.2 0-11.3l-42.4-42.3c-3.1-3.1-8.2-3.1-11.3 0L690.3 279.9l-43.7-43.7c-4.7-4.7-12.8-1.9-13.6 4.7L614.1 401c-0.6 5.2 3.7 9.5 8.8 8.9zM744 690.4l43.9-43.9c4.7-4.7 1.9-12.8-4.7-13.6L623 614c-5.1-0.6-9.5 3.7-8.9 8.9L633 783.1c0.8 6.6 8.9 9.4 13.6 4.7l43.7-43.7L824 877.7c3.1 3.1 8.2 3.1 11.3 0l42.4-42.3c3.1-3.1 3.1-8.2 0-11.3L744 690.4z";

class FullScreen extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "FullScreen";
        this.player = player;
        this.props = props || {};
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }
    initTemplate() {
        addClass(this.el, ["video-fullscreen", "video-controller"]);
    }
    initEvent() {
        this.onClick = this.onClick.bind(this);
        this.el.onclick = this.onClick;
        addClass(this.el, ["video-fullscreen", "video-controller"]);
        this.iconBox = $("div.video-icon");
        this.icon = createSvg(fullscreenPath);
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);
    }
    onClick(e) {
        if (this.player.container.requestFullscreen && !document.fullscreenElement) {
            this.player.container.requestFullscreen(); //该函数请求全屏
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullscreenExitPath);
            this.iconBox.appendChild(this.icon);
        }
        else if (document.fullscreenElement) {
            document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullscreenPath);
            this.iconBox.appendChild(this.icon);
        }
    }
}

class PlayButton extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "PlayButton";
        this.player = player;
        this.props = props || {};
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }
    initTemplate() {
        addClass(this.el, ["video-start-pause"]);
        this.pauseIcon = createSvg(pausePath);
        this.playIcon = createSvg(playPath);
        this.button = this.playIcon;
        this.el.appendChild(this.button);
    }
    initEvent() {
        this.onClick = this.onClick.bind(this);
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
        this.el.onclick = this.onClick;
    }
    resetEvent() {
        this.onClick = this.onClick.bind(this);
        this.el.onclick = null;
        this.el.onclick = this.onClick;
    }
    onClick(e) {
        console.log(this);
        if (this.player.video.paused) {
            this.player.video.play();
        }
        else {
            this.player.video.pause();
        }
    }
}

class Options extends Component {
    constructor(player, container, hideWidth, hideHeight, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Options";
        this.player = player;
        props ? (this.props = props) : (this.props = {});
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

/**
 * @description 播放速率的类
 */
class Playrate extends Options {
    constructor(player, container, desc, props, children) {
        super(player, container, 0, 0, desc);
        this.id = "Playrate";
        this.init();
    }
    init() {
        this.initTemplate();
        storeControlComponent(this);
    }
    initTemplate() {
        this.el["aria-label"] = "播放倍速";
        addClass(this.el, ["video-playrate", "video-controller"]);
        this.el.removeChild(this.iconBox);
        this.iconBox = $("span", null, "倍速");
        this.el.appendChild(this.iconBox);
        this.el.removeChild(this.hideBox);
        this.hideBox = $("ul", { style: { bottom: "41px" }, "aria-label": "播放速度调节" });
        addClass(this.hideBox, ["video-playrate-set"]);
        this.el.appendChild(this.hideBox);
        for (let i = 0; i < 6; i++) {
            let li = $("li");
            li.innerText = "2.0x";
            this.hideBox.appendChild(li);
        }
    }
}

class CompletedProgress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "CompletedProgress";
        this.props = props || {};
        this.player = player;
        this.init();
    }
    init() {
        this.initEvent();
        storeControlComponent(this);
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

class Volume extends Options {
    constructor(player, container, desc, props, children) {
        super(player, container, 0, 0, desc);
        this.id = "Volume";
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
        storeControlComponent(this);
    }
    initTemplate() {
        addClass(this.el, ["video-volume", "video-controller"]);
        this.el["aria-label"] = "音量";
        this.hideBox.style.bottom = "41px";
        addClass(this.hideBox, ["video-volume-set"]);
        this.volumeProgress = $("div.video-volume-progress", { style: { height: "70px" } });
        this.volumeShow = $("div.video-volume-show");
        this.volumeShow.innerText = "50";
        this.volumeCompleted = new CompletedProgress(this.player, this.volumeProgress, "div.video-volume-completed");
        this.hideBox.appendChild(this.volumeShow);
        this.hideBox.appendChild(this.volumeProgress);
        addClass(this.iconBox, ["video-icon"]);
        this.icon = createSvgs([volumePath$1, volumePath$2]);
        this.iconBox.appendChild(this.icon);
    }
    initEvent() {
        this.player.on("volume-progress-click", (e, ctx) => {
            let eoffsetY = e.pageY - getDOMPoint(this.volumeProgress).y;
            let offsetY = this.volumeProgress.clientHeight - eoffsetY;
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

const CONTROL_COMPONENT_STORE = new Map();
function storeControlComponent(item) {
    CONTROL_COMPONENT_STORE.set(item.id, item);
}
const controllersMapping = {
    "PlayButton": PlayButton,
    "Playrate": Playrate,
    "Volume": Volume,
    "FullScreen": FullScreen
};

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
        this.container = options.container;
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
    registerControls(id, component) {
        let store = CONTROL_COMPONENT_STORE;
        console.log(store, id);
        if (store.has(id)) {
            patchComponent(store.get(id), component);
        }
    }
    /**
     * @description 注册对应的组件
     * @param plugin
     */
    use(plugin) {
        plugin.install(this);
    }
}

class ToolBar extends Component {
    // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Toolbar";
        this.timer = 0;
        this.player = player;
        this.props = props || {};
        this.init();
    }
    init() {
        this.initTemplate();
        this.initComponent();
        this.initEvent();
        storeControlComponent(this);
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
        this.props = props || {};
        this.player = player;
        this.init();
    }
    init() {
        addClass(this.el, ["video-dot", "video-dot-hidden"]);
        this.initEvent();
        storeControlComponent(this);
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

class BufferedProgress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "BufferedProgress";
        this.props = props || {};
        this.player = player;
        this.init();
    }
    init() {
        this.initEvent();
        storeControlComponent(this);
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
        this.props = props || {};
        this.init();
    }
    init() {
        this.initComponent();
        this.initEvent();
        storeControlComponent(this);
    }
    initComponent() {
        this.dot = new Dot(this.player, this.el, "div");
        this.completedProgress = new CompletedProgress(this.player, this.el, "div.video-completed");
        this.bufferedProgress = new BufferedProgress(this.player, this.el, "div.video-buffered");
    }
    initEvent() {
        this.el.onmouseenter = (e) => {
            this.onMouseenter(e);
        };
        this.el.onmouseleave = (e) => {
            this.onMouseleave(e);
        };
        this.el.onclick = (e) => {
            this.onClick(e);
        };
    }
    onMouseenter(e) {
        this.player.emit("progress-mouseenter", e, this);
    }
    onMouseleave(e) {
        this.player.emit("progress-mouseleave", e, this);
    }
    onClick(e) {
        this.player.emit("progress-click", e, this);
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

class Controller extends Component {
    // playButton: PlayButton;
    // fullscreen: FullScreen;
    // volume: Volume;
    // playrate: Playrate;
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Controller";
        this.props = {};
        // 控件
        this.leftControllers = [PlayButton];
        this.rightController = [Playrate, Volume, FullScreen];
        this.player = player;
        this.props = props || {};
        this.init();
    }
    init() {
        this.initControllers();
        this.initTemplate();
        this.initComponent();
        storeControlComponent(this);
    }
    initControllers() {
        let leftControllers = this.player.playerOptions.leftControllers;
        let rightControllers = this.player.playerOptions.rightControllers;
        if (leftControllers) {
            this.leftControllers = leftControllers.map(item => {
                if (typeof item === 'string') {
                    if (!controllersMapping[item]) {
                        throw new Error(`传入的组件名${item}错误`);
                    }
                    return controllersMapping[item];
                }
                else {
                    return item;
                }
            });
        }
        if (rightControllers) {
            this.rightController = rightControllers.map(item => {
                if (typeof item === 'string') {
                    if (!controllersMapping[item]) {
                        throw new Error(`传入的组件名${item}错误`);
                    }
                    return controllersMapping[item];
                }
                else {
                    return item;
                }
            });
            console.log(this.rightController);
        }
    }
    initTemplate() {
        this.subPlay = $("div.video-subplay");
        this.settings = $("div.video-settings");
        this.el.appendChild(this.subPlay);
        this.el.appendChild(this.settings);
    }
    initComponent() {
        this.leftControllers.forEach(ControlConstructor => {
            let instance = new ControlConstructor(this.player, this.subPlay, "div");
            this[instance.id] = instance;
        });
        this.rightController.forEach(ControlConstructor => {
            let instance = new ControlConstructor(this.player, this.settings, "div");
            this[instance.id] = instance;
        });
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

exports.$warn = $warn;
exports.BaseEvent = BaseEvent;
exports.Controller = Controller;
exports.Player = Player;
exports.Progress = Progress;
exports.ToolBar = ToolBar;
exports.addZero = addZero;
exports.checkAdaptationSet = checkAdaptationSet;
exports.checkBaseURL = checkBaseURL;
exports.checkInitialization = checkInitialization;
exports.checkMediaType = checkMediaType;
exports.checkMpd = checkMpd;
exports.checkPeriod = checkPeriod;
exports.checkRepresentation = checkRepresentation;
exports.checkSegmentBase = checkSegmentBase;
exports.checkSegmentList = checkSegmentList;
exports.checkSegmentTemplate = checkSegmentTemplate;
exports.checkSegmentURL = checkSegmentURL;
exports.formatTime = formatTime;
exports.parseDuration = parseDuration;
exports.string2booolean = string2booolean;
exports.string2number = string2number;
exports.switchToSeconds = switchToSeconds;
