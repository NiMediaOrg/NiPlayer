// 片元着色器
// 将着色器内的float类型设置为中等精度
precision mediump float;
// 接受从顶点着色器给到的颜色数据，并且进行渲染
varying vec4 a_Color;
void main() {
    gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0);
}