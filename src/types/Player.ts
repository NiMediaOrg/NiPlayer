import { Component } from "../class/Component";
import {
  DutaionShow,
  FullPage,
  FullScreen,
  PicInPic,
  PlayButton,
  ScreenShot,
  SubSetting,
  VideoShot,
  Volume,
} from "../component";
import { SubsettingsBase } from "../component/ToolBar/BottomBar/parts/Subsettings/parts/SubsettingsBase";
import { SubsettingItem } from "../component/ToolBar/BottomBar/parts/Subsettings/SubsettingItem";
import { Player } from "../page/player";
import { RequestHeader } from "./mp4";

// 播放器的 选项
export type PlayerOptions = {
  url?: string;
  container?: HTMLElement;
  video?: HTMLVideoElement;
  post?: string;
  autoPlay?: boolean;
  streamPlay?: boolean;
  subtitles?: Subtitles[];
  danmaku?: DanmakuOptions;
  plugins?: Plugin[];
  bilibiliMode?: boolean;
  title?:
    | string
    | {
        message: string;
        style?: Partial<CSSStyleDeclaration>;
      };
  thumbnails?: Thumbnails;
  leftBottomBarControllers?: ComponentConstructor[];
  rightBottomBarControllers?: ComponentConstructor[];
  leftTopBarControllers?: ComponentConstructor[];
  rightTopBarController?: ComponentConstructor[];
  leftMediumBarController?: ComponentConstructor[];
  mediumMediumBarController?: ComponentConstructor[];
  rightMediumBarController?: ComponentConstructor[];
};

export type DanmakuOptions = {
  open: boolean;
  api?: string;
  type?: "websocket" | "http";
  timeout?: number;
};

export type Subtitles = {
  default?: boolean;
  tip: string;
  source: string;
  lang: "zh" | "en" | "jp";
  style?: Partial<CSSStyleDeclaration>;
};

export interface Thumbnails {
  row: number; // 精灵图的行数
  col: number; // 列数
  total: number; // 精灵图的总数
  margin: number; // 距离上下左右的像素大小
  source: string; // 资源的地址
  interval: number; //间隔时间
  width: number;
  height: number;
}

export type Video = {
  url?: string; //视频的源地址
  volume?: number;// 视频的音量
  time?: string;// 视频的当前时间
  duration?: number;// 视频的总时长
  frameRate?: number; //视频的帧率 kps;
  brandRate?: number; //视频的码率 bps
  videoCodec?: string; //视频的编码方式
  audioCodec?: string;// 音频的编码方式
  lastUpdateTime?: Date; //视频最后一次更新时间
  isFragmented?: boolean; //是否为fragmented类型的mp4文件
  width?: number, //视频宽度上的分辨率（像素个数）
  height?: number // 视频高度上的分辨率（像素个数）
}

export type DOMProps = {
  className?: string[];
  id?: string;
  style?: Partial<CSSStyleDeclaration>;
  [props: string]: any;
};

// ComponentItem用于描述一个组件
export interface ComponentItem {
  id: string;
  el: HTMLElement;
  container?: HTMLElement;
  props?: DOMProps;
  [props: string]: any;
}

// 描述的是Subsettings的上的Item的类型，也就是设置选项
export interface SubsettingsItem {
  leftIcon?: SVGSVGElement | HTMLElement;
  leftText?: string;
  rightTip?: string;
  rightIcon?: SVGSVGElement | HTMLElement;
  instance?: SubsettingItem; //自身item对应的实例
  click?: (item: SubsettingsItem) => any;
  target?: SubsettingsBase | SubsettingsBaseConstructor; //该item对应的点击后需要跳转的SubsettingsBase实例对象
}

export interface SubsettingsBaseConstructor {
  new (subsetting: SubSetting, player: Player): SubsettingsBase;

  instance?: SubsettingsBase;
}

export interface Node {
  id: string;
  el: HTMLElement;
}

export type Plugin = {
  install: (player: Player) => any;
};

export type getFunctionParametersType<T extends (...args: any[]) => any> =
  T extends (...args: (infer T)[]) => infer U ? T : never;

export interface ComponentConstructor {
  new (
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: string | Node[]
  ): Component & ComponentItem;
} // 组件的构造函数

// 存储内置组件的ID，用于在用户注册组件时区分是自定义组件还是内置组件
export type BuiltInComponentID =
  | "PlayButton"
  | "Volume"
  | "FullScreen"
  | "DutaionShow"
  | "SubSetting"
  | "VideoShot"
  | "ScreenShot"
  | "PicInPic"
  | "FullPage"
  | "FullScreen";

export type ComponentMap = {
  PlayButton: PlayButton;
  Volume: Volume;
  FullScreen: FullScreen;
  DutaionShow: DutaionShow;
  SubSetting: SubSetting;
  VideoShot: VideoShot;
  ScreenShot: ScreenShot;
  PicInPic: PicInPic;
  FullPage: FullPage;
  [props: string]: ComponentItem;
};

//对应最顶层的ToolBar的注册选项
export type TopToolBarOptions = {
  type: "TopToolBar";
  pos: "left" | "right";
};

export type BottomToolBarOptions = {
  type: "BottomToolBar";
  pos: "left" | "right" | "medium";
};

export type AnyPositionOptions = {
  type: "AnyPosition";
};

// 注册组件时的选项
export type RegisterComponentOptions = {
  mode: TopToolBarOptions | BottomToolBarOptions | AnyPositionOptions;
  index?: number;
};

// 更新组件时的选项
export type UpdateComponentOptions = {
  replaceElType?: "replaceOuterHTMLOfComponent" | "replaceInnerHTMLOfComponent";
};

export type AxiosConfig = {
  baseURL?: string;
  header?: RequestHeader;
  timeout?: number; //请求的超时时长
};

export type AxiosOptions = {
  header?: RequestHeader; //请求头
  query?: { [props: string]: any }; // get请求的查询参数
};
