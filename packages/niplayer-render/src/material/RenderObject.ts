import { observable } from "../reactivity/observer";
import { Matrix } from "../transform/Matrix";
import { PriorityQueue } from "../utils/priority-queue";

type TScale = `scale(${number}, ${number})`;
type TTranslate = `translate(${number}, ${number})`;
type TRotate = `rotate(${number}deg)`;
type TSkew = `skew(${number}, ${number})`;
type TTransform = TScale | TTranslate | TRotate | TSkew;
//TODO 给予更好的类型提示
type TTransformStr = string; 

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
    /**
     * @desc 渲染对象的变换策略
     */
    public transform: ITransform = {};
    /**
     * @desc 渲染对象的变换矩阵
     */
    public matrix: Matrix;

    public draw(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        this.drawContent(context);
        context.closePath();
        context.restore();
        this.children.forEach(child => child.draw(context));
    }

    public abstract drawContent(context: CanvasRenderingContext2D): void;

    constructor() {
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

        this.transform.rotate = 0;
        this.transform.scaleX = 1;
        this.transform.scaleY = 1;
        this.transform.translateX = 0;
        this.transform.translateY = 0;

        this.matrix = new Matrix([
            [1,0,0],
            [0,1,0],
            [0,0,1]
        ])
    }

    protected findNearPositionNode(type: IRenderObject['position']): RenderObject {
        let node = this as RenderObject;
        if (type === 'static') return node.parent;
        if (type ==='fixed') return null;
        while (node.parent) {
            node = node.parent;
            if (node.style.position === 'relative' || node.style.position ==='absolute') {
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