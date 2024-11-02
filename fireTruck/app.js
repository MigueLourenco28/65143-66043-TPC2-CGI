import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, vec4 } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ } from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';

/** @type WebGLRenderingContext */
let gl;

let time = 0;           // Global simulation time in days
let speed = 1 / 60.0;   // Speed (how many days added to time on each render pass
let mode;               // Drawing mode (gl.LINES or gl.TRIANGLES)
let animation = false; // Animation is running
let truckPos = 0;   // Position of truck in the z axis
let stairBaseAngle = 0; // Angle of the stair base in the y axis
let ladderInclination = 0; // Angle of the ladder in the x axis
let upperLadderPos = 0; // Position of the upper stairs 

const VP_DISTANCE = 4; //colocar 4

function moveTruck(direction) {
    switch (direction) {
        case 'a':
            truckPos += 0.1;
            break;
        case 'd':
            truckPos -= 0.1;
            break;
    }
}

function rotateStairBase(direction) {
    switch (direction) {
        case 'q':
            stairBaseAngle += 1;
            break;
        case 'e':
            stairBaseAngle -= 1;
            break;
    }
}

function moveLadder(direction) {
    switch (direction) {
        case 'w':
            // TODO: Implement ladder movement
            break;
        case's':
            // TODO: Implement ladder movement
            break;
        case 'o':
            // TODO: Implement ladder movement
            break;
        case 'p':
            // TODO: Implement ladder movement
            break;
    }
}

function setup(shaders) {
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-VP_DISTANCE * aspect, VP_DISTANCE * aspect, -VP_DISTANCE, VP_DISTANCE, -3 * VP_DISTANCE, 3 * VP_DISTANCE);

    mode = gl.TRIANGLES;

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    document.onkeydown = function (event) {
        let input = event.key;
        switch (input) {
            case 'a':
                moveTruck(input);
                break;
            case 'd':
                moveTruck(input);
                break;
            case 'q':
                rotateStairBase(input);
                break;
            case 'e':
                rotateStairBase(input);
                break;
            case 'w':
                moveLadder(input);
                break;
            case 's':
                moveLadder(input);
                break;
            case 'o':
                moveLadder(input);
                break;
            case 'p':
                moveLadder(input);
                break;
        }
    }

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    CYLINDER.init(gl);
    CUBE.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

    window.requestAnimationFrame(render);


    function resize_canvas(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0, 0, canvas.width, canvas.height);
        mProjection = ortho(-VP_DISTANCE * aspect, VP_DISTANCE * aspect, -VP_DISTANCE, VP_DISTANCE, -3 * VP_DISTANCE, 3 * VP_DISTANCE);
    }

    function uploadModelView() {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model_view"), false, flatten(modelView()));
    }

    let u_color = gl.getUniformLocation(program, "u_color");

    //-------FireTruck-------//

    function floor() {
        //Stretch cube on the floor?
        //Base of the Truck
        const tileSize = 0.5; // Size of each tile
        const gridSize = 5; // Total size of the floor grid

        for (let i = -gridSize; i < gridSize; i++) {
            for (let j = -gridSize; j < gridSize; j++) {
                pushMatrix();
            
                // Alternate colors for the checkered pattern
                let color = (i + j) % 2 === 0 ? vec4(0.8, 0.8, 0.8, 1) : vec4(0.2, 0.2, 0.2, 1);
                gl.uniform4fv(u_color, color);
            
                // Position each tile
                multTranslation([i * tileSize, -0.1, j * tileSize]);
                multScale([tileSize, 0.05, tileSize]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                popMatrix();
            }
        }
    }

    function wheel() {
        //Torus plus cylinders for the  rim
        //Spin on the x axis and sync with the translation (car movement)
    }

    function wheelConnector() {
        //Cylinder connecting two wheels
    }

    function chassis() {
        //Stretch cube on top of the wheel connectors
    }

    function bumper() {
        //Stretch cube to be on the side of the chassis
    }

    function cabin() {
        //Stretch cube on top of the shassis
    }

    function waterTank() {
        //Stretch cube on top of the shassis
    }

    function stairBaseRotation() {
        //Stretch cube on top of the waterTank (rotates)
    }

    function stairBaseElevation() {
        //Cube stays in place
        //lower and upper stairs elevate
    }

    function lowerStair() {
        //Stair that stays in place
    }

    function upperStair() {
        //Stair that extends
    }

    //-------FireTruck-------//

    function render() {
        if (animation && time < 0.11) {
            time += 0.01;
        }

        if (!animation && time > 0) {
            time -= 0.01;
        }

        // if (animation) time += speed;

        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_projection"), false, flatten(mProjection));

        loadMatrix(lookAt([1.5, 1, VP_DISTANCE], [0, 0, 0], [0, 1, 0])); // mudar um bocado para os lados

        // Scene graph traversal code goes here...
        pushMatrix();
            floor();
        popMatrix();
        /** 
         *pushMatrix(); // FireTruck
         *  pushMatrix(); // Stationary Body
         * 
         *      chassis();
         *      bumper();
         *      cabin();
         *      waterTank();
         * 
         *      pushMatrix(); // Moving Parts
         *  
         *          pushMatrix(); //Wheels
         *              wheel();    
         *              wheel();
         *              wheel();
         *              wheel();
         *              wheelConnector();
         *              wheelConnector();
         *          popMatrix(); //Wheels
         *          pushMatrix(); //Chassis
         *              chassis();
         *          popMatrix(); //Chassis
         *          pushMatrix() //Stairs
         * 
         *              pushMatrix(); // Rotation
         *                  stairBaseRotation();
         *                  
         *                  pushMatrix(); // Elevation
         *                      stairBaseElevation();
         * 
         *                      pushMatrix();
         *                          lowerStair();
         * 
         *                          pushMatrix(); // Extension
         *                              upperStair();
         *                              extend();???
         * 
         *                          popMatrix(); // Extension
         * 
         *                      popMatrix();
         * 
         *                  popMatrix(); // Elevation
         * 
         *              popMatrix(); // Rotation
         * 
         *          popMatrix() // Stairs
         * 
         *      popMatrix(); // Moving Parts
         * 
         *  popMatrix(); // Stationary Body
         * 
         *popMatrix(); // FireTruck
         */
        //-------FireTruck-------// 

    }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))