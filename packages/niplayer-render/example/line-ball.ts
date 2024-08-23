const canvas = document.getElementById('render') as HTMLCanvasElement;
const start = document.querySelector('.start') as HTMLButtonElement;
const stop = document.querySelector('.stop') as HTMLButtonElement;

let timer = -1;
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;
const ctx = canvas.getContext('2d')!;
// 实现球和球之间的连线逻辑
class LineBall {
    public x: number = Math.floor(Math.random() * canvas.width)
    public y: number = Math.floor(Math.random() * canvas.height)
    public r: number = 10
    public color: string = 'gray'
    public dx: number = Math.floor(Math.random() * 10) - 5
    public dy: number = Math.floor(Math.random() * 10) - 5
    constructor() {
        ballArr.push(this)
    }
 
    // 小球的渲染
    render() {
        if(ctx !== null) {
            ctx.beginPath()
            // 透明度
            ctx.globalAlpha = 1
            // 画小球
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
            ctx.fillStyle = this.color
            ctx.fill()
        }
    }
    // 小球的更新
    update() {
        // 更新x
        this.x += this.dx
        // 纠正x
        if(this.x <= this.r) {
            this.x = this.r
        } else if ( this.x >= canvas.width - this.r) {
            this.x = canvas.width - this.r
        }
        // 更新y
        this.y += this.dy
        // 纠正y
        if(this.y <= this.r) {
            this.y = this.r
        } else if ( this.y >= canvas.height - this.r) {
            this.y = canvas.height - this.r
        }
        // 碰壁返回
        if(this.x + this.r >= canvas.width || this.x - this.r <= 0) {
            this.dx *= -1
        }
        if(this.y + this.r >= canvas.height || this.y - this.r <= 0) {
            this.dy *= -1
        }
    }
    
}
 
// 小球数组
let ballArr: LineBall[] = []
 
// 创建20个小球
for(let i = 0; i < 20; i++) {
    new LineBall()
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < ballArr.length; i++) {
        for (let j = i; j < ballArr.length; j++) {
            let distance = Math.sqrt(Math.pow((ballArr[i].x - ballArr[j].x), 2) + Math.pow((ballArr[i].y -ballArr[j].y), 2))
                if( distance <= 150) {
                    ctx.strokeStyle = '#000'
                    ctx.beginPath()
                    // 线的透明度，根据当前已经连线的小球的距离进行线的透明度设置
                    // 距离越近透明度越大，距离越远透明度越小
                    ctx.globalAlpha = 1 - distance / 150 
                    ctx.moveTo(ballArr[i].x, ballArr[i].y)
                    ctx.lineTo(ballArr[j].x, ballArr[j].y)
                    ctx.closePath()
                    ctx.stroke()
                }
        }
    }

    for (let i = 0; i < ballArr.length; i++) {
        ballArr[i].render()
        ballArr[i].update()
    }

    timer = requestAnimationFrame(draw)
}

start.addEventListener('click', () => {
    if (timer === -1) {
        draw()
    }
})

stop.addEventListener('click', () => {
    cancelAnimationFrame(timer)
    timer = -1
})
 