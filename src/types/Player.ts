import { Component } from "../class/Component";
import { Player } from "../page/player";

export type PlayerOptions = {
  url: string;
  container: HTMLElement;
  autoplay?: boolean;
  width?: string;
  height?: string;
  leftControllers?: (ComponentConstructor | string)[];
  rightControllers?: (ComponentConstructor | string)[];
  plugins?: Plugin[];
};

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
