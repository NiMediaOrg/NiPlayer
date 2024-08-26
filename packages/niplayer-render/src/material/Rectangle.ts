import { Matrix } from "../transform/Matrix";
import { Graphics, GraphicsType } from "./Graphics";

export class Rectangle extends Graphics {
    public type: GraphicsType = GraphicsType.Rectangle;
    public anchor: { x: number; y: number; } = {x: 0, y: 0};
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
        this.style.color && (context.fillStyle = this.style.color);
        this.style.opacity && (context.globalAlpha = this.style.opacity);
        const node = this.findNearPositionNode(this.style.position);
        let x = this.style.x + (node?.style?.x || 0);
        let y = this.style.y + (node?.style?.y || 0);
        // 1. 旋转变换
        const rotationMatrix = new Matrix([
            [Math.cos(Math.PI / 180 * this.transform.rotate), -Math.sin(Math.PI / 180 * this.transform.rotate), 0],
            [Math.sin(Math.PI / 180 * this.transform.rotate), Math.cos(Math.PI / 180 * this.transform.rotate), 0],
            [0, 0, 1]
        ]);
        // 2. 缩放变换
        const scaleMatrix = new Matrix([
            [this.transform.scaleX, 0, 0],
            [0, this.transform.scaleY, 0],
            [0, 0, 1]
        ]);

        //* 先进行父元素的变化, 再进行子元素自己的变化
        let matrix = rotationMatrix.multiply(scaleMatrix);
        // 进行平移变换
        const dx = this.anchor.x - (this.anchor.x * matrix.matrix[0][0] + this.anchor.y * matrix.matrix[0][1]) + this.transform.translateX;
        const dy = this.anchor.y - (this.anchor.x * matrix.matrix[1][0] + this.anchor.y * matrix.matrix[1][1]) + this.transform.translateY;
        this.matrix = new Matrix([
            [matrix.matrix[0][0], matrix.matrix[0][1], dx],
            [matrix.matrix[1][0], matrix.matrix[1][1], dy],
            [0, 0, 1]
        ]).multiply(this.parent.matrix);
        context.setTransform(this.matrix.matrix[0][0], this.matrix.matrix[1][0], this.matrix.matrix[0][1], this.matrix.matrix[1][1], this.matrix.matrix[0][2], this.matrix.matrix[1][2]);
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