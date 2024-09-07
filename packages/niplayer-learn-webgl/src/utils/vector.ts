import { Matrix4 } from "./matrix";

export class Vector {
    constructor(public data: number[] = [0,0,0]) {
        if (data.length!== 3) throw new Error('pos length must be 3');
    }

    public clone() {
        return new Vector([...this.data]);
    }

    static lookAt(camera: Vector, target: Vector, up: Vector) {
        const z = target.clone().sub(camera).normalize();
        const x = up.clone().cross(z).normalize();
        const y = x.clone().cross(z).normalize();
        return new Matrix4([
            x.data[0], y.data[0], z.data[0], camera.data[0],
            x.data[1], y.data[1], z.data[1], camera.data[1],
            x.data[2], y.data[2], z.data[2], camera.data[2],
            0, 0, 0, 1
        ]);
    }

    /**
     * @desc 向量相加
     * @param vector
     * @returns
     */
    public add(vector: Vector) {
        const result = new Vector();
        for (let i = 0; i < 3; i++) {
            result.data[i] = this.data[i] + vector.data[i];
        }
        this.data = result.data;
        return this;
    }

    /**
     * @desc 向量相减
     * @param vector
     * @returns
     */
    public sub(vector: Vector) {
        const result = new Vector();
        for (let i = 0; i < 3; i++) {
            result.data[i] = this.data[i] - vector.data[i];
        }
        this.data = result.data;
        return this;
    }

    /**
     * @desc 向量叉乘
     * @param vector
     * @returns
     */
    public cross(vector: Vector) {
        const result = new Vector();
        result.data[0] = this.data[1] * vector.data[2] - this.data[2] * vector.data[1];
        result.data[1] = this.data[2] * vector.data[0] - this.data[0] * vector.data[2];
        result.data[2] = this.data[0] * vector.data[1] - this.data[1] * vector.data[0];
        this.data = result.data;
        return this;
    }
    /**
     * @desc 向量归一化
     */
    public normalize() {
        const distance = Math.sqrt(this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2]);
        if (distance > 0.00001) {
            this.data[0] /= distance;
            this.data[1] /= distance;
            this.data[2] /= distance;
        } else {
            this.data[0] = 0;
            this.data[1] = 0;
            this.data[2] = 0;
        }

        return this;
    }
}