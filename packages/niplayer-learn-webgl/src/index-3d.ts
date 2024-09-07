import { createProgramFromSource, createWebGL } from "./utils";
import fragmentShader from "./shader/3d/3d.fragment.glsl";
import vertexShader from "./shader/3d/3d.vertex.glsl";
import { Matrix4 } from "./utils/matrix";

//! 学习3d渲染
window.onload = () => {
    const play = document.querySelector('.play') as HTMLButtonElement;
    const pause = document.querySelector('.pause') as HTMLButtonElement;

    const canvas = document.querySelector('#app canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.onresize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);
    }

    const gl = createWebGL(canvas);
    const program = createProgramFromSource(gl, vertexShader, fragmentShader);
    //* 设置立方体的长宽高
    const width = 200, height = 200, depth = 200;
    const pointPos = [
        // front-side
        0, 0, depth, width, 0, depth, width, height, depth, width, height, depth, 0, height, depth, 0, 0, depth,
        // back-side
        0, 0, 0, 0, height, 0, width, height, 0, width, height, 0, width, 0, 0, 0, 0, 0,
        // left-side
        0, 0, 0, 0, 0, depth, 0, height, depth, 0, height, depth, 0, height, 0, 0, 0, 0,
        // right-side
        width, 0, 0, width, height, 0, width, height, depth, width, height, depth, width, 0, depth, width, 0, 0,
        // top-side
        0, height, 0, 0, height, depth, width, height, depth, width, height, depth, width, height, 0, 0, height, 0,
        // bottom-side
        0, 0, 0, width, 0, 0, width, 0, depth, width, 0, depth, 0, 0, depth, 0, 0, 0,
    ];
    //* 设置立方体的每个顶点的颜色
    const colors = [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
        1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    ];
    for (let i = 0; i < pointPos.length; i += 3) {
        pointPos[i] -= width / 2;
        pointPos[i + 1] -= height / 2;
        pointPos[i + 2] -= depth * 2;
    }

    // 反转y轴
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);


    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, 'v_position');
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const colorLocation = gl.getAttribLocation(program, 'v_color');
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);

    //! 1. 设置三维透视矩阵，将三维空间内的物体映射到canvas平面上
    const projMat4 = gl.getUniformLocation(program, 'project_matrix');
    const mat = Matrix4.createPerspectiveMatrix(30, canvas.width / canvas.height, 1, 3000);
    gl.uniformMatrix4fv(projMat4, false, mat);
    //! 2. 设置模型矩阵，将模型坐标系转换至世界坐标系
    const modelMat4 = gl.getUniformLocation(program, 'model_matrix');
    gl.uniformMatrix4fv(modelMat4, false, new Matrix4().data);
    //! 3. 设置视图矩阵，将世界坐标系转换到视图坐标系
    const viewMat4 = gl.getUniformLocation(program, 'view_matrix');
    gl.uniformMatrix4fv(viewMat4, false, new Matrix4().data);

    //! 绘制3d图形需要启用深度缓冲，去除一些藏在背部的面的渲染；在绘制3d图形中需要开启该特性
    gl.enable(gl.DEPTH_TEST)
    //! 启用GPU的剔除面特性; 顶点绘制顺序逆时针渲染，顺时针剔除不渲染
    // gl.enable(gl.CULL_FACE)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);

    let dx = 0, dy = 0, dz = 0;
    let rx = 0, ry = 0, rz = 0;
    const calcMatrix = () => {
        const matrix = new Matrix4();
        matrix.multiply(Matrix4.createTranslate3DMatrix(dx, dy, dz)).multiply(Matrix4.createRotate3DMatrix(rz, 'z')).multiply(Matrix4.createRotate3DMatrix(ry, 'y')).multiply(Matrix4.createRotate3DMatrix(rx, 'x'));

        return matrix;
    }
    const translate = () => {
        gl.uniformMatrix4fv(viewMat4, false, calcMatrix().data);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);
    }
    const rotate = () => {
        gl.uniformMatrix4fv(viewMat4, false, calcMatrix().data);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);
    }

    window.layui.use(function () {
        const slider = window.layui.slider;
        // 渲染
        slider.render({
            elem: '.x-range',
            max: 1000,
            min: -1000,
            change: (val: number) => {
                dx = val;
                translate();
            }
        });

        slider.render({
            elem: '.y-range',
            max: 500,
            min: -500,
            change: (val: number) => {
                dy = val;
                translate();
            }
        });

        slider.render({
            elem: '.z-range',
            max: 1000,
            min: -1000,
            change: (val: number) => {
                dz = val;
                translate();
            }
        });

        slider.render({
            elem: '.x-rotate',
            max: 360,
            min: -360,
            change: (val: number) => {
                rx = val;
                rotate();
            }
        })

        slider.render({
            elem: '.y-rotate',
            max: 360,
            min: -360,
            change: (val: number) => {
                ry = val;
                rotate();
            }
        })

        slider.render({
            elem: '.z-rotate',
            max: 360,
            min: -360,
            change: (val: number) => {
                rz = val;
                rotate();
            }
        })
    });
}

