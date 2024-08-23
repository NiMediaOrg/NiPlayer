window.onload = () => {
    const canvas = document.getElementById('render') as HTMLCanvasElement;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;

    const ctx = canvas.getContext('2d')!;
    // canvas平移变换, 为了方便理解，可以理解为移动的坐标轴
    // 先保存下设置前的状态，方便后续的恢复
    ctx.beginPath();
    ctx.save();
    ctx.fillStyle = 'red';
    // ctx.translate(canvas.width / 2, canvas.height / 2);
    // translate平移的矩阵表示，等同于写 ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.transform(1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
    // rotate 旋转变换的矩阵表示
    ctx.transform(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), -Math.sin(Math.PI / 4), Math.cos(Math.PI / 4), 0, 0);
    // scale变换的矩阵表示 等于写 ctx.scale(1,2)
    ctx.transform(1, 0, 0, 2, 0, 0);
    ctx.rect(-100, -100, 200, 200);
    ctx.fill();
    ctx.restore();
    ctx.closePath();

    // 恢复状态后画圆的颜色又变成了之前的黑色也就是默认的颜色
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2)
    ctx.fill();
    ctx.closePath();
}