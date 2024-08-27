import { Graphics, GraphicsType } from "./Graphics";

export class Polygon extends Graphics {
    public type: GraphicsType = GraphicsType.Polygon;
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };
    public innerText: string = '';

    public contains(point: { x: number; y: number; }): boolean {
        let count = 0;
        for (let i = 0; i < this.points.length; i++) {
            const x1 = this.points[i].x;
            const y1 = this.points[i].y;
            const x2 = this.points[(i + 1) % this.points.length].x;
            const y2 = this.points[(i + 1) % this.points.length].y;
            const x3 = point.x;
            const y3 = point.y; 
            if (this.isInteract(x3, y3, x1, y1, x2, y2)) {
                count++;
            }
        }
        return count % 2 !== 0;
    }
    public points: { x: number; y: number; }[] = [];

    constructor(points: { x: number; y: number; }[]) {
        super();
        this.points = points;
    }

    public drawContent(context: CanvasRenderingContext2D): void {
        context.fillStyle = this.style.color;
        context.globalAlpha = this.style.opacity;

        const node = this.findNearPositionNode(this.style.position);
        const x = this.points[0].x + (node?.style.x || 0);
        const y = this.points[0].y + (node?.style.y || 0);
        context.moveTo(x, y);
        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x + (node?.style.x || 0), this.points[i].y + (node?.style.y || 0));
        }
        context.fill();
    }

    public drawText(context: CanvasRenderingContext2D): void { }
}