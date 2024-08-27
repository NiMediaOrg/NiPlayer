export type TMatrixRow = [number, number, number];
export type TMatrix = [TMatrixRow, TMatrixRow, TMatrixRow];
/**
 * @desc 渲染引擎中的矩阵类（3x3矩阵），用于进行各种图形变换
 */
export class Matrix {
    constructor(public matrix: TMatrix) {}
    /**
     * @desc 矩阵的左乘运算
     * @param matrix 
     * @returns 
     */
    multiply(matrix: Matrix) {
        const result: TMatrix = [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ];
        // 矩阵的左乘运算
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < matrix.matrix[0].length; j++) {
                result[i][j] = this.matrix[i][0] * matrix.matrix[0][j] + this.matrix[i][1] * matrix.matrix[1][j] + this.matrix[i][2] * matrix.matrix[2][j];
            }
        }
        this.matrix = result;
        return this;
    }
}