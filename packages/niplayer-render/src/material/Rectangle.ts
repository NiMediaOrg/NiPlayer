import { Graphics, GraphicsType } from "./Graphics";

export class Rectangle extends Graphics {
    public type: GraphicsType = GraphicsType.Rectangle;
    public contains(point: { x: number; y: number; }): boolean {
        //ToDo Complete
        // 矩形碰撞检测
        // 矩形的左上角坐标为(x, y)，右下角坐标为(x + width, y + height)
        
        // 点的坐标为(x1, y1)
        const { x, y, width, height } = this;
        const { x: x1, y: y1 } = point;
        // 点在矩形内部
        if (x1 >= x && x1 <= x + width && y1 >= y && y1 <= y + height) {
            return true;
        }
        // 点在矩形外部
        return false;

    }
    constructor(
        public x: number, 
        public y: number,
        public width: number, 
        public height: number
    ) {
        super();
    }

    public draw(): void {
        
    }
}