import { NiPlayer } from "../src/index";

const player = new NiPlayer({
    container: document.querySelector('#app'),
    url: 'https://artplayer.org/assets/sample/video.mp4',
    quality: [
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 120,
            name: '4K 超高清'
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 112,
            name: '1080P 高清'
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 64,
            name: '720P 高清'
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 32,
            name: '480P 清晰'
        },
        {
            url: 'https://artplayer.org/assets/sample/video.mp4',
            qn: 16,
            name: '360P 流畅'
        },
    ]
});

player.on(NiPlayer.Event.VIDEO_QUALITY_CHANGING, (q) => {
    console.log('开始切换清晰度', q);
})

player.on(NiPlayer.Event.VIDEO_QUALITY_CHANGED, (q) => {
    console.log('清晰度切换成功', q)
})