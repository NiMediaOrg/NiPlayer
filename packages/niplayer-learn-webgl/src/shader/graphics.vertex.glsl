// 顶点着色器程序
attribute vec4 a_position;
attribute vec2 a_textureCoordinate;
// 设置矩阵变换的锚点
uniform vec4 u_anchor;
uniform mat4 u_matrix;
uniform mat4 translate_matrix;
uniform mat4 scale_matrix;
uniform mat4 rotate_matrix;
uniform bool use_matrix;
varying vec2 u_textureCoordinate;

void main() {
    const mat4 common_matrix = mat4(
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    );
    mat4 common_scale_matrix = common_matrix;
    mat4 common_rotate_matrix = common_matrix;
    mat4 common_translate_matrix = common_matrix;
    // gl_Position为内置变量，表示当前点的位置
    if(scale_matrix != mat4(0) && !use_matrix) {
        common_scale_matrix = scale_matrix;
    }
    if(rotate_matrix != mat4(0) && !use_matrix) {
        common_rotate_matrix = rotate_matrix;
    }
    if(translate_matrix != mat4(0) && !use_matrix) {
        common_translate_matrix = translate_matrix;
    }
    mat4 scale_rotate_matrix = common_rotate_matrix * common_scale_matrix;
    vec4 new_anchor = scale_rotate_matrix * u_anchor;
    float dx = u_anchor.x - new_anchor.x + translate_matrix[3][0];
    float dy = u_anchor.y - new_anchor.y + translate_matrix[3][1];
    mat4 final_matrix = mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        dx, dy, 0, 1
    ) * scale_rotate_matrix;
    gl_Position = u_matrix * final_matrix * a_position;
    // gl_Position = u_matrix * a_position;
    // gl_Position为内置变量，表示当前点的大小，为浮点类型，如果赋值是整数类型会报错
    // gl_PointSize = 10.0;
    u_textureCoordinate = a_textureCoordinate;
}