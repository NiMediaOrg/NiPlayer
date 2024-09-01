let buffer: WebGLBuffer;
export function createWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) throw new Error('your browser not support webgl');
    (gl as WebGLRenderingContext).viewport(0, 0, canvas.width, canvas.height);
    return gl as WebGLRenderingContext;
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // 检查着色器是否编译成功
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const info = gl.getShaderInfoLog(shader);
        console.error('着色器编译失败:', info);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createProgramFromSource(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
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

export function createBuffer(gl: WebGLRenderingContext) {
    if (buffer) return buffer;
    // 创建webgl缓冲区
    buffer = gl.createBuffer();
    // 绑定缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    return buffer;
}
/**
 * @description 创建将原始坐标转化到webgl坐标到矩阵
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
/**
 * @description 创建平移矩阵
 * @param x 
 * @param y 
 * @returns 
 */
export function createTranslateMatrix(x: number, y: number) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, 0, 1
    ]
}

export function createTranslate3DMatrix(dx: number, dy: number, dz: number) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        dx, dy, dz, 1
    ]
}
/**
 * @description 创建缩放矩阵
 * @param x 
 * @param y 
 * @returns 
 */
export function createScaleMatrix(x: number, y: number) {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

export function createScale3DMatrix(x: number, y: number, z: number) {
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ]
}
/**
 * @description 创建2d的旋转矩阵,2d的旋转默认是根据z轴进行旋转
 * @param angle 
 * @returns 
 */
export function createRotateMatrix(angle: number) {
    const radian = angle * Math.PI / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return [
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

// 创建3d场景的旋转矩阵
export function createRotate3DMatrix(angle: number, axis: 'x' | 'y' | 'z') {
    const radian = angle * Math.PI / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    switch (axis) {
        case 'x':
            return [
                1, 0, 0, 0,
                0, cos, -sin, 0,
                0, sin, cos, 0,
                0, 0, 0, 1
            ]
        case 'y':
            return [
                cos, 0, sin, 0,
                0, 1, 0, 0,
                -sin, 0, cos, 0,
                0, 0, 0, 1
            ]
        case 'z':
            return [
                cos, -sin, 0, 0,
                sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]
        default:
            throw new Error('axis must be x, y or z');
    }
}

export function createFrameBuffer(gl: WebGLRenderingContext, width: number, height: number) {
    //!! 创建帧缓冲区对象
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    //!! 这里的texture就是颜色关联对象，它替代了颜色缓冲区
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 设置材质，这样我们可以对任意大小的图像进行像素操作
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // 将纹理对象texture和绘制缓冲区对象frameBuffer进行绑定；
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return [
        framebuffer,
        texture
    ]
}