precision highp float;
varying vec4 f_color;
// 接受从顶点着色器给到的纹理坐标数据
varying vec2 f_texCoord;
// 具体的纹理数据（通常是二进制数据）
uniform sampler2D u_texture;
void main() {
    gl_FragColor = texture2D(u_texture, f_texCoord);
}