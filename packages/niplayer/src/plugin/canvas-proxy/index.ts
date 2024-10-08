import BasePlugin from "@/base/base.plugin";
import { NI_PLAYER_EVENT } from "@/shared/events";
export class CanvasProxy extends BasePlugin {
    /**
     * canvas代理的video对象
     */
    private _video: HTMLVideoElement;
    /**
     * 代理的video事件列表
     */
    private _videoEvents: string[] = [
        'play',
        'pause',
        'seeking',
        'seeked',
        'ended',
        'error',
        'loadeddata',
        'loadedmetadata',
        'timeupdate',
        'volumechange',
        'ratechange',
        'durationchange',
        'waiting',
        'playing',
        'canplay',
        'canplaythrough',
        'progress',
        'abort',
        'emptied',
        'stalled',
    ];
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

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        const paddingLeft = (containerWidth - canvasWidth) / 2;
        const paddingTop = (containerHeight - canvasHeight) / 2;

        Object.assign(this.canvas.style, {
            padding: `${paddingTop}px ${paddingLeft}px`,
        });
    }

    protected initCanvas() {
        this.canvas = document.createElement('canvas')
        this._video = document.createElement('video')
        // 1. 将video的更新属性代理到canvas对象上
        for (let prop in this._video) {
            if (!(prop in this.canvas)) {
                Object.defineProperty(this.canvas, prop, {
                    get: () => {
                        return typeof this._video[prop] === 'function' ? this._video[prop].bind(this._video) : this._video[prop]
                    },
                    set: (value) => {
                        this._video[prop] = value
                    },
                    enumerable: true,
                    configurable: true,
                })
            }
        }
        //2. 代理video的各项事件
        this._videoEvents.forEach((event) => {
            this._video.addEventListener(event, (e) => {
                const ev = new Event(e.type, e)
                this.canvas.dispatchEvent(ev)
            })
        })

        //3. 代理canvas的appendChild方法
        this.canvas.appendChild = (dom) => {
            return this._video.appendChild(dom)
        }

        //4. 代理canvas的removeChild方法
        this.canvas.removeChild = (dom) => {
            return this._video.removeChild(dom)
        }

        //5. 代理canvas的append方法
        this.canvas.append = (...nodes: (Node | string)[]) => {
            return this._video.append(...nodes)
        }
    }

    protected beforeInit(): void {
        this.initCanvas()
        this.player.config.proxy = () => {
            return this.canvas
        }
    }

    protected install() {
        console.log('[Proxy Installed] The CanvasProxy has been installed')
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