export interface FullHTMLElement extends HTMLElement {
    mozRequestFullScreen: () => Promise<void>
    webkitRequestFullscreen: () => Promise<void>
    msRequestFullscreen: () => Promise<void>
    mozCancelFullScreen: () => Promise<void>
    webkitExitFullscreen: () => Promise<void>
    msExitFullscreen: () => Promise<void>
}
export function enterFull(el: FullHTMLElement): Promise<void> | never {
    if(el.requestFullscreen) {
        return el.requestFullscreen()
    } else if (el.mozRequestFullScreen) {
        return el.mozRequestFullScreen()
    } else if (el.webkitRequestFullscreen) {
        return el.webkitRequestFullscreen()
    } else if (el.msRequestFullscreen) {
        return el.msRequestFullscreen()
    }  else {
        throw new Error('你的浏览器不支持任何全屏请求')
    }
}

export function exitFull(): Promise<void> {
    if(document.exitFullscreen) {
        return document.exitFullscreen()
    } else if (document['mozCancelFullScreen']) {
        return document['mozCancelFullScreen']()
    } else if (document['webkitExitFullscreen']) {
        return document['webkitExitFullscreen']()
    } else if (document['msExitFullscreen']) {
        return document['msExitFullscreen']()
    } else {
        throw new Error('你的浏览器无法退出全屏')
    }
}
