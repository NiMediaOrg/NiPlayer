import { Graphics, GraphicsType } from "./Graphics";

export class Circle extends Graphics {
    public type: GraphicsType = GraphicsType.Circle;
    public anchor: { x: number; y: number; } = { x: 0, y: 0 };
    public contains(point: { x: number; y: number; }): boolean {
        const { x, y } = point;
        const vector = [this.style.x, this.style.y, 1];
        for (let i = 0; i < this.matrix.matrix.length; i++) {
            let sum = 0;
            for (let j = 0; j < this.matrix.matrix[0].length; j++) {
                sum += this.matrix.matrix[i][j] * vector[j];
            }
            vector[i] = sum;
        }

        const node = this.findNearPositionNode(this.style.position);
        let dx = vector[0] + (node?.style?.x || 0);
        let dy = vector[1] + (node?.style?.y || 0);
        return (x - dx) * (x - dx) + (y - dy) * (y - dy) <
            this.style.radius * this.style.radius;

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

    public drawContent2d(context: CanvasRenderingContext2D): void {
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

    public drawContentWebgl(context: WebGL2RenderingContext): void {

    }

    public drawText(context: CanvasRenderingContext2D): void {

    }
}