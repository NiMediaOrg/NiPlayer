import { mat4, vec3 } from "gl-matrix";

export class Vector {
    constructor(public data: number[] = [0,0,0]) {
        if (data.length!== 3) throw new Error('pos length must be 3');
    }

    public clone() {
        return new Vector([...this.data]);
    }

    static lookAt(camera: Vector, target: Vector, up: Vector) {
        // const z = target.clone().sub(camera).normalize();
        // const x = up.clone().cross(z).normalize();
        // const y = x.clone().cross(z).normalize();
        // return new Matrix4([
        //     x.data[0], y.data[0], z.data[0], camera.data[0],
        //     x.data[1], y.data[1], z.data[1], camera.data[1],
        //     x.data[2], y.data[2], z.data[2], camera.data[2],
        //     0, 0, 0, 1
        // ]);
        const z = vec3.create();
        const y = vec3.fromValues(up[0], up[1], up[2]);
        const x = vec3.create();
        vec3.sub(z, vec3.fromValues(camera[0], camera[1], camera[2]), vec3.fromValues(target[0], target[1], target[2]));
        vec3.normalize(z, z);
        vec3.cross(x, y, z);
        vec3.normalize(x, x);
        vec3.cross(y, z, x);
        vec3.normalize(y, y);
        return mat4.fromValues(
            x[0], x[1], x[2], 0,
            y[0], y[1], y[2], 0,
            z[0], z[1], z[2], 0,
            camera[0], camera[1], camera[2], 1
        );
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