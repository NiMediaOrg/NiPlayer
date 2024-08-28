window.onload = () => {

    const canvas = document.getElementById('render') as HTMLCanvasElement;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;

    const ctx = canvas.getContext('2d')!;

    ctx.font = '140px Arial';
    ctx.strokeStyle ='red';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'start';
    ctx.strokeText('niplayer', 100, 100);
    ctx.stroke();

    ctx.arc(100, 100, 10 ,0, 2 * Math.PI);
    ctx.fill()
}