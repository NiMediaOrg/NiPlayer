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

export function createBuffer(gl: WebGLRenderingContext, program: WebGLProgram, attribute: string, data: ArrayBuffer): [WebGLBuffer, number] {
    // 创建webgl缓冲区
    const buffer = gl.createBuffer();
    // 绑定缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // 数据写入缓冲区
    // gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    //  获取顶点属性的位置
    const location = gl.getAttribLocation(program, attribute);
    // 关联缓冲区和顶点属性
    return [buffer, location];
}