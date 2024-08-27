import {  GraphicsType } from "./Graphics";
import { Polygon } from "./Polygon";

export class Rectangle extends Polygon {
    public type: GraphicsType = GraphicsType.Rectangle;
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };
    public contains(point: { x: number; y: number; }): boolean {
        return super.contains(point);
    }
    public innerText: string = '';

    constructor(
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        super([]);
        this.style.height = height;
        this.style.width = width;
        this.style.x = x;
        this.style.y = y;
        this.anchor.x = x + width / 2;
        this.anchor.y = y + height / 2;
    }

    public drawContent(context: CanvasRenderingContext2D): void {
        this.points = [
            {
                x: this.style.x,
                y: this.style.y
            },
            {
                x: this.style.x + this.style.width,
                y: this.style.y
            },
            {
                x: this.style.x + this.style.width,
                y: this.style.y + this.style.height
            },
            {
                x: this.style.x,
                y: this.style.y + this.style.height
            }
        ]
        super.drawContent(context);
    }

    public drawText(context: CanvasRenderingContext2D) {
        if (!this.innerText) {
            return;
        }
        context.save();
        context.beginPath();
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.font = this.style.font ?? '25px Arial';
        context.fillStyle = 'black';
        context.fillText(this.innerText, this.style.x, this.style.y + 10);
        context.fill();
        const { actualBoundingBoxAscent, actualBoundingBoxDescent, actualBoundingBoxLeft, actualBoundingBoxRight } = context.measureText(this.innerText);
        const height = actualBoundingBoxAscent + actualBoundingBoxDescent;
        const width = actualBoundingBoxLeft + actualBoundingBoxRight;
        if (width > this.style.width && this.style.overflow === 'hidden') {
            context.clearRect(this.style.x + this.style.width, this.style.y + 10, width - this.style.width + 5, height + 5);
        }
        context.closePath();
        context.restore();
    }
}