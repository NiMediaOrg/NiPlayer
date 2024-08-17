import { drawCurvePath } from "../src/render/2d";

window.onload = () => {
    const canvas = document.getElementById('render') as HTMLCanvasElement;
    const start = document.querySelector('.start') as HTMLButtonElement;
    const stop = document.querySelector(".stop") as HTMLButtonElement;

    canvas.width = 600 * window.devicePixelRatio;
    canvas.height = 600 * window.devicePixelRatio;

    let timer: number;
    const ctx = canvas.getContext('2d')!;
    // 设置径向渐变
    const radialGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    radialGradient.addColorStop(0,'red');
    radialGradient.addColorStop(1,'blue');
    ctx.fillStyle = radialGradient;

    // 设置线性渐变
    const linearGradient = ctx.createLinearGradient(0, 0, 0, 300);
    linearGradient.addColorStop(0,'red');
    linearGradient.addColorStop(1,'blue');
    ctx.strokeStyle = linearGradient;
    ctx.lineWidth = 2;
    // ctx.fillStyle = 'red';
    // ctx.fillRect(100, 100, 200, 300);
    // ctx.strokeRect(0, 0, 100, 100);
    // 方形绘制
    //* 0. 模拟真人绘制场景，先将画笔放下，开始绘制
    ctx.beginPath();
    //* 1. 先告诉画布要绘制矩形的坐标和宽高
    ctx.rect(0, 0,300, 300);
    //* 2. 开始按照路径绘制矩形
    ctx.stroke();
    //* 3. 将画笔提上来
    ctx.closePath();

    // 填充法绘制矩形
    // ctx.beginPath();
    // ctx.rect(100, 130, 300, 200);
    // ctx.fill();
    // ctx.closePath();

    ///* 绘制圆形, 默认绘制方向：顺时针
    ctx.beginPath();
    ctx.arc(400, 450, 100, 0, -Math.PI, true);
    ctx.stroke();

    //* moveTo的概念比较抽象，需要多加研究
    ctx.moveTo(250, 500)
    ctx.arc(250, 450, 100, 0, Math.PI);
    ctx.stroke();
    ctx.closePath();

    /// 线段绘制
    ctx.beginPath();

    ctx.moveTo(150, 450);
    ctx.lineTo(0, 0)
    ctx.lineTo(190, 20);
    ctx.fill();
    ctx.closePath();
    // drawCanvasDanmaku(canvas, {
    //     fontSize: 30,
    //     fontFamily: 'Arial',
    //     color:'red',
    //     text: 'hello world',
    //     y: 100,
    //     duration: 14.5
    // })

    //* 贝塞尔曲线绘制
    // drawCurvePath({
    //     x: 100,
    //     y: 100
    // }, {
    //     x: 200,
    //     y: 200
    // }, 1, canvas);


    start.onclick = () => {
        timer = requestAnimationFrame(() => clear(currentHeight))
    }

    stop.onclick = () => {
        cancelAnimationFrame(timer);
    }

    let currentHeight = 0;
    function clear(height: number) {
        if (height > canvas.height) return;
        currentHeight = height;
        ctx.clearRect(0,0, canvas.width, height);
        timer = window.requestAnimationFrame(() => clear(height + 1));
    }
}
