attribute vec4 v_position;
attribute vec4 v_color;
uniform mat4 v_matrix;
uniform mat4 rotate_x_matrix;
uniform mat4 rotate_y_matrix;

uniform mat4 scale_matrix;
uniform mat4 translate_matrix;

uniform mat4 project_matrix;
uniform vec4 v_anchor;
varying vec4 f_color;
void main() {
    mat4 main_rotate_x_matrix = mat4(
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    );
    mat4 main_rotate_y_matrix = mat4(
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    );
    mat4 main_scale_matrix = mat4(
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    );
    mat4 main_translate_matrix = mat4(
        1, 0, 0, 0, 
        0, 1, 0, 0, 
        0, 0, 1, 0, 
        0, 0, 0, 1
    );

    if(scale_matrix != mat4(0.0)) {
        main_scale_matrix = scale_matrix;
    }

    if(rotate_x_matrix != mat4(0.0)) {
        main_rotate_x_matrix = rotate_x_matrix;
    }

    if(rotate_y_matrix!= mat4(0.0)) {
        main_rotate_y_matrix = rotate_y_matrix;
    }

    if(translate_matrix!= mat4(0.0)) {
        main_translate_matrix = translate_matrix;
    }

    mat4 final_matrix = main_scale_matrix * main_rotate_x_matrix * main_rotate_y_matrix;
    // vec4 new_anchor = final_matrix * v_anchor;
    // float dx = v_anchor.x - new_anchor.x + main_translate_matrix[3][0];
    // float dy = v_anchor.y - new_anchor.y + main_translate_matrix[3][1];
    // float dz = v_anchor.z - new_anchor.z + main_translate_matrix[3][2];
    
    // mat4 new_final_matrix = mat4(
    //     1, 0, 0, 0,
    //     0, 1, 0, 0,
    //     0, 0, 1, 0,
    //     400, 400, 0, 1
    // );

    gl_Position = project_matrix * main_translate_matrix * main_rotate_x_matrix * main_rotate_y_matrix * v_position;
    // gl_Position = v_matrix * main_translate_matrix * v_position;
    f_color = v_color;
}