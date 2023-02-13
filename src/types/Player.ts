import { Component } from "../class/Component";
import { SubsettingItem } from "../component/ToolBar/BottomBar/parts/Subsettings/SubsettingItem";
import { Player } from "../page/player";

export type PlayerOptions = {
  url?: string;
  container?: HTMLElement;
  video?: HTMLVideoElement;
  post?:string;
  autoPlay?: boolean;
  streamPlay?: boolean;
  leftBottomBarControllers?: ComponentConstructor[];
  rightBottomBarControllers?: ComponentConstructor[];
  leftTopBarControllers?: ComponentConstructor[];
  rightTopBarController?: ComponentConstructor[];
  leftMediumBarController?: ComponentConstructor[];
  mediumMediumBarController?: ComponentConstructor[];
  rightMediumBarController?: ComponentConstructor[];
  subtitles?: Subtitles[];
  plugins?: Plugin[];
};

export type Subtitles = {
  default?: boolean;
  tip: string;
  source: string;
  lang: "zh" | "en" | "jp";
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
  instance? : SubsettingItem;
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
}

// 存储内置组件的ID，用于在用户注册组件时区分是自定义组件还是内置组件
export type BuiltInComponentID =
  | "PlayButton"
  | "Playrate"
  | "Volume"
  | "FullScreen"
  | "DutaionShow"
  | "SubSetting"
  | "VideoShot"
  | "ScreenShot"
  | "PicInPic"
  | "FullPage"
  | "FullScreen";

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
}

// 注册组件时的选项
export type RegisterComponentOptions = {
  mode: TopToolBarOptions | BottomToolBarOptions | AnyPositionOptions;
  index?: number;
};

// 更新组件时的选项
export type UpdateComponentOptions = {
  replaceElType?: "replaceOuterHTMLOfComponent" | "replaceInnerHTMLOfComponent";
};
