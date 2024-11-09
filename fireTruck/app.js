import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, vec4 } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ } from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as TORUS from '../../libs/objects/torus.js';
import { chassis, cabin, waterTank, decal, lowerStair, upperStair, stairBaseRotation, stairBaseElevation, bumpers, truckBase } from './fireTruck.js';
import { entrance, floor, poles } from './scenery.js';

export { outlineColor, program, u_color, mode, time, doorPos, wheelAngle, uploadModelView, gl };

/** @type WebGLRenderingContext */
let zoom = 12;

let gl;

let time = 0;           // Global simulation time in days
let speed = 1 / 60.0;   // Speed (how many days added to time on each render pass
let mode;               // Drawing mode (gl.LINES or gl.TRIANGLES)
let animation = false; // Animation is running
let program;
let u_color;
let mProjection;

let truckPos = 0.0;   // Position of truck in the x axis
let doorPos = 0.9; // Position of the door in the y axis
let upperLadderPos = 0.0; // Position of the upper stairs

const wheelRadius = 1;
let wheelAngle = 0; // Angle of a wheel in the z axis
let stairBaseAngle = 0; // Angle of the stair base in the y axis
let ladderInclination = 0; // Angle of the ladder in the z axis
 
let outlineColor = vec4(0.2, 0.2, 0.2, 1.0); // Color of the outline of an object

let theta = 10; // Horizontal camera angle of the axonometric projection
let gamma = 9; // Vertical camera angle of the axonometric projection
let view = 4; // Current View

function setup(shaders) {
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    mProjection = ortho(-zoom * aspect, zoom * aspect, -zoom, zoom, -3 * zoom, 3 * zoom);

    mode = gl.TRIANGLES;

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    document.onkeydown = function (event) {
        let input = event.key;
        switch (input) {
            case 'a':
                if(truckPos > -10.5)
                    truckPos -= 0.1;
                    wheelAngle += truckPos*wheelRadius; //TODO
                break;
            case 'd':
                if (truckPos < 8.0)
                    truckPos += 0.1;
                    wheelAngle -= truckPos*wheelRadius; //TODO
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
                view = input;
                break;
            case '3':
                view = input;
                break;
            case '2':
                view = input;
                break;
            case '1':
                view = input;
                break;
            case '0':
                view = input;
                break;
            case 'ArrowLeft':
                if (theta <19)
                    theta += 0.1;
                break;
            case 'ArrowRight':
                if (theta >-21)
                    theta -= 0.1;
                break;
            case 'ArrowUp':
                if (gamma <19)
                    gamma -= 0.1;
                break;
            case 'ArrowDown':
                if (gamma >-21)
                    gamma += 0.1;
                break;
        }
    }

    document.addEventListener('wheel', function(event) {
        if (event.deltaY < 0) {
            zoom -= 0.5; // Zoom in
        } else {
            zoom += 0.5; // Zoom out
        }
        resize_canvas();
    });

    gl.clearColor(0.4, 0.1, 0.1, 1.0);
    CYLINDER.init(gl);
    CUBE.init(gl);
    TORUS.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

    window.requestAnimationFrame(render);

    u_color = gl.getUniformLocation(program, "u_color");

    function resize_canvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0, 0, canvas.width, canvas.height);
        mProjection = ortho(-zoom * aspect, zoom * aspect, -zoom, zoom, -3 * zoom, 3 * zoom);
    }
}
    
function uploadModelView() {
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(modelView()));
}


//-------1/4 View-------//
    

//-------1/4 View-------//

function render() {
    if (animation) time += speed;

    // if (animation) time += speed;

    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), false, flatten(mProjection));

    let eyeX = 5 * Math.cos(theta) * Math.cos(gamma);
    let eyeY = 5 * Math.sin(gamma);
    let eyeZ = 5 * Math.sin(theta) * Math.cos(gamma);

    
    
    switch (view) {
        case '4':
            loadMatrix(lookAt([eyeX, eyeY, eyeZ], [0, 0, 0], [0, 1, 0])); // Axonometric Projection View
            break;
        case '3':
            loadMatrix(lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1])); // Top View
            break;
        case '2':
            loadMatrix(lookAt([-10, 0, 0], [0, 0, 0], [0, 1, 0])); // Front View
            break;
        case '1':
            loadMatrix(lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0])); // Left View
            break;
        case '0':
            //TODO: 1/4 View
            break;
    } 

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
    //---------Fire Truck---------//
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))