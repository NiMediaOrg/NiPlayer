attribute vec4 v_position;
attribute vec4 v_color;
// 设置纹理坐标
attribute vec2 v_texCoord;
// 设置片元着色器中的纹理坐标
varying vec2 f_texCoord;
// 1. 设置模型矩阵，将 模型坐标系 -> 世界坐标系
uniform mat4 model_matrix;
// 2. 设置视图矩阵，将 世界坐标系 -> 相机坐标系
uniform mat4 view_matrix;
// 3. 设置投影矩阵，将 相机坐标系 -> 屏幕坐标系
uniform mat4 project_matrix;
// 设置面的颜色
varying vec4 f_color;
// 矩阵的行列交换函数
mat4 transpose(mat4 m) {
    mat4 o = mat4(0.0); // 初始化输出矩阵为零矩阵
    for (int i = 0; i < 4; ++i) {
        for (int j = 0; j < 4; ++j) {
            o[j][i] = m[i][j];
        }
    }
    return o;
}

void main() {
    gl_Position = project_matrix * transpose(view_matrix) * transpose(model_matrix) * v_position;
    f_color = v_color;
    // 设置纹理坐标，将纹理坐标传递给片元着色器
    f_texCoord = v_texCoord;
}