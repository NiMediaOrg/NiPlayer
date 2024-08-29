// 顶点着色器程序
attribute vec4 a_position;
attribute vec2 a_textureCoordinate;
varying vec2 u_textureCoordinate;
void main() {
    // gl_Position为内置变量，表示当前点的位置
    gl_Position = a_position;
    // gl_Position为内置变量，表示当前点的大小，为浮点类型，如果赋值是整数类型会报错
    gl_PointSize = 10.0;
    u_textureCoordinate = a_textureCoordinate;
}