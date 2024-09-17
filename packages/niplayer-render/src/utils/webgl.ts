/**
 * @desc 创建着色器-顶点着色器 OR 片源着色器
 */
export function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    const info = gl.getShaderInfoLog(shader);
    console.error('着色器编译失败:', info);
    gl.deleteShader(shader);
}

export function createProgramFromSource(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    const program = gl.createProgram();
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 链接程序
    gl.linkProgram(program);
    // 检查程序是否链接成功
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        const info = gl.getProgramInfoLog(program);
        console.error('程序链接失败:', info);
        gl.deleteProgram(program);
    }
    gl.useProgram(program);

    return program;
}

/**
 * @description 创建将原始坐标转化到webgl坐标的矩阵（裁剪矩阵）
 * @param width 
 * @param height 
 * @returns 
 */
export function createCoordinateMatrix(width: number, height: number, depth?: number) {
    const l = 0, r = width, t = height, b = 0, n = 0, f = depth;

    return [
        2 / (r - l), 0, 0, 0,
        0, 2 / (t - b), 0, 0,
        0, 0, 2 / (f - n), 0,
        -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1
    ]
}