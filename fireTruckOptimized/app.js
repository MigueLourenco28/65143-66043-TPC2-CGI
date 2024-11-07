import { lookAt, ortho, mat4, vec3, flatten, normalMatrix } from '../../libs/MV.js';
import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from '../../libs/utils.js';
import { modelView, loadMatrix, pushMatrix, popMatrix } from '../../libs/stack.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';
import * as TORUS from '../../libs/objects/torus.js';

const DIST = 10;

let all_views = true;

let big_view, front_view, left_view, top_view, axo_view;

let projection = mat4();

let zoom = 10;
let aspect = 1.0;

front_view = lookAt(vec3(0, 0, DIST), vec3(0, 0, 0), vec3(0, 1, 0));
top_view = front_view;
left_view = front_view;
axo_view = front_view
big_view = front_view;


/** @type{WebGL2RenderingContext} */
let gl;

/** @type{WebGLProgram} */
let program;

/** @type{HTMLCanvasElement} */
let canvas;

function updateModelView(gl, program, modelView) {
    const u_model_view = gl.getUniformLocation(program, "u_model_view");
    gl.uniformMatrix4fv(u_model_view, false, flatten(modelView));
    const u_normals = gl.getUniformLocation(program, "u_normals");
    gl.uniformMatrix4fv(u_normals, false, flatten(normalMatrix(modelView)));
}

function updateProjection(gl, program, projection) {
    const u_projection = gl.getUniformLocation(program, "u_projection");
    gl.uniformMatrix4fv(u_projection, false, flatten(projection));
}

function toggle_view_mode() { all_views = !all_views; }


function resize() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    aspect = window.innerWidth / window.innerHeight;
}

function initialize_objects() {
    CUBE.init(gl);
    SPHERE.init(gl);
    CYLINDER.init(gl);
    PYRAMID.init(gl);
    TORUS.init(gl, 30, 30, 0.8, 0.2);
}

function main(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);
    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    gl.clearColor(0.7, 0.7, 0.7, 1.0);

    gl.enable(gl.DEPTH_TEST);

    resize();
    window.addEventListener('keydown', function (event) {
        switch (event.key) {
            case '0': toggle_view_mode();
        }
    })
    window.addEventListener('resize', resize);
    window.addEventListener("wheel", function (event) {
        zoom *= 1 + (event.deltaY / 1000);
    });

    initialize_objects();

    // This is needed to let wireframe lines to be visible on top of shaded triangles
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);

    window.requestAnimationFrame(render);
}




function draw_scene(view) {
    gl.useProgram(program);

    projection = ortho(-aspect * zoom, aspect * zoom, -zoom, zoom, -100, 100);
    updateProjection(gl, program, projection);

    loadMatrix(view);

    pushMatrix();
    updateModelView(gl, program, modelView());
    TORUS.draw(gl, program, gl.LINES);
    popMatrix();
}

function draw_views() {
    let hw = canvas.width / 2;
    let hh = canvas.height / 2;

    if (all_views) {
        // Draw on front view
        gl.viewport(0, hh, hw, hh);
        draw_scene(front_view);

        // Draw on top view
        gl.viewport(0, 0, hw, hh);
        draw_scene(top_view);

        // Draw on left view
        gl.viewport(hw, hh, hw, hh);
        draw_scene(left_view);

        // Draw of 4th view
        gl.viewport(hw, 0, hw, hh);
        draw_scene(axo_view);
    }
    else {
        gl.viewport(0, 0, canvas.width, canvas.height);
        draw_scene(big_view);
    }
}

function render() {
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_views();
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => main(shaders));