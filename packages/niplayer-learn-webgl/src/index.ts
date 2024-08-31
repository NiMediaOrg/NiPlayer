import "./index.less";
import { createBuffer, createCoordinateMatrix, createFrameBuffer, createProgramFromSource, createRotateMatrix, createScaleMatrix, createTranslateMatrix } from "./utils";
import vertexShaderSource from "./shader/2d/graphics.vertex.glsl";
import fragmentShaderSource from "./shader/2d/graphics.fragment.glsl";
const dotArray = [];
const translateInput = document.querySelector('#translate') as HTMLInputElement;
const scaleInput = document.querySelector('#scale') as HTMLInputElement;
const rotateInput = document.querySelector('#rotate') as HTMLInputElement;
const grayBtn = document.querySelector('#gray') as HTMLInputElement;
const blurBtn = document.querySelector('#blur') as HTMLInputElement;

const start = document.querySelector('.start') as HTMLButtonElement;
const stop = document.querySelector('.stop') as HTMLButtonElement;

let timer: number = -1;
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
        data.push(point.x, point.y, ...color);
    });

    [points[0], points[3], points[2]].forEach((point, index) => {
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
//!! 需要绘制的图形的原始坐标，在shader中会转换成webgl坐标系：X: [-1,1]; Y:[-1,1]
const pointData = new Float32Array([
    0, 0,
    2160, 0,
    2160, 1080,
    2160, 1080,
    0, 1080,
    0, 0
]);
const pointBuffer = gl.createBuffer();
const pointLocation = gl.getAttribLocation(program, 'a_position');
gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
gl.vertexAttribPointer(pointLocation, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.STATIC_DRAW);
gl.enableVertexAttribArray(pointLocation);

const texture = gl.createTexture();
//!! gl.TEXTURE_2D 可以看作webgl提供的全局变量，通过设置全局变量来达到改变绘图的纹理，坐标，颜色等信息
gl.bindTexture(gl.TEXTURE_2D, texture);

function draw() {
    gl.clearColor(0.0, 0.5, 0.0, 1.0);
    const translate_matrix = gl.getUniformLocation(program, 'translate_matrix');
    gl.uniformMatrix4fv(translate_matrix, false, createTranslateMatrix(0, 0));
    const scale_matrix = gl.getUniformLocation(program, 'scale_matrix');
    // gl.uniformMatrix4fv(scale_matrix, false, createScaleMatrix(0.5, 0.5));
    const rotate_matrix = gl.getUniformLocation(program, 'rotate_matrix');
    gl.uniformMatrix4fv(rotate_matrix, false, createRotateMatrix(0));
    const u_matrix = gl.getUniformLocation(program, 'u_matrix');
    const u_anchor = gl.getUniformLocation(program, 'u_anchor');
    gl.uniform4fv(u_anchor, [image.width / 2, image.height / 2, 1, 1]);

    gl.uniformMatrix4fv(u_matrix, false, createCoordinateMatrix(image.width, image.height));
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

function toggleGray(gray: boolean) {
    const isGray = gl.getUniformLocation(program, 'u_isGray');
    gl.uniform1i(isGray, gray ? 1 : 0);
    gl.clearColor(0.0, 0.5, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const frames = [];
const textures = [];

function toggleBlur(blur: boolean) {
    const isBlur = gl.getUniformLocation(program, 'u_isBlur');
    const useMatrix = gl.getUniformLocation(program, 'use_matrix');
    gl.uniform1i(isBlur, blur ? 1 : 0);
    gl.clearColor(0.0, 0.5, 0.0, 1.0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (blur) {
        //!! 绑定图像的原始纹理
        if (frames.length === 0) {
            for (let i = 0; i < 2; i++) {
                //!! 注意，这里需要传入canvas的像素尺寸，而不是image的尺寸！！！
                const [frameBuffer, texture] = createFrameBuffer(gl, canvas.width, canvas.height);
                frames.push(frameBuffer);
                textures.push(texture);
            }
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(useMatrix, 1);
        for (let i = 0; i < 10; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, frames[i % 2]);
            //! 告诉WebGL帧缓冲需要的视图大小
            //! 需要注意的是，如果设置的图片像素和canvas像素不一致会导致渲染尺寸的问题，需要针对渲染后的纹理数据再进行一次矩阵变换
            //todo 寻找更好的办法进行处理
            gl.viewport(0, 0, canvas.width, canvas.height);
            //!! 绘制到当前帧缓冲区中的纹理对象上
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            //!! 绑定当前缓冲区的纹理对象作为下一次处理的输入
            gl.bindTexture(gl.TEXTURE_2D, textures[i % 2]);
        }
        //!! 设置帧缓冲区为NULL时，则会绘制到颜色缓冲区中（即屏幕上）
        //!! 因此，在webgl的概念中，屏幕 === 颜色缓冲区
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.uniform1i(useMatrix, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

const image = new Image();
image.src = '/test.jpg';
image.onload = () => {
    translateInput.addEventListener('change', (e) => {
        const x = Number(translateInput.value) / 100 * 2160;
        const translate_matrix = gl.getUniformLocation(program, 'translate_matrix');

        gl.uniformMatrix4fv(translate_matrix, false, createTranslateMatrix(x, 0));
        gl.clearColor(0.0, 0.5, 0.0, 1.0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

    rotateInput.addEventListener('change', (e) => {
        const x = Number(rotateInput.value);
        const rotate_matrix = gl.getUniformLocation(program, 'rotate_matrix');
        gl.uniformMatrix4fv(rotate_matrix, false, createRotateMatrix(x));
        gl.clearColor(0.0, 0.5, 0.0, 1.0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    });

    grayBtn.addEventListener('click', (e) => {
        toggleGray(grayBtn.checked);
    })

    blurBtn.addEventListener('click', (e) => {
        toggleBlur(blurBtn.checked);
    })

    start.addEventListener('click', () => {
        if (timer !== -1) return;
        animationChange();
    });

    stop.addEventListener('click', () => {
        window.cancelAnimationFrame(timer);
        timer = -1;
    })

    let angle = 0;
    let scale = 0.5;
    let operation: 'minus' | 'add' = 'add';
    // gl.viewport(0, 0, image.width, image.height);

    const animationChange = () => {
        timer = window.requestAnimationFrame(() => {
            angle += 1;
            if (scale > 1) {
                operation = 'minus';
            } else if (scale < 0.3) {
                operation = 'add';
            }
            if (operation === 'add') {
                scale += 0.001;
            } else {
                scale -= 0.001;
            }
            const rotate_matrix = gl.getUniformLocation(program, 'rotate_matrix');
            gl.uniformMatrix4fv(rotate_matrix, false, createRotateMatrix(angle));
            const scale_matrix = gl.getUniformLocation(program, 'scale_matrix');
            gl.uniformMatrix4fv(scale_matrix, false, createScaleMatrix(scale, scale));
            gl.clearColor(0.0, 0.5, 0.0, 1.0);
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationChange();
        });
    }

    // animationChange();

    draw();
}