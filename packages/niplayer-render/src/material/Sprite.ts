import { RenderObject } from "./RenderObject";
/**
 * @desc 精灵图类型, 用于构造多种特效
 */
export class Sprite extends RenderObject {
    public anchor: { x: number; y: number; };
    public drawContent(context: CanvasRenderingContext2D): void {
        
    }
}