import "./index.less";
import { createBuffer, createCoordinateMatrix, createProgramFromSource } from "./utils";
import vertexShaderSource from "./shader/graphics.vertex.glsl";
import fragmentShaderSource from "./shader/graphics.fragment.glsl";
const dotArray = [];
interface IPoint {
    x: number;
    y: number;
}
/**
 * @description 绘制点
 * @param gl 
 * @param program 
 * @param point 
 */
function drawDot(gl: WebGLRenderingContext, program: WebGLProgram, point: { x: number, y: number }) {
    let { x, y } = point;
    dotArray.push(x, y);
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));
    const posBuffer = createBuffer(gl);
    const posLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    //!! vertexAttribPointer 这一步是告诉着色器如何解析webgl buffer中传入的二进制数据; 同时将着色器中的attribute属性和gl.ARRAY_BUFFER绑定
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLocation);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...dotArray]), gl.DYNAMIC_DRAW);
    // gl.clearColor(0,0,0,1)
    gl.drawArrays(gl.POINTS, 0, dotArray.length / 2);
}

/**
 * @description 绘制三角形
 * @param gl 
 * @param points 
 * @param color 
 */
function drawTriangle(gl: WebGLRenderingContext, points: [IPoint, IPoint, IPoint], color: [number, number, number, number]) {
    const data = [];
    points.forEach((point, index) => {
        data.push(point.x, point.y, ...color);
    });

    const buf = new Float32Array(data);
    const buffer = createBuffer(gl);
    const posLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    //!! 绑定位置信息
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
    gl.enableVertexAttribArray(posLocation);
    //!! 绑定颜色信息
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 2);
    gl.enableVertexAttribArray(colorLocation);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
/**
 * @description 绘制四边形
 * @param gl 
 * @param points 
 * @param color 
 */
function drawRectangle(gl: WebGLRenderingContext, points: [IPoint, IPoint, IPoint, IPoint], color: [number, number, number, number]) {
    const data = [];
    [points[0], points[1], points[2]].forEach((point, index) => {
        data.push(point.x, point.y,...color);
    });

    [points[0], points[3], points[2]].forEach((point, index) => {
        data.push(point.x, point.y,...color);
    });

    const buf = new Float32Array(data);
    const buffer = createBuffer(gl);
    const posLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    //!! 绑定位置信息
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
    gl.enableVertexAttribArray(posLocation);
    //!! 绑定颜色信息
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 2);
    gl.enableVertexAttribArray(colorLocation);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const canvas = document.querySelector('#app') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
if (!gl) throw new Error('你的浏览器不支持webgl');
// 设置webgl的视口
gl.viewport(0, 0, canvas.width, canvas.height);
const program = createProgramFromSource(gl, vertexShaderSource, fragmentShaderSource);
//* 纹理的坐标-满足三角形的要求
const textureData = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    1, 1,
    0, 1,
    0, 0
]);
const textureBuffer = gl.createBuffer();
const textureLocation = gl.getAttribLocation(program, 'a_textureCoordinate');
gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
gl.bufferData(gl.ARRAY_BUFFER, textureData, gl.STATIC_DRAW);
gl.enableVertexAttribArray(textureLocation);

const pointData = new Float32Array([
    0,0,
    2160,0,
    2160,1080,
    2160,1080,
    0,1080,
    0,0
]);
const pointBuffer = gl.createBuffer();
const pointLocation = gl.getAttribLocation(program, 'a_position');
gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.STATIC_DRAW);
gl.enableVertexAttribArray(pointLocation);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

const image = new Image();
image.src = '/test.jpg';
image.onload = () => {
    const u_matrix = gl.getUniformLocation(program, 'u_matrix');
    const matrix = createCoordinateMatrix(image.width, image.height);
    gl.uniformMatrix4fv(u_matrix, false, matrix);
    // 反转y轴
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //!! 针对纹理进行裁剪
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //!! 绘制四边形
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}