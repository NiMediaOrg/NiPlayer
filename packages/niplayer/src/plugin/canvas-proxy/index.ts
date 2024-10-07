import BasePlugin from "@/base/base.plugin";

export class CanvasProxy extends BasePlugin {
    /**
     * canvas代理的video对象
     */
    private _video: HTMLVideoElement;
    protected name = 'CanvasProxy';

    protected canvas: HTMLCanvasElement;

    protected initCanvas() {
        this.canvas = document.createElement('canvas')
        this._video = document.createElement('video')

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
 
    }

    protected beforeInit(): void {
        
        this.player.config.proxy = () => {
            return this.canvas
        }
    }

    protected install() {
        console.log('[Proxy Installed] The CanvasProxy has been installed')
    }

    protected dispose(): void {
        console.log('[Proxy Disposed] The CanvasProxy has been disposed')
    }
}