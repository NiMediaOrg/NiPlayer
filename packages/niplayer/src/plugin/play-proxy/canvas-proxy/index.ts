import BasePlugin from "@/base/base.plugin";
import { NI_PLAYER_EVENT } from "@/shared/events";
import { proxyCanvas } from "../proxy";
export class CanvasProxy extends BasePlugin {
    /**
     * canvas代理的video对象
     */
    private _video: HTMLVideoElement;
    protected name = 'CanvasProxy';

    protected canvas: HTMLCanvasElement;

    protected timer: number = -1;

    protected async draw() {
        this.resize()
        const ctx = this.canvas.getContext('2d')
        if (typeof createImageBitmap !== 'undefined') {
            const bitmap = await createImageBitmap(this._video);
            ctx.drawImage(bitmap, 0, 0, this.canvas.width, this.canvas.height);
            bitmap.close()
        } else  {
            this.canvas.getContext('2d')?.drawImage(this._video, 0, 0, this.canvas.width, this.canvas.height)
        }
        this.timer = window.requestAnimationFrame(() => {
            this.draw()
        })
    }

    protected resize() {
        const aspectRatio = this._video.videoWidth / this._video.videoHeight;
        const containerWidth = this.player.config.container.clientWidth;
        const containerHeight = this.player.config.container.clientHeight;
        const containerRatio = containerWidth / containerHeight;

        let canvasWidth, canvasHeight;
        if (containerRatio > aspectRatio) {
            canvasHeight = containerHeight;
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            canvasWidth = containerWidth;
            canvasHeight = canvasWidth / aspectRatio;
        }

        this.canvas.width = canvasWidth * window.devicePixelRatio;
        this.canvas.height = canvasHeight * window.devicePixelRatio;
        const paddingLeft = (containerWidth - canvasWidth) / 2;
        const paddingTop = (containerHeight - canvasHeight) / 2;

        Object.assign(this.canvas.style, {
            padding: `${paddingTop}px ${paddingLeft}px`,
        });
    }

    protected initCanvas() {
        this._video = document.createElement('video')
        this.canvas = proxyCanvas(this._video)
    }

    protected beforeInit(): void {
        this.initCanvas()
        this.player.config.proxy = () => {
            return this.canvas as unknown as HTMLVideoElement
        }
    }

    protected install() {
        this._video.style.display = 'none'
        this.player.nodes.videoArea.appendChild(this._video)
        this.player.on(NI_PLAYER_EVENT.VIDEO_CAN_PLAY, () => {
            this._video.play()
            this.draw()
        })
    }

    protected dispose(): void {
        console.log('[Proxy Disposed] The CanvasProxy has been disposed')
        window.cancelAnimationFrame(this.timer)
    }
}