'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('loading-mask.less');

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

function getFileExtension(file) {
    let name;
    if (typeof file === "string") {
        name = file;
    }
    else {
        name = file.name;
    }
    for (let i = name.length - 1; i >= 0; i--) {
        if (name[i] === ".") {
            return name.slice(i + 1, name.length);
        }
    }
    return null;
}

class Mp4Player {
    constructor(player) {
        this.player = player;
        this.player.video.src = this.player.playerOptions.url;
        this.initEvent();
    }
    initEvent() {
        this.player.toolbar.emit("mounted");
        this.player.emit("mounted", this);
        this.player.container.onclick = (e) => {
            if (e.target == this.player.video) {
                if (this.player.video.paused) {
                    this.player.video.play();
                }
                else if (this.player.video.played) {
                    this.player.video.pause();
                }
            }
        };
        this.player.container.addEventListener("mouseenter", (e) => {
            this.player.toolbar.emit("showtoolbar", e);
        });
        this.player.container.addEventListener("mousemove", (e) => {
            this.player.toolbar.emit("showtoolbar", e);
        });
        this.player.container.addEventListener("mouseleave", (e) => {
            this.player.toolbar.emit("hidetoolbar");
        });
        this.player.video.addEventListener("loadedmetadata", (e) => {
            this.player.playerOptions.autoplay && this.player.video.play();
            this.player.toolbar.emit("loadedmetadata", this.player.video.duration);
        });
        this.player.video.addEventListener("timeupdate", (e) => {
            this.player.toolbar.emit("timeupdate", this.player.video.currentTime);
        });
        // 当视频可以再次播放的时候就移除loading和error的mask，通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
        this.player.video.addEventListener("play", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.toolbar.emit("play");
        });
        this.player.video.addEventListener("pause", (e) => {
            this.player.toolbar.emit("pause");
        });
        this.player.video.addEventListener("waiting", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.loadingMask.addLoadingMask();
        });
        //当浏览器请求视频发生错误的时候
        this.player.video.addEventListener("stalled", (e) => {
            console.log("视频加载发生错误");
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.errorMask.addErrorMask();
        });
        this.player.video.addEventListener("error", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.errorMask.addErrorMask();
        });
        this.player.video.addEventListener("abort", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.errorMask.addErrorMask();
        });
    }
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
    attachVideo(video) {
        this.video = video;
        this.mediaPlayerController = factory$1({ video: video, duration: this.duration }).create();
    }
}
const factory = FactoryMaker.getClassFactory(MediaPlayer);

