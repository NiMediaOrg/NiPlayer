import { observable } from "../reactivity/observer";
import { PriorityQueue } from "../utils/priority-queue";

export interface IRenderObject {
    width?: number;
    height?: number;
    opacity?: number;
    color?: string;
    zIndex?: number;
    x?: number;
    y?: number;
    position?: 'absolute' |'relative' | 'static' | 'fixed';
    overflow?: 'hidden' | 'none' | 'scroll';
    [key: string]: any;
}

/**
 * @desc canvas渲染对象的抽象基类
 */
export abstract class RenderObject {
    /**
     * @desc 渲染对象的子元素
     */
    public children: PriorityQueue<RenderObject>;
    /**
     * @desc 渲染对象的父元素
     */
    public parent: RenderObject | null = null;
    /**
     * 渲染对象的样式
     */
    public style: IRenderObject = {};

    public abstract draw(context: CanvasRenderingContext2D): void;

    constructor() {
        this.children = new PriorityQueue<RenderObject>((a, b) => a.style.zIndex < b.style.zIndex);
        this.style = observable(this.style);
        this.style.position = 'static';
        this.style.zIndex = 0;
        this.style.x = 0;
        this.style.y = 0;
        this.style.width = 0;
        this.style.height = 0;
        this.style.color = 'black';
        this.style.opacity = 1;
        this.style.overflow = 'none';
    }

    protected findNearPositionNode(type: IRenderObject['position']): RenderObject {
        let node = this as RenderObject;
        while (node.parent) {
            node = node.parent;
            if (node.style.position === type) {
                return node;
            }
        }
        return null;
    }
    /**
     * @desc 添加子节点
     * @param child 
     */
    public appendChild(child: RenderObject) {
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children.push(child);
    } 
    /**
     * @desc 移除子节点
     * @param child 
     */
    public removeChild(child: RenderObject) {
        this.children.delete(child);
    }
}