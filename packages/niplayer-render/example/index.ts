// // import "./canvas";
// import "./danmaku";
// import "./render-video";
// import "./canvas-transform"
import { Application, Rectangle } from "../src";
const app = new Application({
    width: 1000,
    height: 500
});

(document.querySelector('#app') as HTMLElement).appendChild(app.view);
const rect1 = new Rectangle(10, 10, 100, 100);
rect1.style.color ='red';
rect1.style.zIndex = 20;

// const rect2 = new Rectangle(40, 30, 50, 200);
// rect2.style.color = 'blue';
// rect2.style.zIndex = 10;

// const rect3 = new Rectangle(50, 50, 160, 100)
// rect3.style.color = 'green';
// rect3.style.zIndex = 30

// rect1.appendChild(rect2);
// rect1.appendChild(rect3);

app.appendChild(rect1);
app.draw();

window.setTimeout(() => {
    // console.log(rect3.style)
    rect1.style.color = 'blue';
    rect1.style.left = 100;
}, 3000)
