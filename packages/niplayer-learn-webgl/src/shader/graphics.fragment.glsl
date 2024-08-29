// 片元着色器
// 将着色器内的float类型设置为中等精度
precision mediump float;
// 接受从顶点着色器给到的颜色数据，并且进行渲染
// 接受从顶点着色器给到的纹理坐标数据
varying vec2 u_textureCoordinate;
// 接受纹理数据
uniform sampler2D u_texture;
uniform sampler2D a_texture;
void main() {
    gl_FragColor = texture2D(a_texture, u_textureCoordinate);
}