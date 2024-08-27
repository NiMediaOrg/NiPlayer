import { Application, Circle, Rectangle, Sprite } from "../src";
const start = document.querySelector('.start') as HTMLButtonElement;
const stop = document.querySelector('.stop') as HTMLButtonElement;

const app = new Application({
    width: 1000,
    height: 500
});

(document.querySelector('#app') as HTMLElement).appendChild(app.view);
const rect1 = new Rectangle(20, 20, 400, 400);
rect1.style.color = 'red';
rect1.style.zIndex = 20;
rect1.style.position = 'relative';
rect1.style.font = '35px Arial';
rect1.style.overflow = 'hidden';

rect1.innerText = 'Hellooooooooooooooooooooo World';

const rect2 = new Rectangle(40, 30, 50, 200);
rect2.style.color = 'blue';
rect2.style.zIndex = 10;
rect2.style.position = 'absolute';

const rect3 = new Rectangle(50, 50, 160, 100)
rect3.style.color = 'green';
rect3.style.position = 'fixed';
rect3.style.zIndex = 30;

// rect1.appendChild(rect2);
// rect1.appendChild(rect3);

const circle1 = new Circle(100, 100, 50);
circle1.style.color = 'black';
circle1.style.zIndex = 100;

const sprite1 = new Sprite(20, 40);
app.appendChild(rect1);
app.appendChild(circle1);
// app.appendChild(sprite1);
app.draw();

app.ticker.add(() => {
    // rect1.transform.translateX! += 1;
    // rect1.transform.scaleX! -= 0.001;
    // rect1.transform.scaleY! -= 0.001;
    // rect1.transform.rotate! += 5;

    // circle1.transform.translateX! += 1;
    // circle1.transform.translateY! += 1;
    // circle1.transform.scaleX! -= 0.001;
    // circle1.transform.scaleY! -= 0.001;

    // sprite1.transform.rotate! += 10;
});