import Player from "../../packages/niplayer/src"
let player = new Player({
    url: 'http://cn-gdfs-ct-01-15.bilivideo.com/upgcxcode/21/05/866850521/866850521_da2-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&uipk=5&nbs=1&deadline=1719200593&gen=playurlv2&os=bcache&oi=17627301&trid=00006ada9edbe43c46aa8308d2e99c2f01d3h&mid=0&platform=html5&og=hw&upsig=70f9bdf524374ddfda225d9f9cfecb53&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform,og&cdnid=60915&bvc=vod&nettype=0&f=h_0_0&bw=50942&logo=80000000',
    container: document.getElementById('video'),
    streamPlay: false,
    thumbnails: {
        // 缩略图设置选项
        col: 1,
        row: 47,
        total: 47,
        source: 'http://127.0.0.1:8081/sprites.png',
        interval: 6,
    },
    subtitles: [
        // 字幕
        {
            source: 'http://127.0.0.1:8081/subtitle.vtt',
            tip: 'Bilingual',
            lang: 'en',
            default: true,
            style: {
                backgroundColor: 'yellow',
                color: 'red',
            },
        },
        {
            source: 'http://127.0.0.1:8081/subtitle.zn.vtt',
            tip: 'Chinese',
            lang: 'zh',
            style: {
                color: 'green',
            },
        },
        {
            source: 'http://127.0.0.1:8081/subtitle.jp.vtt',
            tip: 'Japanese',
            lang: 'jp',
        },
    ],
    danmaku: {
        //弹幕
        open: true,
        api: 'https://bilibili-service.vercel.app/api/danmaku',
        type: 'http',
        timeout: 5000,
    },
    title: '一首《打上花火》竟治愈了无数破碎的心灵！',
})