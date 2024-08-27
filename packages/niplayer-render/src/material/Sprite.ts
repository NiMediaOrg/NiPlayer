import { RenderObject } from "./RenderObject";
/**
 * @desc 精灵图类型, 用于构造多种特效
 */
export class Sprite extends RenderObject {
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };

    private image: HTMLImageElement;

    constructor(x: number, y: number, width?: number, height?: number) {
        super();
        this.style.x = x;
        this.style.y = y;
        this.style.width = width ?? 0;
        this.style.height = height ?? 0;
        this.anchor.x = x + width / 2;
        this.anchor.y = y + height / 2;
    }
    public drawContent(context: CanvasRenderingContext2D): void {
        // console.log('@@@')
        if (!this.image) {
            this.image = new Image();
            this.image.src = 'https://pixijs.com/assets/bunny.png';
            this.style.width = this.image.width;
            this.style.height = this.image.height;
        }
        // 暂时使用canvas 2d进行绘制
        context.drawImage(this.image, this.style.x, this.style.y, this.style.width, this.style.height)
    }
}