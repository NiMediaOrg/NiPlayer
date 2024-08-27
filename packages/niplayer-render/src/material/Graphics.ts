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
    /**
     * @desc 几何图形其中的文本
     */
    public abstract innerText: string;
    /**
     * @desc 将文本绘制到其中
     * @param context 
     */
    public abstract drawText(context: CanvasRenderingContext2D): void;
}