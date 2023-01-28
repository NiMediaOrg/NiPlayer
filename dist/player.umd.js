(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Player = {}));
})(this, (function (exports) { 'use strict';

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

  function getFileExtension(file) {
      for (let i = file.length - 1; i >= 0; i--) {
          if (file[i] === '.') {
              return file.slice(i, file.length);
          }
      }
      throw new Error("传入的文件没有扩展名");
  }

  const FactoryMaker = (function () {
      class FactoryMaker {
          constructor() {
              this.__class_factoryMap = {};
              this.__single_factoryMap = {};
              this.__single_instanceMap = {};
          }
          getClassFactory(classConstructor) {
              let factory = this.__class_factoryMap[classConstructor.name];
              let ctx = this;
              if (!factory) {
                  // context为调用factory函数时传入的上下文，也就是函数的执行环境
                  factory = function (context) {
                      if (!context)
                          context = {};
                      return {
                          create(...args) {
                              return ctx.merge(classConstructor, context, ...args);
                          },
                      };
                  };
                  this.__class_factoryMap[classConstructor.name] = factory;
              }
              return factory;
          }
          getSingleFactory(classConstructor) {
              let factory = this.__single_factoryMap[classConstructor.name];
              let ctx = this;
              if (!factory) {
                  factory = function (context) {
                      if (!context)
                          context = {};
                      return {
                          getInstance(...args) {
                              let instance = ctx.__single_instanceMap[classConstructor.name];
                              if (!instance) {
                                  instance = new classConstructor({ context }, ...args);
                                  ctx.__single_instanceMap[classConstructor.name] = instance;
                              }
                              return instance;
                          },
                      };
                  };
              }
              return factory;
          }
          merge(classConstructor, context, ...args) {
              let extensionObject = context[classConstructor.name];
              if (extensionObject) {
                  // 如果获取到的上下文的属性classConstructor.name对应的对象上具有覆写（override）属性，则意味着需要覆写classConstructor上对应的属性
                  if (extensionObject.override) {
                      let instance = new classConstructor({ context }, ...args);
                      let override = new extensionObject.instance({
                          context,
                          parent: instance,
                      });
                      for (let props in override) {
                          if (instance.hasOwnProperty(props)) {
                              instance[props] = parent[props];
                          }
                      }
                  }
                  else {
                      // 如果不需要覆写，则意味着直接拿context中传入的构造函数来替换这个构造函数
                      return new extensionObject.instance({
                          context,
                      });
                  }
              }
              else {
                  return new classConstructor({ context }, ...args);
              }
          }
      }
      return new FactoryMaker();
  })();

  class EventBus {
      constructor(ctx, ...args) {
          this.config = {};
          this.__events = {};
          this.config = ctx.context;
          this.setup();
      }
      setup() {
      }
      on(type, listener, scope) {
          if (!this.__events[type]) {
              this.__events[type] = [{
                      cb: listener,
                      scope
                  }];
              return;
          }
          if (this.__events[type].filter(event => {
              return event.cb === listener && event.scope === scope;
          }).length > 0) {
              throw new Error("请勿重复绑定监听器");
          }
          this.__events[type].push({
              cb: listener,
              scope
          });
      }
      off(type, listener, scope) {
          if (!this.__events[type] || this.__events[type].filter(event => {
              return event.cb === listener && event.scope === scope;
          })) {
              throw new Error("不存在该事件");
          }
          this.__events[type] = this.__events[type].filter(event => {
              return event.cb === listener && event.scope === scope;
          });
      }
      trigger(type, ...payload) {
          if (this.__events[type]) {
              this.__events[type].forEach(event => {
                  event.cb.call(event.scope, ...payload);
              });
          }
      }
  }
  const factory$b = FactoryMaker.getSingleFactory(EventBus);

  const EventConstants = {
      MANIFEST_LOADED: "manifestLoaded",
      MANIFEST_PARSE_COMPLETED: "manifestParseCompleted",
      SOURCE_ATTACHED: "sourceAttached",
      SEGEMTN_LOADED: "segmentLoaded",
      BUFFER_APPENDED: "bufferAppended",
      SEGMENT_CONSUMED: "segmentConsumed",
      SEGEMTN_REQUEST: "segmentRequest",
      MEDIA_PLAYBACK_FINISHED: "mediaPlaybackFinished",
      FIRST_REQUEST_COMPLETED: "firstRequestCompleted"
  };

  class HTTPRequest {
      constructor(config) {
          this.url = "";
          this.sendRequestTime = new Date().getTime();
          this.url = config.url;
          this.header = config.header;
          this.method = config.method;
          this.responseType = config.responseType;
      }
  }

  class XHRLoader {
      constructor(ctx, ...args) {
          this.config = {};
          this.config = ctx.context;
          this.setup();
      }
      setup() { }
      load(config) {
          let request = config.request;
          let xhr = new XMLHttpRequest();
          request.xhr = xhr;
          if (request.header) {
              for (let key in request.header) {
                  xhr.setRequestHeader(key, request.header[key]);
              }
          }
          xhr.open(request.method || "get", request.url);
          xhr.responseType = request.responseType || "arraybuffer";
          xhr.onreadystatechange = (e) => {
              if (xhr.readyState === 4) {
                  if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 304)) {
                      config.success && config.success.call(xhr, xhr.response);
                  }
                  else {
                      config.error && config.error.call(xhr, e);
                  }
              }
          };
          xhr.onabort = (e) => {
              config.abort && config.abort.call(xhr, e);
          };
          xhr.onerror = (e) => {
              config.error && config.error.call(xhr, e);
          };
          xhr.onprogress = (e) => {
              config.progress && config.progress.call(xhr, e);
          };
          xhr.send();
      }
  }
  const factory$a = FactoryMaker.getSingleFactory(XHRLoader);

  class URLLoader {
      constructor(ctx, ...args) {
          this.config = {};
          this.xhrArray = [];
          this.config = ctx.context;
          this.setup();
      }
      _loadManifest(config) {
          this.xhrLoader.load(config);
      }
      _loadSegment(config) {
          this.xhrLoader.load(config);
      }
      setup() {
          this.xhrLoader = factory$a({}).getInstance();
          this.eventBus = factory$b({}).getInstance();
      }
      // 每调用一次load函数就发送一次请求
      load(config, type) {
          //一个HTTPRequest对象才对应一个请求
          let request = new HTTPRequest(config);
          let ctx = this;
          this.xhrArray.push(request);
          if (type === "Manifest") {
              ctx._loadManifest({
                  request: request,
                  success: function (data) {
                      request.getResponseTime = new Date().getTime();
                      ctx.eventBus.trigger(EventConstants.MANIFEST_LOADED, data);
                  },
                  error: function (error) {
                      console.log(error);
                  },
                  load: function () {
                      ctx.deleteRequestFromArray(request, ctx.xhrArray);
                  },
                  abort: function () {
                      ctx.deleteRequestFromArray(request, ctx.xhrArray);
                  }
              });
          }
          else if (type === "Segment") {
              return new Promise((res, rej) => {
                  ctx._loadSegment({
                      request: request,
                      success: function (data) {
                          res(data);
                      },
                      error: function (error) {
                          rej(error);
                      },
                      load: function () {
                          ctx.deleteRequestFromArray(request, ctx.xhrArray);
                      },
                      abort: function (e) {
                          ctx.deleteRequestFromArray(request, ctx.xhrArray);
                      }
                  });
              });
          }
      }
      abortAllXHR() {
          this.xhrArray.forEach(xhr => {
              if (xhr.xhr) {
                  xhr.xhr.abort();
              }
          });
      }
      deleteRequestFromArray(request, array) {
          let index = array.indexOf(request);
          if (index !== -1) {
              array.splice(index, 1);
          }
      }
  }
  const factory$9 = FactoryMaker.getSingleFactory(URLLoader);

  var DOMNodeTypes;
  (function (DOMNodeTypes) {
      DOMNodeTypes[DOMNodeTypes["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
      DOMNodeTypes[DOMNodeTypes["TEXT_NODE"] = 3] = "TEXT_NODE";
      DOMNodeTypes[DOMNodeTypes["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
      DOMNodeTypes[DOMNodeTypes["COMMENT_NODE"] = 8] = "COMMENT_NODE";
      DOMNodeTypes[DOMNodeTypes["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
  })(DOMNodeTypes || (DOMNodeTypes = {}));

  /**
   * @description 该类仅用于处理MPD文件中具有SegmentTemplate此种情况
   */
  class SegmentTemplateParser {
      constructor(ctx, ...args) {
          this.config = ctx.context;
          this.setup();
      }
      setup() { }
      parse(Mpd) {
          this.parseNodeSegmentTemplate(Mpd);
      }
      parseNodeSegmentTemplate(Mpd) {
          Mpd["Period_asArray"].forEach(Period => {
              Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                  AdaptationSet["Representation_asArray"].forEach(Representation => {
                      let SegmentTemplate = Representation["SegmentTemplate"];
                      if (SegmentTemplate) {
                          this.generateInitializationURL(SegmentTemplate, Representation);
                          this.generateMediaURL(SegmentTemplate, Representation);
                      }
                  });
              });
          });
      }
      generateInitializationURL(SegmentTemplate, parent) {
          let templateReg = /\$(.+?)\$/ig;
          let initialization = SegmentTemplate.initialization;
          let r;
          let formatArray = new Array();
          let replaceArray = new Array();
          if (templateReg.test(initialization)) {
              templateReg.lastIndex = 0;
              while (r = templateReg.exec(initialization)) {
                  formatArray.push(r[0]);
                  if (r[1] === "Number") {
                      r[1] = "1";
                  }
                  else if (r[1] === "RepresentationID") {
                      r[1] = parent.id;
                  }
                  replaceArray.push(r[1]);
              }
              let index = 0;
              while (index < replaceArray.length) {
                  initialization = initialization.replace(formatArray[index], replaceArray[index]);
                  index++;
              }
          }
          parent.initializationURL = initialization;
      }
      generateMediaURL(SegmentTemplate, parent) {
          let templateReg = /\$(.+?)\$/ig;
          let media = SegmentTemplate.media;
          let r;
          let formatArray = new Array();
          let replaceArray = new Array();
          parent.mediaURL = new Array();
          if (templateReg.test(media)) {
              templateReg.lastIndex = 0;
              while (r = templateReg.exec(media)) {
                  formatArray.push(r[0]);
                  if (r[1] === "Number") {
                      r[1] = "@Number@";
                  }
                  else if (r[1] === "RepresentationID") {
                      r[1] = parent.id;
                  }
                  replaceArray.push(r[1]);
              }
          }
          let index = 0;
          while (index < replaceArray.length) {
              media = media.replace(formatArray[index], replaceArray[index]);
              index++;
          }
          for (let i = 1; i <= Math.ceil(parent.duration / parent.segmentDuration); i++) {
              let s = media;
              while (s.includes("@Number@")) {
                  s = s.replace("@Number@", `${i}`);
              }
              parent.mediaURL.push(s);
          }
      }
  }
  const factory$8 = FactoryMaker.getSingleFactory(SegmentTemplateParser);

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

  class URLUtils {
      constructor(ctx, ...args) {
          this.config = ctx.context;
      }
      setup() { }
      resolve(...urls) {
          let index = 0;
          let str = "";
          while (index < urls.length) {
              let url = urls[index];
              // 如果url不以/或者./,../这种形式开头的话
              if (/^(?!(\.|\/))/.test(url)) {
                  if (str[str.length - 1] !== '/' && str !== "") {
                      str += '/';
                  }
              }
              else if (/^\/.+/.test(url)) {
                  // 如果url以/开头
                  if (str[str.length - 1] === "/") {
                      url = url.slice(1);
                  }
              }
              else if (/^(\.).+/.test(url)) ;
              str += url;
              index++;
          }
          return str;
      }
      sliceLastURLPath(url) {
          for (let i = url.length - 1; i >= 0; i--) {
              if (url[i] === "/") {
                  return url.slice(0, i);
              }
          }
          return url;
      }
  }
  const factory$7 = FactoryMaker.getSingleFactory(URLUtils);

  class DashParser {
      constructor(ctx, ...args) {
          this.config = {};
          this.config = ctx.context;
          this.setup();
          this.initialEvent();
      }
      setup() {
          this.segmentTemplateParser = factory$8().getInstance();
          this.eventBus = factory$b().getInstance();
          this.URLUtils = factory$7().getInstance();
      }
      initialEvent() {
          this.eventBus.on(EventConstants.SOURCE_ATTACHED, this.onSourceAttached, this);
      }
      string2xml(s) {
          let parser = new DOMParser();
          return parser.parseFromString(s, "text/xml");
      }
      // 解析请求到的xml类型的文本字符串，生成MPD对象,方便后续的解析
      parse(manifest) {
          let xml = this.string2xml(manifest);
          let Mpd;
          if (this.config.override) {
              Mpd = this.parseDOMChildren("Mpd", xml);
          }
          else {
              Mpd = this.parseDOMChildren("MpdDocument", xml);
          }
          this.mergeNodeSegementTemplate(Mpd);
          this.setResolvePowerForRepresentation(Mpd);
          this.setDurationForRepresentation(Mpd);
          this.setSegmentDurationForRepresentation(Mpd);
          this.setBaseURLForMpd(Mpd);
          this.segmentTemplateParser.parse(Mpd);
          console.log(Mpd);
          return Mpd;
      }
      parseDOMChildren(name, node) {
          //如果node的类型为文档类型
          if (node.nodeType === DOMNodeTypes.DOCUMENT_NODE) {
              let result = {
                  tag: node.nodeName,
                  __children: [],
              };
              // 文档类型的节点一定只有一个子节点
              for (let index in node.childNodes) {
                  if (node.childNodes[index].nodeType === DOMNodeTypes.ELEMENT_NODE) {
                      // 如果在配置指定需要忽略根节点的话，也就是忽略MpdDocument节点
                      if (!this.config.ignoreRoot) {
                          result.__children[index] = this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                          result[node.childNodes[index].nodeName] = this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                      }
                      else {
                          return this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                      }
                  }
              }
              return result;
          }
          else if (node.nodeType === DOMNodeTypes.ELEMENT_NODE) {
              let result = {
                  tag: node.nodeName,
                  __chilren: [],
              };
              // 1.解析node的子节点
              for (let index = 0; index < node.childNodes.length; index++) {
                  let child = node.childNodes[index];
                  result.__chilren[index] = this.parseDOMChildren(child.nodeName, child);
                  if (!result[child.nodeName]) {
                      result[child.nodeName] = this.parseDOMChildren(child.nodeName, child);
                      continue;
                  }
                  if (result[child.nodeName] && !Array.isArray(result[child.nodeName])) {
                      result[child.nodeName] = [result[child.nodeName]];
                  }
                  if (result[child.nodeName]) {
                      result[child.nodeName].push(this.parseDOMChildren(child.nodeName, child));
                  }
              }
              // 2. 将node中的具有多个相同标签的子标签合并为一个数组
              for (let key in result) {
                  if (key !== "tag" && key !== "__children") {
                      result[key + "_asArray"] = Array.isArray(result[key])
                          ? [...result[key]]
                          : [result[key]];
                  }
              }
              // 3.如果该Element节点中含有text节点，则需要合并为一个整体
              result["#text_asArray"] && result["#text_asArray"].forEach(text => {
                  result.__text = result.__text || "";
                  result.__text += `${text.text}/n`;
              });
              // 4.解析node上挂载的属性
              for (let prop of node.attributes) {
                  result[prop.name] = prop.value;
              }
              return result;
          }
          else if (node.nodeType === DOMNodeTypes.TEXT_NODE) {
              return {
                  tag: "#text",
                  text: node.nodeValue
              };
          }
      }
      mergeNode(node, compare) {
          if (node[compare.tag]) {
              let target = node[`${compare.tag}_asArray`];
              target.forEach(element => {
                  for (let key in compare) {
                      if (!element.hasOwnProperty(key)) {
                          element[key] = compare[key];
                      }
                  }
              });
          }
          else {
              node[compare.tag] = compare;
              node.__children = node.__children || [];
              node.__children.push(compare);
              node[`${compare.tag}__asArray`] = [compare];
          }
      }
      mergeNodeSegementTemplate(Mpd) {
          let segmentTemplate = null;
          Mpd["Period_asArray"].forEach(Period => {
              if (Period["SegmentTemplate_asArray"]) {
                  segmentTemplate = Period["SegmentTemplate_asArray"][0];
              }
              Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                  let template = segmentTemplate;
                  if (segmentTemplate) {
                      this.mergeNode(AdaptationSet, segmentTemplate);
                  }
                  if (AdaptationSet["SegmentTemplate_asArray"]) {
                      segmentTemplate = AdaptationSet["SegmentTemplate_asArray"][0];
                  }
                  AdaptationSet["Representation_asArray"].forEach(Representation => {
                      if (segmentTemplate) {
                          this.mergeNode(Representation, segmentTemplate);
                      }
                  });
                  segmentTemplate = template;
              });
          });
      }
      setBaseURLForMpd(Mpd) {
          Mpd.baseURL = this.URLUtils.sliceLastURLPath(this.mpdURL);
      }
      //给每个Representation上挂载分辨率属性
      setResolvePowerForRepresentation(Mpd) {
          Mpd["Period_asArray"].forEach(Period => {
              Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                  if (AdaptationSet.mimeType === "video/mp4") {
                      AdaptationSet["Representation_asArray"].forEach(Representation => {
                          if (Representation.width && Representation.height) {
                              Representation.resolvePower = `${Representation.width}*${Representation.height}`;
                          }
                      });
                  }
                  else if (AdaptationSet.mimeType === "audio/mp4") {
                      AdaptationSet["Representation_asArray"].forEach(Representation => {
                          if (Representation.audioSamplingRate) {
                              Representation.resolvePower = Representation.audioSamplingRate;
                          }
                      });
                  }
              });
          });
      }
      getSegmentDuration(Mpd, streamId) {
          let Period = Mpd["Period_asArray"][streamId];
          if (!Period) {
              throw new Error("传入的流不存在");
          }
          let segmentDuration = 0;
          Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
              AdaptationSet["Representation_asArray"].forEach(Representation => {
                  if (Representation.segmentDuration) {
                      segmentDuration = Number(Representation.segmentDuration);
                  }
              });
          });
          return segmentDuration;
      }
      getTotalDuration(Mpd) {
          let totalDuration = 0;
          let MpdDuration = -1;
          if (Mpd.mediaPresentationDuration) {
              MpdDuration = switchToSeconds(parseDuration(Mpd.mediaPresentationDuration));
          }
          // MPD文件的总时间要么是由Mpd标签上的availabilityStartTime指定，要么是每一个Period上的duration之和
          if (MpdDuration < 0) {
              Mpd.forEach(Period => {
                  if (Period.duration) {
                      totalDuration += switchToSeconds(parseDuration(Period.duration));
                  }
                  else {
                      throw new Error("MPD文件格式错误");
                  }
              });
          }
          else {
              totalDuration = MpdDuration;
          }
          return totalDuration;
      }
      // 给每一个Representation对象上挂载duration属性，此处的duration指的是Representation所属的Period所代表的媒体的总时长
      setDurationForRepresentation(Mpd) {
          //1. 如果只有一个Period
          if (Mpd["Period_asArray"].length === 1) {
              let totalDuration = this.getTotalDuration(Mpd);
              Mpd["Period_asArray"].forEach(Period => {
                  Period.duration = Period.duration || totalDuration;
                  Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                      AdaptationSet.duration = totalDuration;
                      AdaptationSet["Representation_asArray"].forEach(Representation => {
                          Representation.duration = totalDuration;
                      });
                  });
              });
          }
          else {
              Mpd["Period_asArray"].forEach(Period => {
                  if (!Period.duration) {
                      throw new Error("MPD文件格式错误");
                  }
                  let duration = Period.duration;
                  Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                      AdaptationSet.duration = duration;
                      AdaptationSet["Representation_asArray"].forEach(Representation => {
                          Representation.duration = duration;
                      });
                  });
              });
          }
      }
      // 给每一个Rpresentation对象上挂载segmentDuration属性，用来标识该Representation每一个Segment的时长
      setSegmentDurationForRepresentation(Mpd) {
          let maxSegmentDuration = switchToSeconds(parseDuration(Mpd.maxSegmentDuration));
          Mpd["Period_asArray"].forEach(Period => {
              Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                  AdaptationSet["Representation_asArray"].forEach(Representation => {
                      if (Representation["SegmentTemplate"]) {
                          if (Representation["SegmentTemplate"].duration) {
                              let duration = Representation["SegmentTemplate"].duration;
                              let timescale = Representation["SegmentTemplate"].timescale || 1;
                              Representation.segmentDuration = (duration / timescale).toFixed(1);
                          }
                          else {
                              if (maxSegmentDuration) {
                                  Representation.segmentDuration = maxSegmentDuration;
                              }
                              else {
                                  throw new Error("MPD文件格式错误");
                              }
                          }
                      }
                  });
              });
          });
      }
      onSourceAttached(url) {
          this.mpdURL = url;
      }
  }
  const factory$6 = FactoryMaker.getSingleFactory(DashParser);

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  class URLNode {
      constructor(url) {
          this.children = [];
          this.url = url || null;
      }
      setChild(index, child) {
          this.children[index] = child;
      }
      getChild(index) {
          return this.children[index];
      }
  }
  class BaseURLParser {
      constructor(ctx, ...args) {
          this.config = {};
          this.config = ctx.context;
          this.setup();
      }
      setup() { }
      parseManifestForBaseURL(manifest) {
          let root = new URLNode(null);
          //1. 首先遍历每一个Period，规定BaseURL节点只可能出现在Period,AdaptationSet,Representation中
          manifest["Period_asArray"].forEach((p, pId) => {
              let url = null;
              if (p["BaseURL_asArray"]) {
                  url = p["BaseURL_asArray"][0];
              }
              let periodNode = new URLNode(url);
              root.setChild(pId, periodNode);
              p["AdaptationSet_asArray"].forEach((a, aId) => {
                  let url = null;
                  if (a["BaseURL_asArray"]) {
                      url = a["BaseURL_asArray"][0];
                  }
                  let adaptationSetNode = new URLNode(url);
                  periodNode.setChild(aId, adaptationSetNode);
                  a["Representation_asArray"].forEach((r, rId) => {
                      let url = null;
                      if (r["BaseURL_asArray"]) {
                          url = r["BaseURL_asArray"][0];
                      }
                      let representationNode = new URLNode(url);
                      adaptationSetNode.setChild(rId, representationNode);
                  });
              });
          });
          return root;
      }
      getBaseURLByPath(path, urlNode) {
          let baseURL = "";
          let root = urlNode;
          for (let i = 0; i < path.length; i++) {
              if (path[i] >= root.children.length || path[i] < 0) {
                  throw new Error("传入的路径不正确");
              }
              if (root.children[path[i]].url) {
                  baseURL += root.children[path[i]].url;
              }
              root = root.children[path[i]];
          }
          if (root.children.length > 0) {
              throw new Error("传入的路径不正确");
          }
          return baseURL;
      }
  }
  const factory$5 = FactoryMaker.getSingleFactory(BaseURLParser);

  class TimeRangeUtils {
      constructor(ctx, ...args) {
          this.config = {};
          this.config = ctx.context;
          this.setup();
      }
      setup() {
          this.dashParser = factory$6().getInstance();
      }
      /**
       * @description 返回特定stream之前的所有stream的时间总和
       * @param streamId
       * @param Mpd
       * @returns {number} Number
       */
      getSummaryTimeBeforeStream(streamId, Mpd) {
          if (streamId === 0)
              return 0;
          let Period = Mpd["Period_asArray"];
          let sum = 0;
          for (let i = 0; i < streamId; i++) {
              sum += Period[i].duration;
          }
          return sum;
      }
      getOffestTimeOfMediaSegment(streamId, mediaId, Mpd) {
          let beforeTime = this.getSummaryTimeBeforeStream(streamId, Mpd);
          let segmentDuration = this.dashParser.getSegmentDuration(Mpd, streamId);
          return beforeTime + segmentDuration * (mediaId + 1);
      }
      inVideoBuffered(time, ranges) {
          for (let range of ranges) {
              if (time >= range.start && time <= range.end)
                  return true;
          }
          return false;
      }
      inSpecificStreamRange(streamId, currentTime, Mpd) {
          let totalTime = this.dashParser.getTotalDuration(Mpd);
          if (currentTime > totalTime)
              return false;
          let start = this.getSummaryTimeBeforeStream(streamId, Mpd);
          let end = start + Mpd["Period_asArray"][streamId].duration;
          if (currentTime < start || currentTime > end)
              return false;
          return true;
      }
      getSegmentAndStreamIndexByTime(streamId, currentTime, Mpd) {
          if (this.inSpecificStreamRange(streamId, currentTime, Mpd)) {
              let segmentDuration = this.dashParser.getSegmentDuration(Mpd, streamId);
              let index = Math.floor(currentTime / segmentDuration);
              return [streamId, index];
          }
          else {
              let totalTime = this.dashParser.getTotalDuration(Mpd);
              if (currentTime > totalTime) {
                  throw new Error("传入的当前时间大于媒体的总时长");
              }
              let sum = 0;
              for (let i = 0; i < Mpd["Period_asArray"].length; i++) {
                  let Period = Mpd["Period_asArray"][i];
                  sum += Period.duration;
                  if (sum > currentTime) {
                      let segmentDuration = this.dashParser.getSegmentDuration(Mpd, i);
                      let index = Math.floor(currentTime / segmentDuration);
                      return [i, index];
                  }
              }
          }
      }
  }
  const factory$4 = FactoryMaker.getSingleFactory(TimeRangeUtils);

  class StreamController {
      constructor(ctx, ...args) {
          this.config = {};
          // 音视频的分辨率
          this.videoResolvePower = "1920*1080";
          this.audioResolvePower = "48000";
          // 和索引相关的变量
          this.mediaId = 0;
          this.streamId = 0;
          this.config = ctx.context;
          this.firstRequestNumber = this.config.num || 23;
          this.setup();
          this.initialEvent();
      }
      setup() {
          this.baseURLParser = factory$5().getInstance();
          this.URLUtils = factory$7().getInstance();
          this.eventBus = factory$b().getInstance();
          this.urlLoader = factory$9().getInstance();
          this.timeRangeUtils = factory$4().getInstance();
      }
      initialEvent() {
          this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED, this.onManifestParseCompleted, this);
          this.eventBus.on(EventConstants.SEGMENT_CONSUMED, this.onSegmentConsumed, this);
          this.eventBus.on(EventConstants.SEGEMTN_REQUEST, this.onSegmentRequest, this);
      }
      onManifestParseCompleted(mainifest) {
          this.segmentRequestStruct = this.generateSegmentRequestStruct(mainifest);
          this.Mpd = mainifest;
          this.startStream(mainifest);
      }
      generateBaseURLPath(Mpd) {
          this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(Mpd);
      }
      generateSegmentRequestStruct(Mpd) {
          this.generateBaseURLPath(Mpd);
          let baseURL = Mpd["baseURL"] || "";
          let mpdSegmentRequest = {
              type: "MpdSegmentRequest",
              request: []
          };
          for (let i = 0; i < Mpd["Period_asArray"].length; i++) {
              let Period = Mpd["Period_asArray"][i];
              let periodSegmentRequest = {
                  VideoSegmentRequest: [],
                  AudioSegmentRequest: []
              };
              for (let j = 0; j < Period["AdaptationSet_asArray"].length; j++) {
                  let AdaptationSet = Period["AdaptationSet_asArray"][j];
                  let res = this.generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet, baseURL, i, j);
                  if (AdaptationSet.mimeType === "video/mp4") {
                      periodSegmentRequest.VideoSegmentRequest.push({
                          type: "video",
                          video: res
                      });
                  }
                  else if (AdaptationSet.mimeType === "audio/mp4") {
                      periodSegmentRequest.AudioSegmentRequest.push({
                          lang: AdaptationSet.lang || "en",
                          audio: res
                      });
                  }
              }
              mpdSegmentRequest.request.push(periodSegmentRequest);
          }
          return mpdSegmentRequest;
      }
      generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet, baseURL, i, j) {
          let res = {};
          for (let k = 0; k < AdaptationSet["Representation_asArray"].length; k++) {
              let Representation = AdaptationSet["Representation_asArray"][k];
              let url = this.URLUtils.
                  resolve(baseURL, this.baseURLParser.getBaseURLByPath([i, j, k], this.baseURLPath));
              res[Representation.resolvePower] = [];
              res[Representation.resolvePower].push(this.URLUtils.resolve(url, Representation.initializationURL));
              res[Representation.resolvePower].push(Representation.mediaURL.map(item => {
                  return this.URLUtils.resolve(url, item);
              }));
          }
          return res;
      }
      getNumberOfMediaSegmentForPeriod(streamId) {
          return this.segmentRequestStruct.request[this.streamId].VideoSegmentRequest[0].video[this.videoResolvePower][1].length;
      }
      //初始化播放流，一次至多加载23个Segement过来
      startStream(Mpd) {
          return __awaiter(this, void 0, void 0, function* () {
              Mpd["Period_asArray"][this.streamId];
              let ires = yield this.loadInitialSegment(this.streamId);
              this.eventBus.trigger(EventConstants.SEGEMTN_LOADED, { data: ires, streamId: this.streamId });
              let number = this.getNumberOfMediaSegmentForPeriod(this.streamId);
              for (let i = 0; i < (number >= this.firstRequestNumber ? this.firstRequestNumber : number); i++) {
                  let mres = yield this.loadMediaSegment();
                  this.mediaId++;
                  this.eventBus.trigger(EventConstants.SEGEMTN_LOADED, { data: mres, streamId: this.streamId, mediaId: this.mediaId });
              }
          });
      }
      /**
       * @description 只有在触发seek事件后才会触发此方法
       * @param tuple
       */
      onSegmentRequest(tuple) {
          return __awaiter(this, void 0, void 0, function* () {
              // 如果此时video发生缓存内容之外的跳转，则需要重新请求对应的segment，因此需要中断正在发送还没有收到结果的请求
              this.abortAllXHR();
              let [streamId, mediaId] = tuple;
              this.streamId = streamId;
              this.mediaId = mediaId;
              let mres = yield this.loadMediaSegment();
              this.eventBus.trigger(EventConstants.SEGEMTN_LOADED, { data: mres, streamId: this.streamId, mediaId: mediaId });
          });
      }
      //播放器消费一个Segment我就继续请求一个Segment
      onSegmentConsumed(range) {
          return __awaiter(this, void 0, void 0, function* () {
              if (!this.segmentRequestStruct.request[this.streamId])
                  return;
              let total = this.getNumberOfMediaSegmentForPeriod(this.streamId);
              if (this.mediaId >= total) {
                  this.mediaId = 0;
                  this.streamId++;
              }
              else {
                  this.mediaId++;
              }
              if (this.segmentRequestStruct.request[this.streamId] === undefined) {
                  this.eventBus.trigger(EventConstants.MEDIA_PLAYBACK_FINISHED);
              }
              else {
                  let time = this.timeRangeUtils.getOffestTimeOfMediaSegment(this.streamId, this.mediaId, this.Mpd);
                  console.log(time, range);
                  if (!this.timeRangeUtils.inVideoBuffered(time, range)) {
                      let mres = yield this.loadMediaSegment();
                      this.eventBus.trigger(EventConstants.SEGEMTN_LOADED, { data: mres, streamId: this.streamId, mediaId: this.mediaId });
                  }
              }
          });
      }
      //此处的streamId标识具体的Period对象
      loadInitialSegment(streamId) {
          let stream = this.segmentRequestStruct.request[this.streamId];
          // 先默认选择音视频的第一个版本
          let audioRequest = stream.AudioSegmentRequest[0].audio;
          let videoRequest = stream.VideoSegmentRequest[0].video;
          return this.loadSegment(videoRequest[this.videoResolvePower][0], audioRequest[this.audioResolvePower][0]);
      }
      loadMediaSegment() {
          let stream = this.segmentRequestStruct.request[this.streamId];
          // 先默认选择音视频的第一个版本
          let audioRequest = stream.AudioSegmentRequest[0].audio;
          let videoRequest = stream.VideoSegmentRequest[0].video;
          return this.
              loadSegment(videoRequest[this.videoResolvePower][1][this.mediaId], audioRequest[this.audioResolvePower][1][this.mediaId]);
      }
      loadSegment(videoURL, audioURL) {
          let p1 = this.urlLoader.load({ url: videoURL, responseType: "arraybuffer" }, "Segment");
          let p2 = this.urlLoader.load({ url: audioURL, responseType: "arraybuffer" }, "Segment");
          return Promise.all([p1, p2]);
      }
      abortAllXHR() {
          this.urlLoader.abortAllXHR();
      }
  }
  const factory$3 = FactoryMaker.getClassFactory(StreamController);

  class MediaPlayerBuffer {
      constructor(ctx, ...args) {
          this.config = {};
          this.arrayBuffer = new Array();
          this.config = ctx.context;
      }
      push(buffer) {
          this.arrayBuffer.push(buffer);
      }
      clear() {
          this.arrayBuffer = [];
      }
      isEmpty() {
          return this.arrayBuffer.length === 0;
      }
      delete(buffer) {
          if (this.arrayBuffer.includes(buffer)) {
              let index = this.arrayBuffer.indexOf(buffer);
              this.arrayBuffer.splice(index, 1);
          }
      }
      top() {
          return this.arrayBuffer[0] || null;
      }
      pop() {
          this.arrayBuffer.length && this.arrayBuffer.pop();
      }
  }
  const factory$2 = FactoryMaker.getSingleFactory(MediaPlayerBuffer);

  class MediaPlayerController {
      constructor(ctx, ...args) {
          // 控制器
          this.config = {};
          // 属性
          this.isFirstRequestCompleted = false;
          this.mediaDuration = 0;
          this.currentStreamId = 0;
          this.config = ctx.context;
          if (this.config.video) {
              this.video = this.config.video;
          }
          this.setup();
          this.initEvent();
          this.initPlayer();
      }
      setup() {
          this.mediaSource = new MediaSource();
          this.buffer = factory$2().getInstance();
          this.eventBus = factory$b().getInstance();
          this.timeRangeUtils = factory$4().getInstance();
      }
      initEvent() {
          this.eventBus.on(EventConstants.BUFFER_APPENDED, (id) => {
              if (!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
                  console.log("append");
                  this.appendSource();
                  this.currentStreamId = id;
              }
          }, this);
          this.eventBus.on(EventConstants.FIRST_REQUEST_COMPLETED, () => {
              this.isFirstRequestCompleted = true;
          }, this);
          this.eventBus.on(EventConstants.MEDIA_PLAYBACK_FINISHED, this.onMediaPlaybackFinished, this);
          this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED, (manifest, duration, Mpd) => {
              this.mediaDuration = duration;
              this.Mpd = Mpd;
              if (this.mediaSource.readyState === "open") {
                  this.setMediaSource();
              }
          }, this);
      }
      initPlayer() {
          this.video.src = window.URL.createObjectURL(this.mediaSource);
          this.mediaSource.addEventListener("sourceopen", this.onSourceopen.bind(this));
          this.video.addEventListener("seeking", this.onMediaSeeking.bind(this));
      }
      /**
       * @description 配置MediaSource的相关选项和属性
       */
      setMediaSource() {
          this.mediaSource.duration = this.mediaDuration;
          this.mediaSource.setLiveSeekableRange(0, this.mediaDuration);
      }
      getVideoBuffered(video) {
          let buffer = this.video.buffered;
          let res = [];
          for (let i = 0; i < buffer.length; i++) {
              let start = buffer.start(i);
              let end = buffer.end(i);
              res.push({ start, end });
          }
          return res;
      }
      appendSource() {
          let data = this.buffer.top();
          if (data) {
              this.buffer.delete(data);
              this.appendVideoSource(data.video);
              this.appendAudioSource(data.audio);
          }
      }
      appendVideoSource(data) {
          this.videoSourceBuffer.appendBuffer(new Uint8Array(data));
      }
      appendAudioSource(data) {
          this.audioSourceBuffer.appendBuffer(new Uint8Array(data));
      }
      /**
       * @description 当进度条发生跳转时触发
       * @param { EventTarget} e
       */
      onMediaSeeking(e) {
          let currentTime = this.video.currentTime;
          let [streamId, mediaId] = this.timeRangeUtils.
              getSegmentAndStreamIndexByTime(this.currentStreamId, currentTime, this.Mpd);
          let ranges = this.getVideoBuffered(this.video);
          if (!this.timeRangeUtils.inVideoBuffered(currentTime, ranges)) {
              console.log("超出缓存范围");
              this.buffer.clear();
              this.eventBus.trigger(EventConstants.SEGEMTN_REQUEST, [streamId, mediaId]);
          }
          else {
              console.log("在缓存范围之内");
          }
      }
      onSourceopen(e) {
          this.videoSourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E"');
          this.audioSourceBuffer = this.mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
          this.videoSourceBuffer.addEventListener("updateend", this.onUpdateend.bind(this));
          this.audioSourceBuffer.addEventListener("updateend", this.onUpdateend.bind(this));
      }
      onUpdateend() {
          if (!this.videoSourceBuffer.updating && !this.audioSourceBuffer.updating) {
              if (this.isFirstRequestCompleted) {
                  let ranges = this.getVideoBuffered(this.video);
                  this.eventBus.trigger(EventConstants.SEGMENT_CONSUMED, ranges);
              }
              this.appendSource();
          }
      }
      onMediaPlaybackFinished() {
          // this.mediaSource.endOfStream();
          window.URL.revokeObjectURL(this.video.src);
          console.log("播放流加载结束");
      }
  }
  const factory$1 = FactoryMaker.getClassFactory(MediaPlayerController);

  /**
   * @description 整个dash处理流程的入口类MediaPlayer,类似于项目的中转中心，用于接收任务并且将任务分配给不同的解析器去完成
   */
  class MediaPlayer {
      constructor(ctx, ...args) {
          // 私有属性
          this.config = {};
          this.firstCurrentRequest = 0;
          // 当前视频流的具体ID，也就是在请求第几个Period媒体片段
          this.currentStreamId = 0;
          // 媒体的总时长 -- duration
          this.duration = 0;
          this.config = ctx.context;
          this.setup();
          this.initializeEvent();
      }
      //初始化类
      setup() {
          this.urlLoader = factory$9().getInstance();
          this.eventBus = factory$b().getInstance();
          // ignoreRoot -> 忽略Document节点，从MPD开始作为根节点
          this.dashParser = factory$6({ ignoreRoot: true }).getInstance();
          this.streamController = factory$3({ num: 23 }).create();
          this.buffer = factory$2().getInstance();
      }
      initializeEvent() {
          this.eventBus.on(EventConstants.MANIFEST_LOADED, this.onManifestLoaded, this);
          this.eventBus.on(EventConstants.SEGEMTN_LOADED, this.onSegmentLoaded, this);
      }
      resetEvent() {
          this.eventBus.off(EventConstants.MANIFEST_LOADED, this.onManifestLoaded, this);
          this.eventBus.off(EventConstants.SEGEMTN_LOADED, this.onSegmentLoaded, this);
      }
      //MPD文件请求成功获得对应的data数据
      onManifestLoaded(data) {
          let manifest = this.dashParser.parse(data);
          this.duration = this.dashParser.getTotalDuration(manifest);
          this.eventBus.
              trigger(EventConstants.MANIFEST_PARSE_COMPLETED, manifest, this.duration, manifest);
      }
      onSegmentLoaded(res) {
          console.log("加载Segment成功", res.mediaId);
          this.firstCurrentRequest++;
          if (this.firstCurrentRequest === 23) {
              this.eventBus.trigger(EventConstants.FIRST_REQUEST_COMPLETED);
          }
          let data = res.data;
          let id = res.streamId;
          let videoBuffer = data[0];
          let audioBuffer = data[1];
          this.currentStreamId = id;
          this.buffer.push({
              video: videoBuffer,
              audio: audioBuffer,
              streamId: res.streamId
          });
          this.eventBus.trigger(EventConstants.BUFFER_APPENDED, this.currentStreamId);
      }
      /**
       * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
       * @param url
       */
      attachSource(url) {
          this.eventBus.trigger(EventConstants.SOURCE_ATTACHED, url);
          this.urlLoader.load({ url, responseType: "text" }, "Manifest");
      }
      /**
       * @description 让MediaPlayer类去接管传入的video dom元素
       * @param video
       */
      attachVideo(video) {
          this.video = video;
          this.mediaPlayerController = factory$1({ video: video, duration: this.duration }).create();
      }
  }
  const factory = FactoryMaker.getClassFactory(MediaPlayer);

  class Player extends Component {
      constructor(options) {
          super(options.container, "div.video-wrapper");
          this.id = "Player";
          // 播放器的默认配置
          this.playerOptions = {
              url: "",
              container: document.body,
              autoplay: false,
              width: "100%",
              height: "100%",
          };
          this.playerOptions = Object.assign(this.playerOptions, options);
          options.container.className = "video-container";
          options.container.style.width = this.playerOptions.width;
          options.container.style.height = this.playerOptions.height;
          this.container = options.container;
          this.init();
      }
      init() {
          this.video = $("video");
          this.el.appendChild(this.video);
          this.toolBar = new ToolBar(this, this.el, "div");
          this.attendSource(this.playerOptions.url);
          this.initEvent();
          this.initPlugin();
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
      initPlugin() {
          if (this.playerOptions.plugins) {
              this.playerOptions.plugins.forEach(plugin => {
                  this.use(plugin);
              });
          }
      }
      initMp4Player(url) {
      }
      initMpdPlayer(url) {
          let player = factory().create();
          player.attachVideo(this.video);
          player.attachSource(url);
      }
      attendSource(url) {
          switch (getFileExtension(url)) {
              case "mp4":
              case "mp3":
                  this.initMp4Player(url);
              case "mpd":
                  this.initMpdPlayer(url);
              // ToDo
          }
      }
      registerControls(id, component) {
          let store = CONTROL_COMPONENT_STORE;
          console.log(store, id);
          if (store.has(id)) {
              if (component.replaceElementType) {
                  patchComponent(store.get(id), component, { replaceElementType: component.replaceElementType });
              }
              else {
                  patchComponent(store.get(id), component);
              }
          }
          else {
              // 如果该组件实例是用户自创的话
              if (!component.el)
                  throw new Error(`传入的原创组件${id}没有对应的DOM元素`);
              this.toolBar.controller.settings.appendChild(component.el);
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
  exports.BufferedProgress = BufferedProgress;
  exports.CompletedProgress = CompletedProgress;
  exports.Controller = Controller;
  exports.Dot = Dot;
  exports.FullScreen = FullScreen;
  exports.Options = Options;
  exports.PlayButton = PlayButton;
  exports.Player = Player;
  exports.Playrate = Playrate;
  exports.Progress = Progress;
  exports.ToolBar = ToolBar;
  exports.Volume = Volume;
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

  Object.defineProperty(exports, '__esModule', { value: true });

}));
