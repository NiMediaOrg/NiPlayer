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
  props: DOMProps;
  [props: string]: any;
}

export interface Node {
  id: string;
  el: HTMLElement;
}

export type Plugin = {
  install: (player: Player) => any;
};

export type registerOptions = {
  replaceElementType?:
    | "replaceOuterHTMLOfComponent"
    | "replaceInnerHTMLOfComponent";
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
