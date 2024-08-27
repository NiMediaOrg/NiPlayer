import { NiDanmakuEngine } from "../src/render/danmaku";
const start = document.querySelector('.start');
const stop = document.querySelector('.stop');

const engine = new NiDanmakuEngine({
    container: document.getElementById('app') as HTMLElement,
    fontSize: 30,
    fontFamily: 'Arial',
    color: 'black',
    duration: 10,
    timeline: () => Date.now() / 1000,
})

engine.addList([
    {
        text: 'hello world111',
        color: 'red',
        fontSize: 25,
        duration: 3
    },
    {
        text: '今天开始降温了',
        color: 'blue',
        fontSize: 30,
        duration: 5

    },
    {
        text: '昨天吃了一顿火锅，很是好吃',
        color: '#fefe00',
        fontSize: 23,
        duration: 7
    },
    {
        text: '哈哈哈哈哈哈',
        color: '#ededed',
        fontSize: 40,
        duration: 4.5
    },
    {
        text: '黑神话悟空，08.20直面天命！！！！',
        color: 'purple',
        fontSize: 33
    }
]);

start?.addEventListener('click', () => {
    engine.start();
});

stop?.addEventListener('click', () => {
    engine.stop();
});
