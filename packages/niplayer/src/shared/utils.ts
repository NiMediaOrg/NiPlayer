export interface FullHTMLElement extends HTMLElement {
    mozRequestFullScreen: () => Promise<void>
    webkitRequestFullscreen: () => Promise<void>
    msRequestFullscreen: () => Promise<void>
    mozCancelFullScreen: () => Promise<void>
    webkitExitFullscreen: () => Promise<void>
    msExitFullscreen: () => Promise<void>
}

const Utils = {
    shot(video: HTMLVideoElement) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    },

    enterFull(el: FullHTMLElement): Promise<void> | never {
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
    },

    exitFull(): Promise<void> {
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
    },

    checkPathContainDom(path: HTMLElement[], target: HTMLElement): boolean {
        for (let i = path.length - 1; i >= 0; i--) {
            if (path[i] === target) return true;
        }
    
        return false;
    },

    addZero(num: number): string {
        return num > 9 ? '' + num : '0' + num
    },

    formatTime(seconds: number): string {
        seconds = Math.floor(seconds)
        let minute = Math.floor(seconds / 60)
        let second = seconds % 60
    
        return this.addZero(minute) + ':' + this.addZero(second)
    }
}

export default Utils;