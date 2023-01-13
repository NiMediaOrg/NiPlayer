import {
  AdaptationSet,
  MediaType,
  MediaVideoResolve,
  MeidaAudioResolve,
  RangeRequest,
  Representation,
  SegmentRequest,
  SegmentTemplate,
} from "../types/MpdFile";
import { parseDuration, switchToSeconds } from "../utils/format";
import {
  checkAdaptationSet,
  checkBaseURL,
  checkInitialization,
  checkRepresentation,
  checkSegmentBase,
  checkSegmentList,
  checkSegmentTemplate,
  checkSegmentURL,
  findSpecificType,
} from "../utils/typeCheck";
import { initMpdFile } from "./initMpd";

export function parseMpd(mpd: Document, BASE_URL: string = "") {
  let mpdModel = initMpdFile(mpd).root;
  let type = mpdModel.type;
  let mediaPresentationDuration = switchToSeconds(
    parseDuration(mpdModel.mediaPresentationDuration)
  );
  let maxSegmentDuration = switchToSeconds(
    parseDuration(mpdModel.maxSegmentDuration)
  );
  let sumSegment = maxSegmentDuration
    ? Math.ceil(mediaPresentationDuration / maxSegmentDuration)
    : null;
  // 代表的是整个MPD文档中的需要发送的所有xhr请求地址，包括多个Period对应的视频和音频请求地址
  let mpdRequest = [];
  // 遍历文档中的每一个Period，Period代表着一个完整的音视频，不同的Period具有不同内容的音视频，例如广告和正片就属于不同的Period
  mpdModel.children.forEach((period) => {
    let path = "" + BASE_URL;
    let videoRequest: MediaVideoResolve;
    let audioRequest: MeidaAudioResolve;
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
          audioRequest = parseAdaptationSet(
            child,
            path,
            sumSegment,
            child.mimeType
          ) as MeidaAudioResolve;
        } else if (child.mimeType === "video/mp4") {
          videoRequest = parseAdaptationSet(
            child,
            path,
            sumSegment,
            child.mimeType
          );
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

export function parseAdaptationSet(
  adaptationSet: AdaptationSet,
  path: string = "",
  sumSegment: number | null,
  type: MediaType
): Object {
  let children = adaptationSet.children;
  let hasTemplate = false;
  let template: SegmentTemplate;
  for (let i = children.length - 1; i >= 0; i--) {
    let child = children[i];
    if (checkSegmentTemplate(child)) {
      hasTemplate = true;
      template = child;
      break;
    }
  }
  let mediaResolve: MediaVideoResolve | MeidaAudioResolve = {};
  children.forEach((child) => {
    if (checkRepresentation(child)) {
      let generateInitializationUrl,
        initializationFormat,
        generateMediaUrl,
        mediaFormat;
      if (hasTemplate) {
        [generateInitializationUrl, initializationFormat] =
          generateTemplateTuple(template.initialization);
        [generateMediaUrl, mediaFormat] = generateTemplateTuple(template.media);
      }
      let obj = parseRepresentation(
        child,
        hasTemplate,
        path,
        sumSegment,
        type,
        [generateInitializationUrl, initializationFormat],
        [generateMediaUrl, mediaFormat]
      );

      Object.assign(mediaResolve, obj);
    }
  });
  return mediaResolve;
}

export function parseRepresentation(
  representation: Representation,
  hasTemplate: boolean = false,
  path: string = "",
  sumSegment: number | null,
  type: MediaType,
  initializationSegment?: [Function, string[]],
  mediaSegment?: [Function, string[]]
): MediaVideoResolve {
  let resolve;
  if (type === "video/mp4") {
    resolve = `${representation.width}*${representation.height}`;
  } else if (type === "audio/mp4") {
    resolve = `${representation.audioSamplingRate}`;
  }
  let obj = {};
  // 一. 如果该适应集 中具有标签SegmentTemplate，则接下来的Representation中请求的Initialization Segment和Media Segment的请求地址一律以SegmentTemplate中的属性为基准
  if (hasTemplate) {
    obj[resolve] = parseRepresentationWithSegmentTemplateOuter(
      representation,
      path,
      sumSegment,
      initializationSegment,
      mediaSegment
    );
  } else {
    //二. 如果没有SegmentTemplate标签，则根据Representation中的子结构具有三种情况,前提是Representation中必须具有子标签，否则报错
    //情况1.(BaseURL)+SegmentList
    if (findSpecificType(representation.children, "SegmentList")) {
      obj[resolve] = parseRepresentationWithSegmentList(representation, path);
    } else if (findSpecificType(representation.children, "SegmentBase")) {
      obj[resolve] = parseRepresentationWithSegmentBase(representation, path);
    }
  }
  return obj;
}
/**
 * @description 应对Representation外部具有SegmentTemplate的结构这种情况
 */
export function parseRepresentationWithSegmentTemplateOuter(
  representation: Representation,
  path: string = "",
  sumSegment: number | null,
  initializationSegment: [Function, string[]],
  mediaSegment: [Function, string[]]
): Array<RangeRequest | SegmentRequest> {
  let requestArray = new Array<RangeRequest | SegmentRequest>();
  let [generateInitializationUrl, initializationFormat] =
    initializationSegment!;
  let [generateMediaUrl, mediaFormat] = mediaSegment!;
  // 1.处理对于Initialization Segment的请求
  for (let i in initializationFormat) {
    if (initializationFormat[i] === "RepresentationID") {
      initializationFormat[i] = representation.id;
    } else if (initializationFormat[i] === "Number") {
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
export function parseRepresentationWithSegmentList(
  representation: Representation,
  path: string
): Array<RangeRequest | SegmentRequest> {
  let children = representation.children!;
  let segmentList;
  let requestArray = new Array<RangeRequest | SegmentRequest>();

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
      } else {
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
export function parseRepresentationWithSegmentBase(
  representation: Representation,
  path: string
): Array<RangeRequest | SegmentRequest> {
  let children = representation.children!;
  let requestArray = new Array<RangeRequest | SegmentRequest>();
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
        range: child.child.range!,
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
export function generateTemplateTuple(
  s: string
): [(...args: string[]) => string, string[]] {
  let splitStr: string[] = [];
  let format: string[] = [];
  for (let i = 0; i < s.length; i++) {
    let str = s.slice(0, i + 1);
    if (/\$.+?\$/.test(str)) {
      format.push(str.match(/\$(.+?)\$/)![1]);
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
    (...args: string[]) => {
      let index = 0;
      let str = "";
      splitStr.forEach((item) => {
        if (item === "%format%") {
          str += args[index];
          index++;
        } else {
          str += item;
        }
      });
      return str;
    },
    format,
  ];
}
