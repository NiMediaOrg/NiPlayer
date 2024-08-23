window.onload = () => {
    const canvas = document.getElementById('render') as HTMLCanvasElement;
    const start = document.querySelector('.start') as HTMLButtonElement;
    const stop = document.querySelector(".stop") as HTMLButtonElement;
    const video = document.querySelector('video') as HTMLVideoElement;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;

    const ctx = canvas.getContext('2d')!;

    start.addEventListener("click", () => {
        video.play();
    })

    stop.addEventListener("click", () => {
        video.pause();
    })

    function render() {
        video.requestVideoFrameCallback(() => {
            console.log()
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            render();
        })
    }

    render();
}

