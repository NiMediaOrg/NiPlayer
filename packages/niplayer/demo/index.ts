import { NiPlayer, WebCodecProxy, CanvasProxy } from '../src/index'

const player = new NiPlayer({
    container: document.querySelector('#app'),
    url: 'https://artplayer.org/assets/sample/video.mp4',
    title: '一手《你的名字》看哭中国十四亿网友！！！',
    waterMark: {
        message: 'NovaNi',
    },
    //todo 这里的mp4流式播放还有问题，暂时不使用
    streamPlay: true,
    streamPlayOptions: {},
    seamlessChangeQuality: true,
    shot: {
        filename: 'test',
    },
    quality: [
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 120,
            name: '4K 超高清',
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 112,
            name: '1080P 高清',
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 64,
            name: '720P 高清',
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 32,
            name: '480P 清晰',
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 16,
            name: '360P 流畅',
        },
    ],
    subtitle: [
        {
            lang: '双语字幕(中+日)',
            url: 'vtt/subtitle.vtt',
            default: true,
        },
        {
            lang: '中文',
            url: 'vtt/subtitle.zh.vtt',
        },
        {
            lang: '日文',
            url: 'vtt/subtitle.jp.vtt',
        },
        {
            lang: '英语',
            url: 'vtt/subtitle.en.vtt',
        }
    ],
    plugins: [
        // WebCodecProxy
        CanvasProxy
    ],
    thumbnail: {
        url: './images/thumbnails.png',
        width: 160,
        height: 90,
        num: 60,
        columns: 10
    }
})

player.on(NiPlayer.Event.VIDEO_QUALITY_CHANGING, (q) => {
    console.log('开始切换清晰度', q)
})

player.on(NiPlayer.Event.VIDEO_QUALITY_CHANGED, (q) => {
    console.log('清晰度切换成功', q)
})