class MpdPlayer {
    constructor(player) {
        let mediaPlayer = factory().create();
        mediaPlayer.attachSource(player.playerOptions.url);
        mediaPlayer.attachVideo(player.video);
        player.video.controls = true;
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
        this.init();
        this.initComponent();
        this.initContainer();
        if (getFileExtension(this.playerOptions.url) === "mp4") {
            new Mp4Player(this);
        }
        else if (getFileExtension(this.playerOptions.url) === "mpd") {
            new MpdPlayer(this);
        }
    }
    init() {
        let container = this.playerOptions.container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container;
    }
    /**
     * @description 初始化播放器上的各种组件实例
     */
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
        <video></video>
      </div>
    `;
        this.container.appendChild(this.toolbar.template);
        this.video = this.container.querySelector("video");
        this.video.height = this.container.clientHeight;
        this.video.width = this.container.clientWidth;
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

const televisionSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);">
<defs>
  <clipPath id="__lottie_element_55">
    <rect width="18" height="18" x="0" y="0"></rect>
  </clipPath>
</defs>
<g clip-path="url(#__lottie_element_55)">
  <g transform="matrix(0.9883429408073425,-0.7275781631469727,0.6775955557823181,0.920446515083313,7.3224687576293945,-0.7606706619262695)" opacity="1" style="display: block;">
    <g opacity="1" transform="matrix(0.9937776327133179,-0.11138220876455307,0.11138220876455307,0.9937776327133179,-2.5239999294281006,1.3849999904632568)">
      <path fill="rgb(51,51,51)" fill-opacity="1" d=" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z">
      </path>
    </g>
  </g>
  <g transform="matrix(1.1436611413955688,0.7535901665687561,-0.6317168474197388,0.9587040543556213,16.0070743560791,2.902894973754883)" opacity="1" style="display: block;">
    <g opacity="1" transform="matrix(0.992861807346344,0.1192704513669014,-0.1192704513669014,0.992861807346344,-2.5239999294281006,1.3849999904632568)">
      <path fill="rgb(51,51,51)" fill-opacity="1" d=" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z">
      </path>
    </g>
  </g>
  <g transform="matrix(1,0,0,1,8.890999794006348,8.406000137329102)" opacity="1" style="display: block;">
    <g opacity="1" transform="matrix(1,0,0,1,0.09099999815225601,1.1009999513626099)">
      <path fill="rgb(255,255,255)" fill-opacity="1" d=" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z">
      </path>
      <path stroke-linecap="butt" stroke-linejoin="miter" fill-opacity="0" stroke-miterlimit="4" stroke="rgb(51,51,51)" stroke-opacity="1" stroke-width="1.5" d=" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z">
      </path>
    </g>
  </g>
  <g transform="matrix(1,0,0,1,8.89900016784668,8.083999633789062)" opacity="1" style="display: block;">
    <g opacity="1" transform="matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)">
      <path fill="rgb(51,51,51)" fill-opacity="1" d=" M0.875,-1.125 C0.875,-1.125 0.875,1.125 0.875,1.125 C0.875,1.607912540435791 0.48291251063346863,2 0,2 C0,2 0,2 0,2 C-0.48291251063346863,2 -0.875,1.607912540435791 -0.875,1.125 C-0.875,1.125 -0.875,-1.125 -0.875,-1.125 C-0.875,-1.607912540435791 -0.48291251063346863,-2 0,-2 C0,-2 0,-2 0,-2 C0.48291251063346863,-2 0.875,-1.607912540435791 0.875,-1.125z">
      </path>
    </g>
  </g>
  <g transform="matrix(1,0,0,1,14.008999824523926,8.083999633789062)" opacity="1" style="display: block;">
    <g opacity="1" transform="matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)">
      <path fill="rgb(51,51,51)" fill-opacity="1" d=" M0.8999999761581421,-1.100000023841858 C0.8999999761581421,-1.100000023841858 0.8999999761581421,1.100000023841858 0.8999999761581421,1.100000023841858 C0.8999999761581421,1.596709966659546 0.4967099726200104,2 0,2 C0,2 0,2 0,2 C-0.4967099726200104,2 -0.8999999761581421,1.596709966659546 -0.8999999761581421,1.100000023841858 C-0.8999999761581421,1.100000023841858 -0.8999999761581421,-1.100000023841858 -0.8999999761581421,-1.100000023841858 C-0.8999999761581421,-1.596709966659546 -0.4967099726200104,-2 0,-2 C0,-2 0,-2 0,-2 C0.4967099726200104,-2 0.8999999761581421,-1.596709966659546 0.8999999761581421,-1.100000023841858z">
      </path>
    </g>
  </g>
</g>
</svg>`;

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
            <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}">
              ${televisionSVG}
            </div>
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

const volumeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);">
    <defs>
        <clipPath id="__lottie_element_94">
            <rect width="88" height="88" x="0" y="0"></rect>
        </clipPath>
        <clipPath id="__lottie_element_96">
            <path d="M0,0 L88,0 L88,88 L0,88z"></path>
        </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_94)">
        <g clip-path="url(#__lottie_element_96)" transform="matrix(1,0,0,1,0,0)" opacity="1" style="display: block;">
            <g transform="matrix(1,0,0,1,28,44)" opacity="1" style="display: block;">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M15.5600004196167,-25.089000701904297 C15.850000381469727,-24.729000091552734 16,-24.288999557495117 16,-23.839000701904297 C16,-23.839000701904297 16,23.840999603271484 16,23.840999603271484 C16,24.94099998474121 15.100000381469727,25.840999603271484 14,25.840999603271484 C13.550000190734863,25.840999603271484 13.109999656677246,25.680999755859375 12.75,25.400999069213867 C12.75,25.400999069213867 -4,12.00100040435791 -4,12.00100040435791 C-4,12.00100040435791 -8,12.00100040435791 -8,12.00100040435791 C-12.420000076293945,12.00100040435791 -16,8.420999526977539 -16,4.000999927520752 C-16,4.000999927520752 -16,-3.999000072479248 -16,-3.999000072479248 C-16,-8.418999671936035 -12.420000076293945,-11.99899959564209 -8,-11.99899959564209 C-8,-11.99899959564209 -4,-11.99899959564209 -4,-11.99899959564209 C-4,-11.99899959564209 12.75,-25.39900016784668 12.75,-25.39900016784668 C13.609999656677246,-26.089000701904297 14.869999885559082,-25.948999404907227 15.5600004196167,-25.089000701904297z">
                    </path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.0111862421035767,0,0,1.0111862421035767,56.07423400878906,44.00048828125)" opacity="0.003817207883531637">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4,-13.859000205993652 C0.7799999713897705,-11.08899974822998 4,-5.919000148773193 4,0.0010000000474974513 C4,5.921000003814697 0.7799999713897705,11.090999603271484 -4,13.861000061035156 C-4,13.861000061035156 -4,-13.859000205993652 -4,-13.859000205993652z"></path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.0126574039459229,0,0,1.0126574039459229,64.37825012207031,44.0057487487793)" opacity="0.05925115693762535">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-6.236000061035156,-28.895999908447266 C4.803999900817871,-23.615999221801758 11.984000205993652,-12.456000328063965 11.984000205993652,-0.006000000052154064 C11.984000205993652,12.454000473022461 4.794000148773193,23.624000549316406 -6.265999794006348,28.893999099731445 C-8.255999565124512,29.8439998626709 -10.645999908447266,29.003999710083008 -11.595999717712402,27.003999710083008 C-12.545999526977539,25.013999938964844 -11.696000099182129,22.624000549316406 -9.706000328063965,21.673999786376953 C-1.406000018119812,17.724000930786133 3.9839999675750732,9.343999862670898 3.9839999675750732,-0.006000000052154064 C3.9839999675750732,-9.345999717712402 -1.3960000276565552,-17.715999603271484 -9.675999641418457,-21.676000595092773 C-11.675999641418457,-22.625999450683594 -12.515999794006348,-25.016000747680664 -11.565999984741211,-27.006000518798828 C-10.616000175476074,-29.006000518798828 -8.22599983215332,-29.84600067138672 -6.236000061035156,-28.895999908447266z">
                    </path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.000218152999878,0,0,1.000218152999878,56.002994537353516,44)" opacity="1">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4,-13.859000205993652 C0.7799999713897705,-11.08899974822998 4,-5.919000148773193 4,0.0010000000474974513 C4,5.921000003814697 0.7799999713897705,11.090999603271484 -4,13.861000061035156 C-4,13.861000061035156 -4,-13.859000205993652 -4,-13.859000205993652z">
                    </path>
                </g>
            </g>
            <g style="display: none;" transform="matrix(1.0002059936523438,0,0,1.0002059936523438,64.00399780273438,44.00699996948242)" opacity="1">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-6.236000061035156,-28.895999908447266 C4.803999900817871,-23.615999221801758 11.984000205993652,-12.456000328063965 11.984000205993652,-0.006000000052154064 C11.984000205993652,12.454000473022461 4.794000148773193,23.624000549316406 -6.265999794006348,28.893999099731445 C-8.255999565124512,29.8439998626709 -10.645999908447266,29.003999710083008 -11.595999717712402,27.003999710083008 C-12.545999526977539,25.013999938964844 -11.696000099182129,22.624000549316406 -9.706000328063965,21.673999786376953 C-1.406000018119812,17.724000930786133 3.9839999675750732,9.343999862670898 3.9839999675750732,-0.006000000052154064 C3.9839999675750732,-9.345999717712402 -1.3960000276565552,-17.715999603271484 -9.675999641418457,-21.676000595092773 C-11.675999641418457,-22.625999450683594 -12.515999794006348,-25.016000747680664 -11.565999984741211,-27.006000518798828 C-10.616000175476074,-29.006000518798828 -8.22599983215332,-29.84600067138672 -6.236000061035156,-28.895999908447266z">
                    </path>
                </g>
            </g>
            <g transform="matrix(0.9999999403953552,0,0,0.9999999403953552,56,44)" opacity="1" style="display: block;">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4,-13.859000205993652 C0.7799999713897705,-11.08899974822998 4,-5.919000148773193 4,0.0010000000474974513 C4,5.921000003814697 0.7799999713897705,11.090999603271484 -4,13.861000061035156 C-4,13.861000061035156 -4,-13.859000205993652 -4,-13.859000205993652z">
                    </path>
                </g>
            </g>
            <g transform="matrix(0.9999999403953552,0,0,0.9999999403953552,64.01399993896484,44.00699996948242)" opacity="1" style="display: block;">
                <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M-6.236000061035156,-28.895999908447266 C4.803999900817871,-23.615999221801758 11.984000205993652,-12.456000328063965 11.984000205993652,-0.006000000052154064 C11.984000205993652,12.454000473022461 4.794000148773193,23.624000549316406 -6.265999794006348,28.893999099731445 C-8.255999565124512,29.8439998626709 -10.645999908447266,29.003999710083008 -11.595999717712402,27.003999710083008 C-12.545999526977539,25.013999938964844 -11.696000099182129,22.624000549316406 -9.706000328063965,21.673999786376953 C-1.406000018119812,17.724000930786133 3.9839999675750732,9.343999862670898 3.9839999675750732,-0.006000000052154064 C3.9839999675750732,-9.345999717712402 -1.3960000276565552,-17.715999603271484 -9.675999641418457,-21.676000595092773 C-11.675999641418457,-22.625999450683594 -12.515999794006348,-25.016000747680664 -11.565999984741211,-27.006000518798828 C-10.616000175476074,-29.006000518798828 -8.22599983215332,-29.84600067138672 -6.236000061035156,-28.895999908447266z">
                    </path>
                </g>
            </g>
        </g>
    </g>
