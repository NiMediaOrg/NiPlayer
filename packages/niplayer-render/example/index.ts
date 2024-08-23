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
const rect1 = new Rectangle(10, 10, 400, 400);
rect1.style.color ='red';
rect1.style.zIndex = 20;
rect1.style.position = 'absolute';
rect1.style.font = '35px Arial';
rect1.style.overflow = 'hidden';
rect1.innerText = 'Hellooooooooooooooooooooo World';

const rect2 = new Rectangle(40, 30, 50, 200);
rect2.style.color = 'blue';
rect2.style.zIndex = 10;
rect2.style.position = 'absolute';

const rect3 = new Rectangle(50, 50, 160, 100)
rect3.style.color = 'green';
rect3.style.zIndex = 30;

// rect1.appendChild(rect2);
// rect1.appendChild(rect3);

app.appendChild(rect1);
app.draw();

window.setTimeout(() => {
    rect1.style.x = 200;
    rect1.style.y = 200;
}, 2000)
