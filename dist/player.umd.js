(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('loading-mask.less')) :
  typeof define === 'function' && define.amd ? define(['exports', 'loading-mask.less'], factory) :
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

  function $warn(msg) {
      throw new Error(msg);
  }

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

  function parseMpd(mpd, BASE_URL = "") {
      let mpdModel = initMpdFile(mpd).root;
      let type = mpdModel.type;
      let mediaPresentationDuration = switchToSeconds(parseDuration(mpdModel.mediaPresentationDuration));
      let maxSegmentDuration = switchToSeconds(parseDuration(mpdModel.maxSegmentDuration));
      let sumSegment = maxSegmentDuration
          ? Math.ceil(mediaPresentationDuration / maxSegmentDuration)
          : null;
      // 代表的是整个MPD文档中的需要发送的所有xhr请求地址，包括多个Period对应的视频和音频请求地址
      let mpdRequest = new Array();
      // 遍历文档中的每一个Period，Period代表着一个完整的音视频，不同的Period具有不同内容的音视频，例如广告和正片就属于不同的Period
      mpdModel.children.forEach((period) => {
          let path = "" + BASE_URL;
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
          mpdModel
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

  function sendRequest(url, method, header = {}, responseType = "text", data) {
      return new Promise((res, rej) => {
          let xhr = new XMLHttpRequest();
          xhr.open(method, url);
          for (let index in header) {
              xhr.setRequestHeader(index, header[index]);
          }
          xhr.responseType = responseType;
          xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                  if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                      res({
                          status: "success",
                          data: xhr.response,
                      });
                  }
                  else {
                      rej({
                          status: "fail",
                          data: xhr.response,
                      });
                  }
              }
          };
          xhr.send(data);
      });
  }
  class Axios {
      constructor(url, method, header, responseType, data) {
          this.url = url;
          this.method = method;
          this.header = header;
          this.responseType = responseType;
          this.data = data;
      }
      get(url, header, responseType) {
          console.log(url);
          return sendRequest(url, "get", header, responseType);
      }
      post(url, header, responseType, data) {
          return sendRequest(url, "post", header, responseType, data);
      }
  }

  class MpdPlayer {
      constructor(player) {
          this.player = player;
          this.axios = new Axios();
          this.mpdUrl = this.player.playerOptions.url;
          this.init();
      }
      init() {
          return __awaiter(this, void 0, void 0, function* () {
              yield this.getMpdFile(this.mpdUrl);
              // 遍历每一个Period
              this.requestInfo.mpdRequest.forEach((child) => __awaiter(this, void 0, void 0, function* () {
                  yield this.handlePeriod(child);
              }));
          });
      }
      /**
       * @description 获取并且解析MPD文件
       */
      getMpdFile(url) {
          return __awaiter(this, void 0, void 0, function* () {
              let val = yield this.axios.get(url, {}, "text");
              let parser = new DOMParser();
              let document = parser.parseFromString(val.data, "text/xml");
              let result = parseMpd(document, "https://dash.akamaized.net/envivio/EnvivioDash3/");
              this.mpd = document;
              this.requestInfo = result;
          });
      }
      handlePeriod(child) {
          return __awaiter(this, void 0, void 0, function* () {
              let videoResolve = child.videoRequest["1920*1080"];
              let audioResolve = child.audioRequest["48000"];
              yield this.handleInitializationSegment(videoResolve[0].url, audioResolve[0].url);
              yield this.handleMediaSegment(videoResolve.slice(1), audioResolve.slice(1));
          });
      }
      handleInitializationSegment(videoUrl, audioUrl) {
          return __awaiter(this, void 0, void 0, function* () {
              yield Promise.all([
                  this.getSegment(videoUrl),
                  this.getSegment(audioUrl),
              ]);
          });
      }
      handleMediaSegment(videoRequest, audioRequest) {
          return __awaiter(this, void 0, void 0, function* () {
              for (let i = 0; i < Math.min(videoRequest.length, audioRequest.length); i++) {
                  let val = yield Promise.all([
                      this.getSegment(videoRequest[i].url),
                      this.getSegment(audioRequest[i].url),
                  ]);
                  console.log(i + 1, val);
              }
          });
      }
      /**
       * @description 根据解析到的MPD文件的段（Initialization Segment 和 Media Segment）
       */
      getSegment(url) {
          return this.axios.get(url, {}, "arraybuffer");
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
  exports.Axios = Axios;
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
  exports.checkRepresentation = checkRepresentation;
  exports.checkSegmentBase = checkSegmentBase;
  exports.checkSegmentList = checkSegmentList;
  exports.checkSegmentTemplate = checkSegmentTemplate;
  exports.checkSegmentURL = checkSegmentURL;
  exports.checkUtils = checkUtils;
  exports.findSpecificType = findSpecificType;
  exports.formatTime = formatTime;
  exports.generateTemplateTuple = generateTemplateTuple;
  exports.icon = icon;
  exports.initAdaptationSet = initAdaptationSet;
  exports.initBaseURL = initBaseURL;
  exports.initInitialization = initInitialization;
  exports.initMpd = initMpd;
  exports.initMpdFile = initMpdFile;
  exports.initPeriod = initPeriod;
  exports.initRepresentation = initRepresentation;
  exports.initSegmentBase = initSegmentBase;
  exports.initSegmentList = initSegmentList;
  exports.initSegmentTemplate = initSegmentTemplate;
  exports.initSegmentURL = initSegmentURL;
  exports.parseAdaptationSet = parseAdaptationSet;
  exports.parseDuration = parseDuration;
  exports.parseMpd = parseMpd;
  exports.parseRepresentation = parseRepresentation;
  exports.parseRepresentationWithSegmentBase = parseRepresentationWithSegmentBase;
  exports.parseRepresentationWithSegmentList = parseRepresentationWithSegmentList;
  exports.parseRepresentationWithSegmentTemplateOuter = parseRepresentationWithSegmentTemplateOuter;
  exports.string2booolean = string2booolean;
  exports.string2number = string2number;
  exports.styles = styles;
  exports.switchToSeconds = switchToSeconds;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
