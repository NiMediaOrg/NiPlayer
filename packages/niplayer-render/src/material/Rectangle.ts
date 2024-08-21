import { Graphics, GraphicsType } from "./Graphics";

export class Rectangle extends Graphics {
    public type: GraphicsType = GraphicsType.Rectangle;
    public contains(point: { x: number; y: number; }): boolean {
        return true;
    }

    constructor(
        x: number, 
        y: number,
        width: number, 
        height: number
    ) {
        super();
        this.style.height = height;
        this.style.width = width;
        this.style.left = x;
        this.style.top = y;
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.save();
        context.beginPath();
        this.style.color && (context.fillStyle = this.style.color);
        this.style.opacity && (context.globalAlpha = this.style.opacity);
        context.fillRect(this.style.left, this.style.top, this.style.width, this.style.height);
        context.closePath();
        context.restore();
        this.children.forEach(child => child.draw(context));
    }
}