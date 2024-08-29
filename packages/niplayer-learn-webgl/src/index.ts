import "./index.less";
import { createBuffer, createProgramFromSource } from "./utils";
import vertexShaderSource from "./shader/dot.vertex.glsl";
import fragmentShaderSource from "./shader/dot.fragment.glsl";
const dotArray = [];
function drawDot(gl: WebGLRenderingContext, point: {x: number, y: number}) {
    let {x, y} = point;
    dotArray.push(x, y);
    console.log(dotArray)
    x = Math.max(-1, Math.min(1,x));
    y = Math.max(-1, Math.min(1,y));
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...dotArray]), gl.DYNAMIC_DRAW);
    // gl.clearColor(0,0,0,1)
    gl.drawArrays(gl.POINTS, 0, dotArray.length / 2);
}

const canvas = document.querySelector('#app') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
if (!gl) throw new Error('你的浏览器不支持webgl');
// 设置webgl的视口
gl.viewport(0, 0, canvas.width, canvas.height);
const program = createProgramFromSource(gl, vertexShaderSource, fragmentShaderSource);
const [posBuffer, posLocation] = createBuffer(gl, program, 'a_position', new Float32Array([]));
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posLocation);

canvas.addEventListener('click', (e) => {
    const x = e.offsetX * window.devicePixelRatio;
    const y = e.offsetY * window.devicePixelRatio;
    drawDot(gl, {x: (x - canvas.width / 2) / (canvas.width / 2), y: -(y - canvas.height / 2) / (canvas.height / 2)})
})
