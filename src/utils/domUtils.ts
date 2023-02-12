import { wrap, addEventListener } from "ntouch.js"
import { ExternalHTMLElement } from "ntouch.js/lib/types";
import {
  ComponentItem,
  DOMProps,
  getFunctionParametersType,
  Node,
  UpdateComponentOptions,
} from "../types/Player";
export function getDOMPoint(dom: HTMLElement): { x: number; y: number } {
  let rect = dom.getBoundingClientRect();
  return {x:rect.left,y:rect.top}
}

/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent
 * @param topChild
 * @param pageX
 * @param pageY
 * @returns {boolean}
 */
export function checkIsMouseInRange(
  parent: HTMLElement,
  topChild: HTMLElement,
  bottom: number,
  pageX: number,
  pageY: number
) {
  let { x, y } = getDOMPoint(parent);
  let allTop = y - bottom - topChild.clientHeight;
  let allBottom = y + parent.clientHeight;
  let allLeft =
    x +
    Math.round(parent.clientWidth / 2) -
    Math.round(topChild.clientWidth / 2);
  let allRight =
    x +
    Math.round(parent.clientWidth / 2) +
    Math.round(topChild.clientWidth / 2);
  let parentLeft = x;
  let parentRight = x + parent.clientWidth;
  if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop)
    return true;
  if (
    pageX >= parentLeft - 5 &&
    pageX <= parentRight + 5&&
    pageY >= y - 5 &&
    pageY <= allBottom + 5
  )
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
export function $<T extends ExternalHTMLElement>(
  desc?: string,
  props?: DOMProps,
  children?: string | Array<Node>
): T {
  let match = [];
  let regArray = SELECTOR_REG.exec(desc);
  match[0] = regArray[1] || undefined;
  match[1] = regArray[2] || undefined;
  match[2] = regArray[3] || undefined;
  let el = match[0]
    ? document.createElement(match[0])
    : document.createElement("div");
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
      } else {
      }
    } else {
      el.setAttribute(key, String(props[key]));
    }
  }
  if (typeof children === "string") {
    el.innerHTML += children;
  } else if (children) {
    for (let child of children) {
      el.appendChild(child.el);
    }
  }

  return el;
}
/**
 * @description 根据传入的字符串获取对应的DOM元素
 * @param dom
 * @returns {HTMLElement | null}
 */
export function getEl(dom: HTMLElement | string): HTMLElement | null {
  if (dom instanceof HTMLElement) return dom;
  if (typeof dom === "string") {
    return document.querySelector(dom);
  }
}

export function addClass(dom: Element, classNames: Array<string>) {
  let classList = dom.classList;
  for (let name of classNames) {
    if (!includeClass(dom, name)) {
      classList.add(name);
    }
  }
}

export function removeClass(dom: Element, classNames: Array<string>) {
  let classList = dom.classList;
  classList.remove(...classNames);
}

export function changeClass(dom: Element, className) {
  dom.className = className;
}

export function includeClass(dom: Element, className: string): boolean {
  let classList = dom.classList;
  for (let key in classList) {
    if (classList[key] === className) return true;
  }
  return false;
}

export function containsDOM(dom: Element, child: Element): boolean {
  if(dom.childNodes.length > 0) {
    dom.childNodes.forEach(node => {
      if(node !== child) {
        if(containsDOM(node as Element,child) === true) return true;
      } else return true;
    })
  }
  return false;
}

export function getElementSize(dom: HTMLElement): {
  width: number;
  height: number;
} {
  const clone = dom.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.opacity = "0";
  clone.removeAttribute("hidden");

  const parent = dom.parentNode || document.body;

  parent.appendChild(clone);

  const rect = clone.getBoundingClientRect();

  parent.removeChild(clone);

  return rect;
}

const svgNS = "http://www.w3.org/2000/svg";

