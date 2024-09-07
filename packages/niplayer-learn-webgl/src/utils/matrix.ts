export class Matrix4 {
    constructor(public data: number[] = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]) {
        if (data.length !== 16) throw new Error('data length must be 16');
    }

    /**
     * @desc 矩阵相乘
     * @param matrix 
     * @returns 
     */
    public multiply(matrix: Matrix4) {
        const result = new Matrix4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += this.data[i * 4 + k] * matrix.data[k * 4 + j];
                }
                result.data[i * 4 + j] = sum;
            }
        }
        this.data = result.data;
        return this;
    }

    /**
     * @desc 计算三阶行列式的值
     * @param data 
     * @returns 
     */
    static calculateMatrix3Value(data: number[]) {
        if (data.length !== 9) throw new Error('data length must be 9');
        return data[0] * (data[4] * data[8] - data[5] * data[7]) - data[1] * (data[3] * data[8] - data[5] * data[6]) + data[2] * (data[3] * data[7] - data[4] * data[6]);
    }

    static calculateMatrix4Value(data: number[]) {
        if (data.length!== 16) throw new Error('data length must be 16');
        return data[0] * this.calculateMatrix3Value(data.filter((val, index) => {
            if (Math.floor(index / 4) === 0 || index % 4 === 0) return false;
            return true;
        })) - data[1] * this.calculateMatrix3Value(data.filter((val, index) => {
            if (Math.floor(index / 4) === 1 || index % 4 === 1) return false;
            return true;
        })) + data[2] * this.calculateMatrix3Value(data.filter((val, index) => {
            if (Math.floor(index / 4) === 2 || index % 4 === 2) return false;
            return true;
        })) - data[3] * this.calculateMatrix3Value(data.filter((val, index) => {
            if (Math.floor(index / 4) === 3 || index % 4 === 3) return false;
            return true;
        }));
    }

    /**
     * @desc 求矩阵的逆
     * @param mat 
     * @returns {Matrix4}
     */
    static invertMatrix(mat: Matrix4): Matrix4 {
        const result = new Matrix4();
        const data = [];
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            data[i] = Math.pow(-1, row + col) * Matrix4.calculateMatrix3Value(mat.data.filter((val, index) => {
                if (Math.floor(index / 4) === row || index % 4 === col) return false;
                return true;
            }));
        }
        const value = Matrix4.calculateMatrix4Value(mat.data);
        result.data = data.map((val, index) => {
            return val / 1;
        })
        return Matrix4.transposeMatrix(result);

    }

    /**
     * @desc 实现矩阵的转置
     * @param matrix 
     */
    static transposeMatrix(matrix: Matrix4) {
        for (let i = 0; i < 4; i++) {
            let h = i, v = i;
            while (h >= 0 && v >= 0) {
                const temp = matrix.data[i * 4 + h];
                matrix.data[i * 4 + h] = matrix.data[v * 4 + i];
                matrix.data[v * 4 + i] = temp;
                h--;
                v--;
            }
        }

        return matrix;
    }

    /**
     * @desc 3d缩放矩阵
     * @param x 
     * @param y 
     * @param z 
     * @returns 
     */
    static createScale3DMatrix(x: number, y: number, z: number) {
        return new Matrix4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ])
    }

    /**
     * @desc 3d平移矩阵
     * @param x 
     * @param y 
     * @param z 
     * @returns 
     */
    static createTranslate3DMatrix(x: number, y: number, z: number): Matrix4 {
        return new Matrix4([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ])
    }

    /**
     * @desc 3d旋转矩阵
     * @param angle 
     * @param axis 
     * @returns 
     */
    static createRotate3DMatrix(angle: number, axis: 'x' | 'y' | 'z') {
        const radian = angle * Math.PI / 180;
        const cos = Math.cos(radian);
        const sin = Math.sin(radian);
        if (axis === 'x') {
            return new Matrix4([
                1, 0, 0, 0,
                0, cos, -sin, 0,
                0, sin, cos, 0,
                0, 0, 0, 1
            ])
        } else if (axis === 'y') {
            return new Matrix4([
                cos, 0, sin, 0,
                0, 1, 0, 0,
                -sin, 0, cos, 0,
                0, 0, 0, 1
            ])
        } else if (axis === 'z') {
            return new Matrix4([
                cos, -sin, 0, 0,
                sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ])
        }
    }

    /**
     * 创建一个透视投影矩阵,注意：透视矩阵本身就已经起到了一个裁剪矩阵的作用，故如果存在透视矩阵的话无需再创建裁剪矩阵！！！
     * @param fov 视野角度，以弧度为单位
     * @param aspect 宽高比，即宽度与高度的比例
     * @param near 近裁剪面距离
     * @param far 远裁剪面距离
     * @return 一个 4x4 的透视投影矩阵
     */
    static createPerspectiveMatrix(fov: number, aspect: number, near: number, far: number) {
        const f = 1 / Math.tan(fov / 2);
        return [
            -f / aspect, 0, 0, 0,
            0, -f, 0, 0,
            0, 0, (near + far) / (near - far), -1,
            0, 0, (2 * near * far) / (near - far), 0
        ];
    }
}