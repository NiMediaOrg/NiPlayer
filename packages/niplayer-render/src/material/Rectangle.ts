import { Graphics, GraphicsType } from "./Graphics";

export class Rectangle extends Graphics {
    public type: GraphicsType = GraphicsType.Rectangle;
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
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.save();
        context.beginPath();

        this.style.color && (context.fillStyle = this.style.color);
        this.style.opacity && (context.globalAlpha = this.style.opacity);
        const node = this.findNearPositionNode(this.style.position);
        const x = this.style.x + (node?.style?.x || 0);
        const y = this.style.y + (node?.style?.y || 0);
        context.fillRect(x, y, this.style.width, this.style.height);
        context.closePath();
        context.restore();
        this.drawText(context);
        this.children.forEach(child => child.draw(context));
    }

    drawText(context: CanvasRenderingContext2D) {
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