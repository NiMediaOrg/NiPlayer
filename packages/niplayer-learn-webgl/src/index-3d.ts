import { createProgramFromSource, createRotate3DMatrix, createScale3DMatrix, createTranslate3DMatrix, createWebGL } from "./utils";
import fragmentShader from "./shader/3d/3d.fragment.glsl";
import vertexShader from "./shader/3d/3d.vertex.glsl";
//! 学习3d渲染
window.onload = () => {
    const play = document.querySelector('.play') as HTMLButtonElement;
    const pause = document.querySelector('.pause') as HTMLButtonElement;

    const canvas = document.querySelector('#app') as HTMLCanvasElement;
    const gl = createWebGL(canvas);
    const program = createProgramFromSource(gl, vertexShader, fragmentShader);
    //* 设置立方体的长宽高
    const width = 200, height = 200, depth = 200;
    const pointPos = [
        // front-face
        0, 0, 0, width, 0, 0, width, height, 0, width, height, 0, 0, height, 0, 0, 0, 0,
        // back-face
        0, 0, depth, width, 0, depth, width, height, depth, width, height, depth, 0, height, depth, 0, 0, depth,
        // left-face
        0, 0, 0, 0, height, 0, 0, height, depth, 0, height, depth, 0, 0, depth, 0, 0, 0,
        // right-face
        width, 0, 0, width, height, 0, width, height, depth, width, height, depth, width, 0, depth, width, 0, 0,
        // top-face
        0, height, 0, width, height, 0, width, height, depth, width, height, depth, 0, height, depth, 0, height, 0,
        // bottom-face
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
    //* 设置立方体的坐标转化矩阵
    const UVMatrix = [
        2 / width, 0, 0, 0,
        0, 2 / height , 0, 0,
        0, 0, 2 / depth, 0,
        -1, -1, -1, 1
    ];

    const v_matrix = gl.getUniformLocation(program, 'v_matrix');
    gl.uniformMatrix4fv(v_matrix, false, UVMatrix);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, 'v_position');
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    gl.enableVertexAttribArray(positionLocation);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const colorLocation = gl.getAttribLocation(program, 'v_color');
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    gl.enableVertexAttribArray(colorLocation);

    const scaleMatrix = gl.getUniformLocation(program,'scale_matrix');
    gl.uniformMatrix4fv(scaleMatrix, false, createScale3DMatrix(0.5, 0.5, 0.5));

    const v_anchor = gl.getUniformLocation(program, 'v_anchor');
    gl.uniform4fv(v_anchor, [width / 2, height / 2, depth / 2, 1]);

    const translateMatrix = gl.getUniformLocation(program, 'translate_matrix');
    // gl.uniformMatrix4fv(translateMatrix, false, createTranslate3DMatrix(canvas.width / 2, canvas.height / 2, 0));
    //! 绘制3d图形需要启用深度缓冲，去除一些藏在背部的面的渲染
    gl.enable(gl.DEPTH_TEST)
    //! 启用GPU的剔除面特性
    // gl.enable(gl.CULL_FACE)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);

    let rotateX = 0, rotateY = 0;
    let timer = -1;
    const animate = () => {
        timer = window.requestAnimationFrame(() => {
            rotateX += 1;
            rotateY += 0.5;
            const rotateXMatrix = createRotate3DMatrix(rotateX, 'x');
            const rotateXMatrixLocation = gl.getUniformLocation(program, 'rotate_x_matrix');
            gl.uniformMatrix4fv(rotateXMatrixLocation, false, rotateXMatrix);

            const rotateYMatrix = createRotate3DMatrix(rotateY, 'y');
            const rotateYMatrixLocation = gl.getUniformLocation(program, 'rotate_y_matrix');
            gl.uniformMatrix4fv(rotateYMatrixLocation, false, rotateYMatrix);
    
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);

            animate();
        })
    }

    play.onclick = () => {
        if (timer !== -1) return;
        animate();
    }

    pause.onclick = () => {
        window.cancelAnimationFrame(timer);
        timer = -1;
    }
}

