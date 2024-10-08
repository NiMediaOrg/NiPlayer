const videoEvents: string[] = [
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
export function proxyCanvas(video: HTMLVideoElement) {
    const canvas = document.createElement('canvas')

    // 1. 将video的更新属性代理到canvas对象上
    for (let prop in video) {
        if (!(prop in canvas)) {
            Object.defineProperty(canvas, prop, {
                get: () => {
                    return typeof video[prop] === 'function' ? video[prop].bind(video) : video[prop]
                },
                set: (value) => {
                    video[prop] = value
                },
                enumerable: true,
                configurable: true,
            })
        }
    }
    //2. 代理video的各项事件
    videoEvents.forEach((event) => {
        video.addEventListener(event, (e) => {
            const ev = new Event(e.type, e)
            canvas.dispatchEvent(ev)
        })
    })

    //3. 代理canvas的appendChild方法
    canvas.appendChild = (dom) => {
        return video.appendChild(dom)
    }

    //4. 代理canvas的removeChild方法
    canvas.removeChild = (dom) => {
        return video.removeChild(dom)
    }

    //5. 代理canvas的append方法
    canvas.append = (...nodes: (Node | string)[]) => {
        return video.append(...nodes)
    }
    return canvas;
}