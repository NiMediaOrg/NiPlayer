// canvas实现炫彩小球
const canvas = document.getElementById('render') as HTMLCanvasElement;
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

let timer = -1;

const ctx = canvas.getContext('2d')!;
ctx.globalAlpha = 0.5
const ballArr: CanvasBall[] = [];
class CanvasBall {
    color: string // 小球的颜色
    r: number // 小球的半径
    dx: number // 小球在x轴的运动速度/帧
    dy: number // 小球在y轴的运动速度/帧
    constructor(public x: number, public y: number) {
        // 设置随机颜色
        this.color = this.getRandomColor()
        // 设置随机半径[1, 101)
        this.r = Math.floor(Math.random() * 100 + 1)
        // 设置x轴, y轴的运动速度(-5, 5)
        this.dx = Math.floor(Math.random() * 10) - 5
        this.dy = Math.floor(Math.random() * 10) - 5
    }
    // 随机颜色，最后返回的是类似'#3fe432'
    getRandomColor(): string {
        let allType = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f"
        let allTypeArr = allType.split(',')
        let color = '#'
        for (let i = 0; i < 6; i++) {
            let random = Math.floor(Math.random() * allTypeArr.length)
            color += allTypeArr[random]
        }
        return color
    }

    // 渲染小球
    render(): void {
        if (ctx !== null) {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
            ctx.fillStyle = this.color
            ctx.fill()
        }
    }

    // 更新小球
    update(): void {
        // 小球的运动
        this.x += this.dx
        this.y += this.dy
        this.r -= 0.5
        // 如果小球的半径小于0了，从数组中删除
        if (this.r <= 0) {
            this.remove()
        }
    }

    // 移除小球
    remove(): void {
        for (let i = 0; i < ballArr.length; i++) {
            if (ballArr[i] === this) {
                ballArr.splice(i, 1)
            }
        }
    }
}

canvas.addEventListener('mousemove', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    ballArr.push(new CanvasBall(x, y))
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < ballArr.length; i++) {
        ballArr[i].render()
        ballArr[i].update()
    }
    timer = requestAnimationFrame(draw)
}