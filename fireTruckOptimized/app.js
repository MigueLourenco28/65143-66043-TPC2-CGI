import { lookAt, ortho, mat4, vec3, vec4, flatten, normalMatrix } from '../../libs/MV.js';
import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from '../../libs/utils.js';
import { modelView, loadMatrix, pushMatrix, popMatrix, multRotationX, multRotationZ, multRotationY, multScale, multTranslation } from '../../libs/stack.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as TORUS from '../../libs/objects/torus.js';

import { chassis, cabin, waterTank, decal, lowerStair, upperStair, stairBaseRotation, stairBaseElevation, bumpers, truckBase } from './fireTruck.js';
import { entrance, floor, poles } from './scenery.js';

export { outlineColor, program, u_color, mode, time, doorPos, wheelAngle, updateModelView, gl };

let u_color;
let outlineColor = vec4(0.2, 0.2, 0.2, 1.0); // Color of the outline of an object

let animation = false; // Animation is running
let mode;

let truckPos = 0.0;   // Position of truck in the x axis
let doorPos = 6.5; // Position of the door in the y axis
let upperLadderPos = 0.0; // Position of the upper stairs

let wheelAngle = 0; // Angle of a wheel in the z axis
let stairBaseAngle = 0; // Angle of the stair base in the y axis
let ladderInclination = 0; // Angle of the ladder in the z axis

let all_views = false;

let big_view, front_view, left_view, top_view, axo_view;

let projection = mat4();

let zoom = 10;
let aspect = 1.0;

let theta = 10; // Horizontal camera angle of the axonometric projection
let gamma = 9; // Vertical camera angle of the axonometric projection

let time = 0;           // Global simulation time in days
let speed = 1 / 60.0;   // Speed (how many days added to time on each render pass

/** @type{WebGL2RenderingContext} */
let gl;

/** @type{WebGLProgram} */
let program;

/** @type{HTMLCanvasElement} */
let canvas;

function main(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);
    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    u_color = gl.getUniformLocation(program, "u_color");

    mode = gl.TRIANGLES;

    gl.clearColor(0.4, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);

    resize();
    window.addEventListener('keydown', function (event) {
        let input = event.key;
        switch (input) {
            case 'a':
                if(truckPos > -10.5)
                    truckPos -= 0.1;
                    wheelAngle += 1;
                break;
            case 'd':
                if (truckPos < 8.0)
                    truckPos += 0.1;
                    wheelAngle -= 1.0;
                break;
            case 'q':
                stairBaseAngle += 1;
                break;
            case 'e':
                stairBaseAngle -= 1.0;
                break;
            case 'w':
                if(ladderInclination < 55)
                    ladderInclination += 1;
                break;
            case 's':
                if(ladderInclination > 0)
                    ladderInclination -= 1;
                break;
            case 'o':
                if(upperLadderPos < 4.65)
                    upperLadderPos += 0.1;
                break;
            case 'p':
                if(upperLadderPos > 0.0)
                    upperLadderPos -= 0.1;
                break;
            case 'n':
                if(doorPos < 6.5)
                    doorPos += 0.1;
                break;
            case 'm':
                if(doorPos > 0.9)
                    doorPos -= 0.1;
                break;
            case ' ':
                if(mode == gl.LINES)
                    mode = gl.TRIANGLES;
                else
                    mode = gl.LINES;
                break;
            case 'r':
                zoom = 12;
                theta = 10;
                gamma = 9;
                break;
            case '4':
                big_view = axo_view;
                break;
            case '3':
                big_view = top_view;
                break;
            case '2':
                big_view = left_view;
                break;
            case '1':
                big_view = front_view;
                break;
            case '0': toggle_view_mode();
                break;
            case 'ArrowLeft':
                if (theta <19)
                    theta += 0.05;
                break;
            case 'ArrowRight':
                if (theta >-21)
                    theta -= 0.05;
                break;
            case 'ArrowUp':
                if (gamma <19)
                    gamma -= 0.05;
                break;
            case 'ArrowDown':
                if (gamma >-21)
                    gamma += 0.05;
                break;
        }
    });
    
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

function updateModelView() {
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(modelView()));
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
    CYLINDER.init(gl);
    TORUS.init(gl);
}

function draw_scene(view) {
    gl.useProgram(program);

    projection = ortho(-aspect * zoom, aspect * zoom, -zoom, zoom, -100, 100);
    updateProjection(gl, program, projection);

    loadMatrix(view);

    // Scene graph traversal code goes here...
    //---------Scenery---------//
    //Floor
    pushMatrix();
        floor();
    popMatrix();
    //Poles
    pushMatrix();
        poles();
    popMatrix();
    //Entrance
    pushMatrix();
        entrance();
    popMatrix();
    //---------Scenery---------//
    //---------Fire Truck---------//
    pushMatrix();
        multTranslation([1.0 + truckPos, 0.0, 1.0]);
        // Wheels and wheel connectors
        chassis();
        // Truck Base
        pushMatrix();
            multTranslation([0.0, 0.0, 0.0]);
            truckBase();
        popMatrix();
        pushMatrix();
            bumpers();
        popMatrix();
        // Cabin
        pushMatrix();
            cabin();
        popMatrix();
        // Water tank
        pushMatrix();
            waterTank();
        popMatrix();
        // Decals
        pushMatrix();
            decal();
        popMatrix();
        // Stairs      
        pushMatrix();         
            multTranslation([3.2,4.4,0.0]);
            multRotationY(stairBaseAngle);
            stairBaseRotation();
            pushMatrix();
                multTranslation([0.0,0.8,0.0]);
                stairBaseElevation();
                multRotationZ(-ladderInclination);
                pushMatrix();
                    multTranslation([-2.0,0.5,0.0]);
                    multScale([1.0, 1.0, 0.75]);
                    lowerStair();  
                    multTranslation([-upperLadderPos, 0.0, 0.0]);                     
                    upperStair();
                popMatrix();
            popMatrix(); 
        popMatrix();
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
    if (animation) time += speed;
    window.requestAnimationFrame(render);

    let eyeX = 5 * Math.cos(theta) * Math.cos(gamma);
    let eyeY = 5 * Math.sin(gamma);
    let eyeZ = 5 * Math.sin(theta) * Math.cos(gamma);

    front_view = lookAt([-10, 0, 0], [0, 0, 0], [0, 1, 0]);
    top_view = lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);
    left_view = lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0]);
    axo_view = lookAt([eyeX, eyeY, eyeZ], [0, 0, 0], [0, 1, 0]);
    big_view = axo_view;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_views();
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => main(shaders));