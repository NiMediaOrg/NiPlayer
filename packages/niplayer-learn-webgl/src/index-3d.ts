import { createProgramFromSource, createWebGL } from "./utils";
import fragmentShader from "./shader/3d/3d.fragment.glsl";
import vertexShader from "./shader/3d/3d.vertex.glsl";
import { Matrix4 } from "./utils/matrix";
import { Vector } from "./utils/vector";
import { mat4 } from "gl-matrix";

//! 学习3d渲染
window.onload = () => {
    const play = document.querySelector('.play') as HTMLButtonElement;
    const pause = document.querySelector('.pause') as HTMLButtonElement;

    const canvas = document.querySelector('#app canvas') as HTMLCanvasElement;
    let timer = null;
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

    //! 绘制3d图形需要启用深度缓冲，使gpu可以保存每个顶点的深度像素数据，来决定哪些面显示在哪些面的上面
    gl.enable(gl.DEPTH_TEST)
    //! 启用GPU的剔除面特性; 顶点绘制顺序逆时针渲染，顺时针剔除不渲染
    // gl.enable(gl.CULL_FACE)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3); 

    let dx = 0, dy = 0, dz = -600;
    let rx = 0, ry = 0, rz = 0;

    const calcViewMatrix = () => {
        const matrix = new Matrix4();
        // 这里看作是将相机进行位置的调整
        matrix.multiply(Matrix4.createTranslate3DMatrix(dx, dy, dz))
            .multiply(Matrix4.createRotate3DMatrix(rz, 'z'))
            .multiply(Matrix4.createRotate3DMatrix(ry, 'y'))
            .multiply(Matrix4.createRotate3DMatrix(rx, 'x'));
        const cameraMatrix = Vector.lookAt(new Vector([matrix.data[3], matrix.data[7], matrix.data[11]]), new Vector([0, 0, 0]), new Vector([0, 1, 0]));
        return Matrix4.invertMatrix(new Matrix4([
            cameraMatrix[0], cameraMatrix[1], cameraMatrix[2], cameraMatrix[3],
            cameraMatrix[4], cameraMatrix[5], cameraMatrix[6], cameraMatrix[7],
            cameraMatrix[8], cameraMatrix[9], cameraMatrix[10], cameraMatrix[11],
            cameraMatrix[12], cameraMatrix[13], cameraMatrix[14], cameraMatrix[15]
        ])).data;
    }
    const translate = () => {
        gl.uniformMatrix4fv(viewMat4, false, calcViewMatrix());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);
    }
    const rotate = () => {
        gl.uniformMatrix4fv(viewMat4, false, calcViewMatrix());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);
    }

    translate();

    let opx = 'add', opy = 'add', opz = 'add';
    const animate = () => {
        if (dx >= 1000) {
            opx ='sub';
        } else if (dx <= -1000) {
            opx = 'add';
        }
        dx = opx === 'add'? dx + 1 : dx - 1;
        if (dy >= 500) {
            opy ='sub';
        } else if (dy <= -500) {
            opy = 'add';
        }
        dy = opy === 'add'? dy + 1 : dy - 1;
        if (dz >= 1000) {
            opz ='sub';
        } else if (dz <= -1000) {
            opz = 'add';
        }
        dz = opz === 'add'? dz + 1 : dz - 1;
        translate();
        timer = requestAnimationFrame(animate);
    }

    play.onclick = () => {
        if (timer) return;
        animate();
    };
    pause.onclick = () => {
        if (!timer) return;
        window.cancelAnimationFrame(timer);
        timer = null;
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