export function createSvg(d?: string, viewBox = "0 0 24 24"): SVGSVGElement {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", viewBox);
  if (d) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttributeNS(null, "d", d);
    svg.appendChild(path);
  }
  return svg;
}

export function setSvgPath(svg: SVGSVGElement, d: string) {
  const path = svg.getElementsByTagNameNS(svgNS, "path")[0];
  path.setAttributeNS(null, "d", d);
}

export function createSvgs(d: string[], viewBox = "0 0 24 24"): SVGSVGElement {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", viewBox);
  for (let str of d) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttributeNS(null, "d", str);
    svg.appendChild(path);
  }
  return svg;
}
/**
 * @description 合并两个组件的实例对象
 * @param target
 * @param another
 */
export function patchComponent(
  target: ComponentItem,
  another: Partial<ComponentItem>,
  options?: UpdateComponentOptions
) {
  if (target.id !== another.id) throw new Error("需要合并的两个组件的id不相同");
  let replaceElementType =
    options?.replaceElType || "replaceOuterHTMLOfComponent";
  for (let key in another) {
    if (key in target) {
      if (key === "props") {
        patchDOMProps(target[key], another[key], target.el);
      } else if (key === "el") {
        if (replaceElementType === "replaceOuterHTMLOfComponent") {
          target.el = another.el;
        } else {
          for (let child of target.el.childNodes) {
            target.el.removeChild(child);
          }
          target.el.appendChild(another.el);
        }
      } else {
        if (target[key] instanceof Function) {
          if (!(another[key] instanceof Function)) {
            throw new Error(`属性${key}对应的值应该为函数类型`);
          }
          console.log("合并函数", another[key]);
          target[key] = patchFn(target[key], another[key], target);
          target.resetEvent();
        } else if (target[key] instanceof HTMLElement) {
          if (
            !(another[key] instanceof HTMLElement) &&
            typeof another[key] !== "string"
          ) {
            throw new Error(`属性${key}对应的值应该为DOM元素或者字符串类型`);
          }
          if (typeof another[key] === "string") {
          } else {
            (target[key] as HTMLElement).parentNode?.insertBefore(
              another[key],
              target[key]
            );
            (target[key] as HTMLElement).parentNode?.removeChild(target[key]);
            target[key] = another[key];
          }
        }
      }
    } else {
    }
  }
}

export function patchDOMProps(
  targetProps: DOMProps,
  anotherProps: DOMProps,
  el: HTMLElement
) {
  for (let key in anotherProps) {
    if (targetProps.hasOwnProperty(key)) {
      if (key === "id") {
        targetProps.id = anotherProps.id;
        el.id = targetProps.id;
      } else if (key === "className") {
        targetProps.className.concat(anotherProps.className);
        addClass(el, anotherProps.className);
      } else if (key === "style") {
        patchStyle(targetProps.style, anotherProps.style, el);
      }
    } else {
      targetProps[key] = anotherProps[key];
      if (key !== "style") {
        el[key] = anotherProps[key];
      } else if (key === "style") {
        for (let prop in anotherProps["style"]) {
          el.style[prop] = anotherProps["style"][prop];
        }
      }
    }
  }
}

export function patchStyle(
  targetStyle: Partial<CSSStyleDeclaration>,
  anotherStyle: Partial<CSSStyleDeclaration>,
  el: HTMLElement
) {
  for (let key in anotherStyle) {
    targetStyle[key] = anotherStyle[key];
  }
  for (let key in targetStyle) {
    el.style[key] = targetStyle[key];
  }
}

export function patchFn<T extends (...args: any[]) => any>(
  targetFn: T,
  anotherFn: T,
  context: ComponentItem
) {
  // let args = targetFn.arguments;
  console.log(targetFn, anotherFn, context);
  function fn(...args: getFunctionParametersType<T>[]) {
    targetFn.call(context, ...args);
    anotherFn.call(context, ...args);
  }

  return fn.bind(context) as T;
}
