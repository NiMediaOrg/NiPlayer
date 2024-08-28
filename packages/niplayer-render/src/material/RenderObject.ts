import EventEmitter from "eventemitter3";
import { observable } from "../reactivity/observer";
import { Matrix } from "../transform/Matrix";
import { PriorityQueue } from "../utils/priority-queue";
import { EventMap } from "../events/MouseEvent";
export interface ITransform {
    translateX?: number;
    translateY?: number;
    scaleX?: number;
    scaleY?: number;
    rotate?: number;
    skewX?: number;
    skewY?: number;
}

export interface IRenderObject {
    width?: number;
    height?: number;
    opacity?: number;
    color?: string;
    zIndex?: number;
    x?: number;
    y?: number;
    position?: 'absolute' | 'relative' | 'static' | 'fixed';
    overflow?: 'hidden' | 'none' | 'scroll';
    radius?: number;
    [key: string]: any;
}

/**
 * @desc canvas渲染对象的抽象基类
 */
export abstract class RenderObject extends EventEmitter {
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
    /**
     * @desc 渲染对象的变换策略
     */
    public transform: ITransform = {};
    /**
     * @desc 渲染对象的变换矩阵
     */
    public matrix: Matrix;

    public abstract anchor: { x: number, y: number };
    /**
     * @desc contains方法则是为了以后的碰撞检测做准备
     */
    public abstract contains(point: { x: number, y: number }): boolean;

    public get composedPath(): RenderObject[] {
        const path = [];
        let top = this as RenderObject;
        while(top) {
            path.push(top);
            top = top.parent;
        }

        return path;
    }

    public draw(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        this.setTransform(context);
        this.drawContent(context);
        context.closePath();
        context.restore();
        this.children.forEach(child => child.draw(context));
    }

    /**
     * @desc 设置渲染对象的矩阵变换
     * @param context 
     */
    public setTransform(context: CanvasRenderingContext2D) {
        // 1. 旋转变换
        const rotationMatrix = new Matrix([
            [Math.cos(Math.PI / 180 * this.transform.rotate), -Math.sin(Math.PI / 180 * this.transform.rotate), 0],
            [Math.sin(Math.PI / 180 * this.transform.rotate), Math.cos(Math.PI / 180 * this.transform.rotate), 0],
            [0, 0, 1]
        ]);
        // 2. 缩放变换
        const scaleMatrix = new Matrix([
            [this.transform.scaleX, 0, 0],
            [0, this.transform.scaleY, 0],
            [0, 0, 1]
        ]);

        //* 先进行父元素的变化, 再进行子元素自己的变化
        let matrix = rotationMatrix.multiply(scaleMatrix);
        // 进行平移变换
        const dx = this.anchor.x - (this.anchor.x * matrix.matrix[0][0] + this.anchor.y * matrix.matrix[0][1]) + this.transform.translateX;
        const dy = this.anchor.y - (this.anchor.x * matrix.matrix[1][0] + this.anchor.y * matrix.matrix[1][1]) + this.transform.translateY;
        this.matrix = new Matrix([
            [matrix.matrix[0][0], matrix.matrix[0][1], dx],
            [matrix.matrix[1][0], matrix.matrix[1][1], dy],
            [0, 0, 1]
        ]).multiply(this.parent.matrix);
        context.setTransform(this.matrix.matrix[0][0], this.matrix.matrix[1][0], this.matrix.matrix[0][1], this.matrix.matrix[1][1], this.matrix.matrix[0][2], this.matrix.matrix[1][2]);
    }

    public abstract drawContent(context: CanvasRenderingContext2D): void;

    constructor() {
        super();
        this.children = new PriorityQueue<RenderObject>((a, b) => a.style.zIndex < b.style.zIndex);
        this.style = observable(this.style);
        this.transform = observable(this.transform);
        this.style.position = 'static';
        this.style.zIndex = 0;
        this.style.x = 0;
        this.style.y = 0;
        this.style.width = 0;
        this.style.height = 0;
        this.style.color = 'black';
        this.style.opacity = 1;
        this.style.overflow = 'none';
        this.style.opacity = 1;

        this.transform.rotate = 0;
        this.transform.scaleX = 1;
        this.transform.scaleY = 1;
        this.transform.translateX = 0;
        this.transform.translateY = 0;

        this.matrix = new Matrix([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ])
    }

    protected findNearPositionNode(type: IRenderObject['position']): RenderObject {
        let node = this as RenderObject;
        if (type === 'static') return node.parent;
        if (type === 'fixed') return null;
        while (node.parent) {
            node = node.parent;
            if (node.style.position === 'relative' || node.style.position === 'absolute') {
                return node;
            }
        }
        return null;
    }

    /**
     * @description 判断由x,y引出的水平向右的射线是否和x1,y1,x2,y2形成的线段相交
     * @param x {number}
     * @param y {number}
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     */
    protected isInteract(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
        if ((y1 < y && y2 < y) || (y1 > y && y2 > y) || (x > x1 && x > x2)) {
            return false;
        }

        if (x1 > x && x2 > x) {
            return true;
        }

        const ox = x2 - (x2 - x1) * (y2 - y) / (y2 - y1);
        return x < ox;
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

    public addEventListener<K extends keyof EventMap>(type: K, listener: EventMap[K], options?: AddEventListenerOptions) {
        if (typeof options === 'object' && options.once) {
            this.once(type, listener);
        } else {
            this.on(type, listener);
        }
    }

    public removeEventListener<K extends keyof EventMap>(type: K, listener: EventMap[K], options?: AddEventListenerOptions) {
        this.off(type, listener);
    }
}