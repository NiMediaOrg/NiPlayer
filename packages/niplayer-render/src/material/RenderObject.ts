import { PriorityQueue } from "../utils/priority-queue";

export interface IRenderObject {
    width?: number;
    height?: number;
    opacity?: number;
    color?: string;
    zIndex?: number;
    left?: number;
    top?: number;
    [key: string]: any;
}

/**
 * @desc canvas渲染对象的抽象基类
 */
export abstract class RenderObject {
    /**
     * @desc 渲染对象的子元素
     */
    protected children: PriorityQueue<RenderObject>;
    /**
     * @desc 渲染对象的父元素
     */
    protected parent: RenderObject | null = null;
    /**
     * 渲染对象的样式
     */
    public style: IRenderObject = {};

    public abstract draw(context: CanvasRenderingContext2D): void;

    constructor() {
        this.children = new PriorityQueue<RenderObject>((a, b) => a.style.zIndex < b.style.zIndex);
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