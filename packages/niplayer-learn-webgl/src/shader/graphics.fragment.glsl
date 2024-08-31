// 片元着色器
// 将着色器内的float类型设置为中等精度
precision highp float;
// 接受从顶点着色器给到的纹理坐标数据
varying vec2 u_textureCoordinate;
// 接受纹理数据
uniform sampler2D u_texture0;
uniform bool u_isGray;
uniform bool u_isBlur;
void main() {
    vec4 a_color = texture2D(u_texture0, u_textureCoordinate);

    if (u_isGray) {
        gl_FragColor = vec4(vec3(dot(a_color.rgb, vec3(0.333,0.333,0.333))),a_color.a);
        return;
    }

    if (u_isBlur) {
        vec4 l = texture2D(u_texture0, u_textureCoordinate + vec2(-0.002, 0.0));
        vec4 r = texture2D(u_texture0, u_textureCoordinate + vec2(0.002, 0.0));
        vec4 t = texture2D(u_texture0, u_textureCoordinate + vec2(0.0, -0.002));
        vec4 b = texture2D(u_texture0, u_textureCoordinate + vec2(0.0, 0.002));
        gl_FragColor = vec4((l + r + t + b + a_color).rgb / 5.0, a_color.a);
        return;
    }
    
    gl_FragColor = vec4(vec3(a_color.rgb),a_color.a);
}