</svg>`;

const settingSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);">
    <defs>
        <clipPath id="__lottie_element_134">
            <rect width="88" height="88" x="0" y="0"></rect>
        </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_134)">
        <g transform="matrix(1,0,0,1,44,43.875)" opacity="1" style="display: block;">
            <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                <path fill="rgb(255,255,255)" fill-opacity="1" d=" M0,8.125 C-4.420000076293945,8.125 -8,4.545000076293945 -8,0.125 C-8,-4.295000076293945 -4.420000076293945,-7.875 0,-7.875 C4.420000076293945,-7.875 8,-4.295000076293945 8,0.125 C8,4.545000076293945 4.420000076293945,8.125 0,8.125z M0,16.125 C8.84000015258789,16.125 16,8.96500015258789 16,0.125 C16,-8.71500015258789 8.84000015258789,-15.875 0,-15.875 C-8.84000015258789,-15.875 -16,-8.71500015258789 -16,0.125 C-16,8.96500015258789 -8.84000015258789,16.125 0,16.125z M4.539999961853027,27.51099967956543 C3.059999942779541,27.750999450683594 1.5499999523162842,27.871000289916992 0,27.871000289916992 C-1.5499999523162842,27.871000289916992 -3.059999942779541,27.750999450683594 -4.539999961853027,27.51099967956543 C-4.539999961853027,27.51099967956543 -8.699999809265137,32.56100082397461 -8.699999809265137,32.56100082397461 C-9.9399995803833,34.07099914550781 -12.100000381469727,34.46099853515625 -13.789999961853027,33.48099899291992 C-13.789999961853027,33.48099899291992 -21.780000686645508,28.871000289916992 -21.780000686645508,28.871000289916992 C-23.469999313354492,27.891000747680664 -24.209999084472656,25.83099937438965 -23.520000457763672,24.000999450683594 C-23.520000457763672,24.000999450683594 -21.290000915527344,18.06100082397461 -21.290000915527344,18.06100082397461 C-23.3799991607666,15.621000289916992 -25.049999237060547,12.810999870300293 -26.209999084472656,9.76099967956543 C-26.209999084472656,9.76099967956543 -32.65999984741211,8.680999755859375 -32.65999984741211,8.680999755859375 C-34.59000015258789,8.361000061035156 -36,6.690999984741211 -36,4.741000175476074 C-36,4.741000175476074 -36,-4.488999843597412 -36,-4.488999843597412 C-36,-6.439000129699707 -34.59000015258789,-8.109000205993652 -32.65999984741211,-8.428999900817871 C-32.65999984741211,-8.428999900817871 -26.399999618530273,-9.479000091552734 -26.399999618530273,-9.479000091552734 C-25.309999465942383,-12.559000015258789 -23.690000534057617,-15.388999938964844 -21.65999984741211,-17.868999481201172 C-21.65999984741211,-17.868999481201172 -23.959999084472656,-23.999000549316406 -23.959999084472656,-23.999000549316406 C-24.639999389648438,-25.839000701904297 -23.899999618530273,-27.888999938964844 -22.209999084472656,-28.868999481201172 C-22.209999084472656,-28.868999481201172 -14.220000267028809,-33.479000091552734 -14.220000267028809,-33.479000091552734 C-12.529999732971191,-34.45899963378906 -10.380000114440918,-34.069000244140625 -9.130000114440918,-32.558998107910156 C-9.130000114440918,-32.558998107910156 -5.099999904632568,-27.659000396728516 -5.099999904632568,-27.659000396728516 C-3.450000047683716,-27.9689998626709 -1.7400000095367432,-28.128999710083008 0,-28.128999710083008 C1.7400000095367432,-28.128999710083008 3.450000047683716,-27.9689998626709 5.099999904632568,-27.659000396728516 C5.099999904632568,-27.659000396728516 9.130000114440918,-32.558998107910156 9.130000114440918,-32.558998107910156 C10.380000114440918,-34.069000244140625 12.529999732971191,-34.45899963378906 14.220000267028809,-33.479000091552734 C14.220000267028809,-33.479000091552734 22.209999084472656,-28.868999481201172 22.209999084472656,-28.868999481201172 C23.899999618530273,-27.888999938964844 24.639999389648438,-25.839000701904297 23.959999084472656,-23.999000549316406 C23.959999084472656,-23.999000549316406 21.65999984741211,-17.868999481201172 21.65999984741211,-17.868999481201172 C23.690000534057617,-15.388999938964844 25.309999465942383,-12.559000015258789 26.399999618530273,-9.479000091552734 C26.399999618530273,-9.479000091552734 32.65999984741211,-8.428999900817871 32.65999984741211,-8.428999900817871 C34.59000015258789,-8.109000205993652 36,-6.439000129699707 36,-4.488999843597412 C36,-4.488999843597412 36,4.741000175476074 36,4.741000175476074 C36,6.690999984741211 34.59000015258789,8.361000061035156 32.65999984741211,8.680999755859375 C32.65999984741211,8.680999755859375 26.209999084472656,9.76099967956543 26.209999084472656,9.76099967956543 C25.049999237060547,12.810999870300293 23.3799991607666,15.621000289916992 21.290000915527344,18.06100082397461 C21.290000915527344,18.06100082397461 23.520000457763672,24.000999450683594 23.520000457763672,24.000999450683594 C24.209999084472656,25.83099937438965 23.469999313354492,27.891000747680664 21.780000686645508,28.871000289916992 C21.780000686645508,28.871000289916992 13.789999961853027,33.48099899291992 13.789999961853027,33.48099899291992 C12.100000381469727,34.46099853515625 9.9399995803833,34.07099914550781 8.699999809265137,32.56100082397461 C8.699999809265137,32.56100082397461 4.539999961853027,27.51099967956543 4.539999961853027,27.51099967956543z">
                </path>
            </g>
        </g>
    </g>
</svg>`;

const fullScreenSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);"><defs><clipPath id="__lottie_element_182"><rect width="88" height="88" x="0" y="0"></rect></clipPath></defs><g clip-path="url(#__lottie_element_182)"><g transform="matrix(1,0,0,1,44,74.22000122070312)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M19.219999313354492,0.2199999988079071 C7.480000019073486,7.630000114440918 -7.480000019073486,7.630000114440918 -19.219999313354492,0.2199999988079071 C-19.219999313354492,0.2199999988079071 -16.219999313354492,-5.78000020980835 -16.219999313354492,-5.78000020980835 C-6.389999866485596,0.75 6.409999847412109,0.75 16.239999771118164,-5.78000020980835 C16.239999771118164,-5.78000020980835 19.219999313354492,0.2199999988079071 19.219999313354492,0.2199999988079071z"></path></g></g><g transform="matrix(1,0,0,1,68.58000183105469,27.895000457763672)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M11.420000076293945,16.104999542236328 C11.420000076293945,16.104999542236328 4.78000020980835,16.104999542236328 4.78000020980835,16.104999542236328 C4.78000020980835,16.104999542236328 4.78000020980835,14.635000228881836 4.78000020980835,14.635000228881836 C4.25,4.054999828338623 -1.940000057220459,-5.425000190734863 -11.420000076293945,-10.164999961853027 C-11.420000076293945,-10.164999961853027 -8.479999542236328,-16.104999542236328 -8.479999542236328,-16.104999542236328 C3.7200000286102295,-10.005000114440918 11.420000076293945,2.4649999141693115 11.420000076293945,16.104999542236328 C11.420000076293945,16.104999542236328 11.420000076293945,16.104999542236328 11.420000076293945,16.104999542236328z"></path></g></g><g transform="matrix(1,0,0,1,19.450000762939453,27.895000457763672)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M-4.809999942779541,16.104999542236328 C-4.809999942779541,16.104999542236328 -11.449999809265137,16.104999542236328 -11.449999809265137,16.104999542236328 C-11.449999809265137,2.4649999141693115 -3.75,-10.005000114440918 8.449999809265137,-16.104999542236328 C8.449999809265137,-16.104999542236328 11.449999809265137,-10.164999961853027 11.449999809265137,-10.164999961853027 C1.4900000095367432,-5.204999923706055 -4.809999942779541,4.974999904632568 -4.809999942779541,16.104999542236328 C-4.809999942779541,16.104999542236328 -4.809999942779541,16.104999542236328 -4.809999942779541,16.104999542236328z"></path></g></g><g transform="matrix(1,0,0,1,44.0099983215332,65.96499633789062)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M-0.009999999776482582,5.34499979019165 C-5.46999979019165,5.355000019073486 -10.800000190734863,3.7149999141693115 -15.319999694824219,0.6549999713897705 C-15.319999694824219,0.6549999713897705 -12.319999694824219,-5.34499979019165 -12.319999694824219,-5.34499979019165 C-5,0.08500000089406967 5,0.08500000089406967 12.319999694824219,-5.34499979019165 C12.319999694824219,-5.34499979019165 15.319999694824219,0.6549999713897705 15.319999694824219,0.6549999713897705 C10.800000190734863,3.7249999046325684 5.460000038146973,5.355000019073486 -0.009999999776482582,5.34499979019165z"></path></g></g><g transform="matrix(1,0,0,1,62.275001525878906,31.780000686645508)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M9.015000343322754,10.850000381469727 C9.015000343322754,10.850000381469727 9.015000343322754,12.220000267028809 9.015000343322754,12.220000267028809 C9.015000343322754,12.220000267028809 2.434999942779541,12.220000267028809 2.434999942779541,12.220000267028809 C2.434999942779541,12.220000267028809 2.434999942779541,11.220000267028809 2.434999942779541,11.220000267028809 C2.075000047683716,3.740000009536743 -2.305000066757202,-2.9700000286102295 -9.015000343322754,-6.309999942779541 C-9.015000343322754,-6.309999942779541 -6.014999866485596,-12.220000267028809 -6.014999866485596,-12.220000267028809 C-6.014999866485596,-12.220000267028809 -6.014999866485596,-12.220000267028809 -6.014999866485596,-12.220000267028809 C2.7850000858306885,-7.800000190734863 8.524999618530273,1.0099999904632568 9.015000343322754,10.850000381469727 C9.015000343322754,10.850000381469727 9.015000343322754,10.850000381469727 9.015000343322754,10.850000381469727z"></path></g></g><g transform="matrix(1,0,0,1,25.729999542236328,31.780000686645508)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M-2.440000057220459,12.220000267028809 C-2.440000057220459,12.220000267028809 -9.050000190734863,12.220000267028809 -9.050000190734863,12.220000267028809 C-9.050000190734863,1.8700000047683716 -3.2100000381469727,-7.590000152587891 6.050000190734863,-12.220000267028809 C6.050000190734863,-12.220000267028809 9.050000190734863,-6.309999942779541 9.050000190734863,-6.309999942779541 C2.0199999809265137,-2.809999942779541 -2.430000066757202,4.360000133514404 -2.440000057220459,12.220000267028809 C-2.440000057220459,12.220000267028809 -2.440000057220459,12.220000267028809 -2.440000057220459,12.220000267028809z"></path></g></g><g transform="matrix(1,0,0,1,44,57.654998779296875)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M0,4.974999904632568 C-4.110000133514404,4.994999885559082 -8.119999885559082,3.6449999809265137 -11.380000114440918,1.1349999904632568 C-11.380000114440918,1.1349999904632568 -8.319999694824219,-4.974999904632568 -8.319999694824219,-4.974999904632568 C-3.6700000762939453,-0.5049999952316284 3.6700000762939453,-0.5049999952316284 8.319999694824219,-4.974999904632568 C8.319999694824219,-4.974999904632568 11.380000114440918,1.1349999904632568 11.380000114440918,1.1349999904632568 C8.109999656677246,3.634999990463257 4.110000133514404,4.985000133514404 0,4.974999904632568 C0,4.974999904632568 0,4.974999904632568 0,4.974999904632568z"></path></g></g><g transform="matrix(1,0,0,1,55.9900016784668,35.665000915527344)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M6.619999885559082,7.40500020980835 C6.619999885559082,7.40500020980835 6.619999885559082,8.335000038146973 6.619999885559082,8.335000038146973 C6.619999885559082,8.335000038146973 0.009999999776482582,8.335000038146973 0.009999999776482582,8.335000038146973 C0.009999999776482582,3.7850000858306885 -2.549999952316284,-0.375 -6.619999885559082,-2.4049999713897705 C-6.619999885559082,-2.4049999713897705 -3.619999885559082,-8.335000038146973 -3.619999885559082,-8.335000038146973 C2.380000114440918,-5.324999809265137 6.300000190734863,0.6949999928474426 6.619999885559082,7.40500020980835 C6.619999885559082,7.40500020980835 6.619999885559082,7.40500020980835 6.619999885559082,7.40500020980835z"></path></g></g><g transform="matrix(1,0,0,1,31.9950008392334,35.665000915527344)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M6.635000228881836,-2.4049999713897705 C2.565000057220459,-0.375 0.004999999888241291,3.7850000858306885 0.004999999888241291,8.335000038146973 C0.004999999888241291,8.335000038146973 -6.635000228881836,8.335000038146973 -6.635000228881836,8.335000038146973 C-6.635000228881836,1.274999976158142 -2.6449999809265137,-5.184999942779541 3.674999952316284,-8.335000038146973 C3.674999952316284,-8.335000038146973 6.635000228881836,-2.4049999713897705 6.635000228881836,-2.4049999713897705z"></path></g></g><g transform="matrix(1,0,0,1,44,66.322998046875)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M8.319000244140625,-13.677000045776367 C8.319000244140625,-13.677000045776367 19.2189998626709,8.123000144958496 19.2189998626709,8.123000144958496 C13.659000396728516,11.642999649047852 7.068999767303467,13.67300033569336 -0.0010000000474974513,13.67300033569336 C-7.071000099182129,13.67300033569336 -13.66100025177002,11.642999649047852 -19.22100067138672,8.123000144958496 C-19.22100067138672,8.123000144958496 -8.321000099182129,-13.677000045776367 -8.321000099182129,-13.677000045776367 C-6.160999774932861,-11.597000122070312 -3.2309999465942383,-10.32699966430664 -0.0010000000474974513,-10.32699966430664 C3.2290000915527344,-10.32699966430664 6.169000148773193,-11.597000122070312 8.319000244140625,-13.677000045776367z"></path></g></g><g transform="matrix(1,0,0,1,64.68399810791016,27.89699935913086)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M15.314000129699707,16.10700035095215 C15.314000129699707,16.10700035095215 -8.685999870300293,16.10700035095215 -8.685999870300293,16.10700035095215 C-8.685999870300293,11.406999588012695 -11.38599967956543,7.336999893188477 -15.315999984741211,5.367000102996826 C-15.315999984741211,5.367000102996826 -4.576000213623047,-16.10300064086914 -4.576000213623047,-16.10300064086914 C7.214000225067139,-10.192999839782715 15.314000129699707,2.006999969482422 15.314000129699707,16.10700035095215z"></path></g></g><g transform="matrix(1,0,0,1,23.31599998474121,27.89699935913086)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M4.584000110626221,-16.10300064086914 C4.584000110626221,-16.10300064086914 15.314000129699707,5.367000102996826 15.314000129699707,5.367000102996826 C11.383999824523926,7.336999893188477 8.684000015258789,11.406999588012695 8.684000015258789,16.10700035095215 C8.684000015258789,16.10700035095215 -15.315999984741211,16.10700035095215 -15.315999984741211,16.10700035095215 C-15.315999984741211,2.006999969482422 -7.216000080108643,-10.192999839782715 4.584000110626221,-16.10300064086914z"></path></g></g><g transform="matrix(1,0,0,1,44,44)" opacity="1" style="display: block;"><g opacity="1" transform="matrix(1,0,0,1,0,0)"><path fill="rgb(255,255,255)" fill-opacity="1" d=" M0,-4 C2.140000104904175,-4 3.890000104904175,-2.319999933242798 4,-0.20000000298023224 C4,-0.20000000298023224 4,0 4,0 C4,0 4,0.20000000298023224 4,0.20000000298023224 C3.890000104904175,2.319999933242798 2.140000104904175,4 0,4 C-2.2100000381469727,4 -4,2.2100000381469727 -4,0 C-4,-2.2100000381469727 -2.2100000381469727,-4 0,-4z"></path></g></g></g></svg>
`;

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
    y - parseInt(topChild.style.bottom);
    let parentLeft = x;
    let parentRight = x + parent.clientWidth;
    if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop)
        return true;
    if (pageX >= parentLeft && pageX <= parentRight && pageY >= y && pageY <= allBottom)
        return true;
    return false;
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
                <div class="${styles["video-resolvepower"]} ${styles["video-controller"]}" aria-label="分辨率">
                    分辨率
                </div>
                <div class="${styles["video-playrate"]} ${styles["video-controller"]}" aria-label="倍速">
                    倍速
                </div>
                <div class="${styles["video-volume"]} ${styles["video-controller"]}" aria-label="音量">
                    <div class="${styles["video-volume-set"]}" aria-label="调节音量" style="display:none; bottom:41px" >
                      <div class="${styles["video-volume-show"]}">48</div>
                      <div class="${styles["video-volume-progress"]}">
                        <div class="${styles["video-volume-completed"]}"></div>
                        <div class="${styles["video-volume-dot"]}"></div>
                      </div>
                    </div>
                    ${volumeSVG}
                </div>
                <div class="${styles["video-subsettings"]} ${styles["video-controller"]}" aria-label="设置">
                    ${settingSVG}
                </div>
                <div class="${styles["video-fullscreen"]} ${styles["video-controller"]}" aria-label="全屏">
                    ${fullScreenSVG}
                </div>
            </div>
        </div>
    `;
    }
    initControllerEvent() {
        /**
         * @description 监听鼠标的点击事件来决定是否暂停还是播放视频
         */
        this.videoPlayBtn.onclick = (e) => {
            if (this.video.paused) {
                this.video.play();
            }
            else if (this.video.played) {
                this.video.pause();
            }
        };
        /**
         * @description 点击进入全屏模式
         */
        this.fullScreen.onclick = () => {
            if (this.container.requestFullscreen && !document.fullscreenElement) {
                this.container.requestFullscreen(); //该函数请求全屏
            }
            else if (document.fullscreenElement) {
                document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            }
        };
        /**
         * @desciption 显示音量的设置
         * TODO:这部分控制选项的显示和隐藏的逻辑可以复用
         */
        this.volumeBtn.onmouseenter = (e) => {
            this.volumeSet.style.display = "block";
            let ctx = this;
            document.addEventListener("mousemove", this.handleMouseMove.bind(ctx));
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
        /**
         * @description 模板字符已经渲染到页面上，可以获取DOM元素了
         */
        this.on("mounted", () => {
            this.videoPlayBtn = this.container.querySelector(`.${styles["video-start-pause"]} i`);
            this.currentTime = this.container.querySelector(`.${styles["video-duration-completed"]}`);
            this.summaryTime = this.container.querySelector(`.${styles["video-duration-all"]}`);
            this.video = this.container.querySelector("video");
            this.fullScreen = this.container.querySelector(`.${styles["video-fullscreen"]}`);
            this.volumeBtn = this.container.querySelector(`.${styles["video-volume"]}`);
            console.log(this.volumeBtn);
            this.volumeSet = this.container.querySelector(`.${styles["video-volume-set"]}`);
            this.initControllerEvent();
        });
    }
    handleMouseMove(e) {
        let pX = e.pageX, pY = e.pageY;
        let ctx = this;
        // console.log(pX,pY)
        if (!checkIsMouseInRange(ctx.volumeBtn, ctx.volumeSet, pX, pY)) {
            this.volumeSet.style.display = "none";
            document.removeEventListener("mousemove", ctx.handleMouseMove);
        }
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
    "video-fullscreen": "controller_video-fullscreen__1-aJA",
    "video-duration-all": "controller_video-duration-all__MOXNR",
    "video-controller": "controller_video-controller__MqNia",
    "video-playrate": "controller_video-playrate__lmym3",
    "video-resolvepower": "controller_video-resolvepower__yDRda",
    "video-volume": "controller_video-volume__6xzJB",
    "video-volume-set": "controller_video-volume-set__MZ1ks",
    "video-volume-show": "controller_video-volume-show__uRgS1",
    "video-volume-progress": "controller_video-voulme-progress__QAOAm",
    "video-volume-completed": "controller_video-volume-completed__R0FaX",
    "video-volume-dot": "controller_video-volume-dot__6sC-V",
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

exports.$warn = $warn;
exports.BaseEvent = BaseEvent;
exports.Controller = Controller;
exports.ErrorMask = ErrorMask;
exports.LoadingMask = LoadingMask;
exports.Mp4Player = Mp4Player;
exports.MpdPlayer = MpdPlayer;
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
exports.icon = icon;
exports.parseDuration = parseDuration;
exports.string2booolean = string2booolean;
exports.string2number = string2number;
exports.styles = styles;
exports.switchToSeconds = switchToSeconds;
