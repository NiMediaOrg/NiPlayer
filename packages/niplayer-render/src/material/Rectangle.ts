import { Graphics, GraphicsType } from "./Graphics";

export class Rectangle extends Graphics {
    public type: GraphicsType = GraphicsType.Rectangle;
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };
    public contains(point: { x: number; y: number; }): boolean {
        return true;
    }
    public innerText: string = '';

    constructor(
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        super();
        this.style.height = height;
        this.style.width = width;
        this.style.x = x;
        this.style.y = y;
        this.anchor.x = x + width / 2;
        this.anchor.y = y + height / 2;
    }

    public drawContent(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.style.color;
        context.globalAlpha = this.style.opacity;
        const node = this.findNearPositionNode(this.style.position);
        let x = this.style.x + (node?.style?.x || 0);
        let y = this.style.y + (node?.style?.y || 0);
        context.fillRect(x, y, this.style.width, this.style.height);
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