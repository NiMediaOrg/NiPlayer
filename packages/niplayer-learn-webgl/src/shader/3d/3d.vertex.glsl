attribute vec4 v_position;
attribute vec4 v_color;
// 1. 设置模型矩阵，将 模型坐标系 -> 世界坐标系
uniform mat4 model_matrix;
// 2. 设置视图矩阵，将 世界坐标系 -> 相机坐标系
uniform mat4 view_matrix;
// 3. 设置投影矩阵，将 相机坐标系 -> 屏幕坐标系
uniform mat4 project_matrix;
// 设置面的颜色
varying vec4 f_color;
void main() {
    gl_Position = project_matrix * view_matrix * model_matrix * v_position;
    // gl_Position = v_matrix * main_translate_matrix * v_position;
    f_color = v_color;
}