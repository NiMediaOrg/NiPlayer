// 顶点着色器程序
attribute vec4 a_position;
attribute vec2 a_textureCoordinate;
uniform mat4 u_matrix;
varying vec2 u_textureCoordinate;
void main() {
    // mat4 test_matrix = mat4(
    //     0.0009, 0, 0, 0,
    //     0, 0.0018, 0, 0,
    //     0, 0, 2, 0,
    //     -1, -1, -1, 1
    // );
    // gl_Position为内置变量，表示当前点的位置
    gl_Position = u_matrix * a_position;
    // gl_Position为内置变量，表示当前点的大小，为浮点类型，如果赋值是整数类型会报错
    // gl_PointSize = 10.0;
    u_textureCoordinate = a_textureCoordinate;
}