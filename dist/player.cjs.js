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
            console.log(this.__events[type]);
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
        console.log(this.__events);
        if (this.__events[type]) {
            this.__events[type].forEach(event => {
                event.cb.call(event.scope, ...payload);
            });
        }
    }
}
const factory$9 = FactoryMaker.getSingleFactory(EventBus);

const EventConstants = {
    MANIFEST_LOADED: "manifestLoaded",
    MANIFEST_PARSE_COMPLETED: "manifestParseCompleted",
    SOURCE_ATTACHED: "sourceAttached",
    SEGEMTN_LOADED: "segmentLoaded"
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
const factory$8 = FactoryMaker.getSingleFactory(XHRLoader);

class URLLoader {
    constructor(ctx, ...args) {
        this.config = {};
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
        this.xhrLoader = factory$8({}).getInstance();
        this.eventBus = factory$9({}).getInstance();
    }
    // 每调用一次load函数就发送一次请求
    load(config, type) {
        //一个HTTPRequest对象才对应一个请求
        let request = new HTTPRequest(config);
        let ctx = this;
        if (type === "Manifest") {
            ctx._loadManifest({
                request: request,
                success: function (data) {
                    request.getResponseTime = new Date().getTime();
                    ctx.eventBus.trigger(EventConstants.MANIFEST_LOADED, data);
                },
                error: function (error) {
                    console.log(this, error);
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
                    }
                });
            });
        }
    }
}
const factory$7 = FactoryMaker.getSingleFactory(URLLoader);

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
const factory$6 = FactoryMaker.getSingleFactory(SegmentTemplateParser);

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
const factory$5 = FactoryMaker.getSingleFactory(URLUtils);

class DashParser {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
        this.initialEvent();
    }
    setup() {
        this.segmentTemplateParser = factory$6().getInstance();
        this.eventBus = factory$9().getInstance();
        this.URLUtils = factory$5().getInstance();
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
    getTotalDuration(Mpd) {
        let totalDuration = 0;
        let MpdDuration = NaN;
        if (Mpd.mediaPresentationDuration) {
            MpdDuration = switchToSeconds(parseDuration(Mpd.mediaPresentationDuration));
        }
        // MPD文件的总时间要么是由Mpd标签上的availabilityStartTime指定，要么是每一个Period上的duration之和
        if (isNaN(MpdDuration)) {
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
const factory$4 = FactoryMaker.getSingleFactory(DashParser);

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
const factory$3 = FactoryMaker.getSingleFactory(BaseURLParser);

class StreamController {
    constructor(ctx, ...args) {
        this.config = {};
        //音视频的分辨率
        this.videoResolvePower = "1920*1080";
        this.audioResolvePower = "48000";
        this.config = ctx.context;
        console.log(this.config);
        this.setup();
        this.initialEvent();
    }
    setup() {
        this.baseURLParser = factory$3().getInstance();
        this.URLUtils = factory$5().getInstance();
        this.eventBus = factory$9().getInstance();
        this.urlLoader = factory$7().getInstance();
    }
    initialEvent() {
        this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED, this.onManifestParseCompleted, this);
    }
    onManifestParseCompleted(mainifest) {
        this.segmentRequestStruct = this.generateSegmentRequestStruct(mainifest);
        console.log(this.segmentRequestStruct);
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
            console.log(url);
            res[Representation.resolvePower] = [];
            res[Representation.resolvePower].push(this.URLUtils.resolve(url, Representation.initializationURL));
            res[Representation.resolvePower].push(Representation.mediaURL.map(item => {
                return this.URLUtils.resolve(url, item);
            }));
        }
        return res;
    }
    startStream(Mpd) {
        Mpd["Period_asArray"].forEach((p, pid) => __awaiter(this, void 0, void 0, function* () {
            let ires = yield this.loadInitialSegment(pid);
            this.eventBus.trigger(EventConstants.SEGEMTN_LOADED, ires);
            let number = this.segmentRequestStruct.request[pid].VideoSegmentRequest[0].video[this.videoResolvePower][1].length;
            for (let i = 0; i < number; i++) {
                let mres = yield this.loadMediaSegment(pid, i);
                this.eventBus.trigger(EventConstants.SEGEMTN_LOADED, mres);
            }
        }));
    }
    //此处的streamId标识具体的Period对象
    loadInitialSegment(streamId) {
        let stream = this.segmentRequestStruct.request[streamId];
        // 先默认选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.loadSegment(videoRequest[this.videoResolvePower][0], audioRequest[this.audioResolvePower][0]);
    }
    loadMediaSegment(streamId, mediaId) {
        let stream = this.segmentRequestStruct.request[streamId];
        // 先默认选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.loadSegment(videoRequest[this.videoResolvePower][1][mediaId], audioRequest[this.audioResolvePower][1][mediaId]);
    }
    loadSegment(videoURL, audioURL) {
        let p1 = this.urlLoader.load({ url: videoURL, responseType: "arraybuffer" }, "Segment");
        let p2 = this.urlLoader.load({ url: audioURL, responseType: "arraybuffer" }, "Segment");
        return Promise.all([p1, p2]);
    }
}
const factory$2 = FactoryMaker.getClassFactory(StreamController);

class MediaPlayerController {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
    }
    setup() {
        this.mediaSource = new MediaSource();
    }
}
const factory$1 = FactoryMaker.getClassFactory(MediaPlayerController);

/**
 * @description 整个dash处理流程的入口类MediaPlayer,类似于项目的中转中心，用于接收任务并且将任务分配给不同的解析器去完成
 */
class MediaPlayer {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
        this.initializeEvent();
    }
    //初始化类
    setup() {
        this.urlLoader = factory$7().getInstance();
        this.eventBus = factory$9().getInstance();
        // ignoreRoot -> 忽略Document节点，从MPD开始作为根节点
        this.dashParser = factory$4({ ignoreRoot: true }).getInstance();
        this.streamController = factory$2().create();
        this.mediaPlayerController = factory$1().create();
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
        this.eventBus.trigger(EventConstants.MANIFEST_PARSE_COMPLETED, manifest);
    }
    onSegmentLoaded(data) {
        console.log("加载Segment成功");
        data[0];
        data[1];
    }
    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url
     */
    attachSource(url) {
        this.eventBus.trigger(EventConstants.SOURCE_ATTACHED, url);
        this.urlLoader.load({ url, responseType: "text" }, "Manifest");
    }
}
const factory = FactoryMaker.getClassFactory(MediaPlayer);

class MpdPlayer {
    constructor(player) {
        let mediaPlayer = factory().create();
        mediaPlayer.attachSource(player.playerOptions.url);
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
