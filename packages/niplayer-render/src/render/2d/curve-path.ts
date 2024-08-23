interface IPoint {
    x: number;
    y: number;
}

/**
 * @desc 绘制贝塞尔曲线
 */
export function drawCurvePath(start: IPoint, end: IPoint, curveness: number,canvas: HTMLCanvasElement, ) {
    let timer: number;
    const middlePoint = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    }

    //* 计算出贝塞尔曲线的最终参考点
    const referencePoint = {
        x: curveness * (end.x - start.x) + middlePoint.x,
        y: curveness * (start.y - end.y) + middlePoint.y
    }

    // console.log(x3, y3)
    const ctx = canvas.getContext('2d')!;
    // 创建线性渐变色
    const linearGradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    linearGradient.addColorStop(0,'red');
    linearGradient.addColorStop(1,'blue');
    // 创建径向渐变， 从上图面可以看到，线性渐变是从起点到终点的渐变，而径向渐变是从中心点到终点的渐变
    const radialGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    radialGradient.addColorStop(0,'red');
    radialGradient.addColorStop(1,'blue');

    ctx.lineWidth = 2;
    ctx.strokeStyle = linearGradient || radialGradient;

    let percentage = 0;

    const draw = () => {
        if (percentage > 1){
            window.cancelAnimationFrame(timer);
            return;
        }
        const p0 = {
            x: start.x,
            y: start.y
        }
        const p1 = {
            x: referencePoint.x,
            y: referencePoint.y
        }
        const p2 = {
            x: end.x,
            y: end.y
        }

        const q0 = {
            x: p0.x + (p1.x - p0.x) * percentage,
            y: p0.y + (p1.y - p0.y) * percentage,
        }

        const q1 = {
            x: p1.x + (p2.x - p1.x) * percentage,
            y: p1.y + (p2.y - p1.y) * percentage,
        }
         
        const q = {
            x: q0.x + (q1.x - q0.x) * percentage,
            y: q0.y + (q1.y - q0.y) * percentage
        }

        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(q0.x,q0.y,q.x,q.y);
        ctx.stroke();
        ctx.closePath();

        percentage += 0.01;
        timer = window.requestAnimationFrame(draw);
    }

    draw();
}