#version 300 es

precision mediump float;

in vec3 v_normal;

out vec4 color;

void main() {
    color = vec4(v_normal, 1.0f);
}
