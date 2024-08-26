import { RenderObject } from "./RenderObject";
export enum GraphicsType {
    Rectangle = 1,
    Circle = 2,
    Line = 3,
    Text = 4,
    Image = 5,
    Polygon = 6,
    Path = 7,
}

export abstract class Graphics extends RenderObject {
    public abstract type: GraphicsType;

    public abstract anchor: {x: number, y: number};
    /**
     * @desc 几何图形其中的文本
     */
    public abstract innerText: string;
    /**
     * @desc contains方法则是为了以后的碰撞检测做准备
     */
    public abstract contains(point: { x: number, y: number }): boolean;
    /**
     * @desc 将文本绘制到其中
     * @param context 
     */
    public abstract drawText(context: CanvasRenderingContext2D): void;
}