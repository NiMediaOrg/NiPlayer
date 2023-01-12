import {
  BaseURL,
  Initialization,
  Mpd,
  MpdFile,
  Representation,
  SegmentBase,
  SegmentList,
  SegmentURL,
  MediaType,
  AdaptationSet,
  SegmentTemplate,
  Period,
} from "../types/MpdFile";
import { checkMediaType } from "../utils/typeCheck";
import { string2booolean, string2number } from "../utils/typeSwtich";
import { $warn } from "../utils/warn";

export function initMpdFile(mpd: Document): MpdFile {
  return {
    tag: "File",
    root: initMpd(mpd.querySelector("MPD")!),
  };
}

export function initMpd(mpd: Element): Mpd {
  let type = mpd.getAttribute("type") as "static" | "dynamic";
  let availabilityStartTime = mpd.getAttribute("availabilityStartTime");
  let mediaPresentationDuration = mpd.getAttribute("mediaPresentationDuration");
  let minBufferTime = mpd.getAttribute("minBufferTime");
  let minimumUpdatePeriod = mpd.getAttribute("minimumUpdatePeriod");
  let maxSegmentDuration = mpd.getAttribute("maxSegmentDuration");
  let children = new Array<Period>();
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

export function initPeriod(period: Element): Period {
  let id = period.getAttribute("id");
  let duration = period.getAttribute("duration");
  let start = period.getAttribute("start");
  let children = new Array<AdaptationSet>();
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

export function initAdaptationSet(
  adaptationSet: Element
): AdaptationSet | never {
  let segmentAlignment = string2booolean(
    adaptationSet.getAttribute("segmentAlignment")
  );
  let mimeType = adaptationSet.getAttribute("mimeType");
  if (checkMediaType(mimeType)) {
    let startWithSAP = string2number(
      adaptationSet.getAttribute("startWithSAP")
    );
    let segmentTemplate = adaptationSet.querySelector("SegmentTemplate");
    let children = new Array<SegmentTemplate | Representation>();
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
  } else {
    $warn(
      "传入的MPD文件中的AdaptationSet标签上的属性mimeType的值不合法，应该为MIME类型"
    );
  }
}

export function initRepresentation(
  representation: Element
): Representation | never {
  let bandWidth = Number(representation.getAttribute("bandwidth"));
  let codecs = representation.getAttribute("codecs");
  let id = representation.getAttribute("id");
  let width = Number(representation.getAttribute("width"));
  let height = Number(representation.getAttribute("height"));
  let mimeType = representation.getAttribute("mimeType");
  let audioSamplingRate = representation.getAttribute("audioSamplingRate");
  let children = new Array<BaseURL | SegmentBase | SegmentList>();
  if (mimeType && !checkMediaType(mimeType)) {
    $warn("");
  } else {
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
        mimeType: mimeType as MediaType | null,
      };
    } else {
      //对于Representation标签的children普遍认为有两种可能
      if (representation.querySelector("SegmentList")) {
        //1. (BaseURL)+SegmentList
        let list = initSegmentList(
          representation.querySelector("SegmentList")!
        );
        if (representation.querySelector("BaseURL")) {
          children.push(
            initBaseURL(representation.querySelector("BaseURL")!),
            list
          );
        } else {
          children.push(list);
        }
      } else if(representation.querySelector("SegmentBase")){
        //2. BaseURL+SegmentBase 适用于每个rep只有一个Seg的情况
        let base = initSegmentBase(
          representation.querySelector("SegmentBase")!
        );
        if (representation.querySelector("BaseURL")) {
          children.push(
            initBaseURL(representation.querySelector("BaseURL")!),
            base
          );
        } else {
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
        mimeType: mimeType as MediaType | null,
        children,
      };
    }
  }
}

export function initSegmentTemplate(segmentTemplate: Element): SegmentTemplate {
  let initialization = segmentTemplate.getAttribute("initialization");
  let media = segmentTemplate.getAttribute("media");
  return {
    tag: "SegmentTemplate",
    initialization,
    media,
  };
}

export function initSegmentBase(segmentBase: Element): SegmentBase | never {
  let range = segmentBase.getAttribute("indexRange");
  if (!range) {
    $warn("传入的MPD文件中SegmentBase标签上不存在属性indexRange");
  }
  let initialization: Initialization = initInitialization(
    segmentBase.querySelector("Initialization")!
  );
  return {
    tag: "SegmentBase",
    indexRange: range,
    child: initialization,
  };
}

export function initSegmentList(segmentList: Element): SegmentList | never {
  let duration: number | string | null = segmentList.getAttribute("duration");
  if (!duration) {
    $warn("传入的MPD文件中SegmentList标签上不存在属性duration");
  }
  duration = Number(duration);
  let children: Array<Initialization | SegmentURL> = [
    initInitialization(segmentList.querySelector("Initialization")!),
  ];
  segmentList.querySelectorAll("SegmentURL").forEach((item) => {
    children.push(initSegmentURL(item));
  });
  return {
    tag: "SegmentList",
    duration: duration as number,
    children,
  };
}

export function initInitialization(initialization: Element): Initialization {
  return {
    tag: "Initialization",
    sourceURL: initialization.getAttribute("sourceURL"),
    range: initialization.getAttribute("range"),
  };
}

export function initSegmentURL(segmentURL: Element): SegmentURL | never {
  let media = segmentURL.getAttribute("media");
  if (!media) {
    $warn("传入的MPD文件中SegmentURL标签上不存在属性media");
  }
  return {
    tag: "SegmentURL",
    media,
  };
}

export function initBaseURL(baseURL: Element): BaseURL {
  return {
    tag: "BaseURL",
    url: baseURL.innerHTML,
  };
}
