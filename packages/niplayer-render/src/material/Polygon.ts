import { Graphics, GraphicsType } from "./Graphics";

export class Polygon extends Graphics {
    public type: GraphicsType = GraphicsType.Polygon;
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };
    public innerText: string = '';

    public contains(point: { x: number; y: number; }): boolean {
        let count = 0;
        const points = this.points.map(point => {
            const vector = [point.x, point.y, 1];
            for (let i = 0; i < this.matrix.matrix.length; i++) {
                let sum = 0;
                for (let j = 0; j < this.matrix.matrix[0].length; j++) {
                    sum += this.matrix.matrix[i][j] * vector[j];
                }
                vector[i] = sum;
            }

            return {
                x: vector[0],
                y: vector[1]
            }
        })
        const node = this.findNearPositionNode(this.style.position);
        for (let i = 0; i < this.points.length; i++) {
            const x1 = points[i].x + (node?.style.x || 0);
            const y1 = points[i].y + (node?.style.y || 0);
            const x2 = points[(i + 1) % points.length].x + (node?.style.x || 0);
            const y2 = points[(i + 1) % points.length].y + (node?.style.y || 0);
            const x = point.x;
            const y = point.y;
            if (this.isInteract(x, y, x1, y1, x2, y2)) {
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