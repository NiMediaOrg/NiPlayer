import { Graphics, GraphicsType } from "./Graphics";

export class Circle extends Graphics {
    public type: GraphicsType = GraphicsType.Circle;
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };
    public contains(point: { x: number; y: number; }): boolean {
        const { x, y } = point;
        const node = this.findNearPositionNode(this.style.position);
        let dx = this.style.x + (node?.style?.x || 0);
        let dy = this.style.y + (node?.style?.y || 0);
        if (
            (x - dx) * (x - dx) + (y - dy) * (y - dy) <
            this.style.radius * this.style.radius
        ) {
            return true
        } else {
            return false
        }
    }
    public innerText: string = '';

    constructor(x: number, y: number, radius: number) {
        super();
        this.style.x = x;
        this.style.y = y;
        this.style.radius = radius;
        this.anchor.x = x;
        this.anchor.y = y;
    }

    public drawContent(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.style.color;
        context.globalAlpha = this.style.opacity;
        const node = this.findNearPositionNode(this.style.position);
        let x = this.style.x + (node?.style?.x || 0);
        let y = this.style.y + (node?.style?.y || 0);
        context.beginPath();
        context.arc(x, y, this.style.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }

    public drawText(context: CanvasRenderingContext2D): void {

    }
}