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
     * @desc contains方法则是为了以后的碰撞检测做准备
     */
    public abstract contains(point: { x: number, y: number }): boolean;

    constructor() {
        super();
    }
}