import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, vec4 } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ } from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as TORUS from '../../libs/objects/torus.js';

/** @type WebGLRenderingContext */
let gl;

let time = 0;           // Global simulation time in days
let speed = 1 / 60.0;   // Speed (how many days added to time on each render pass
let mode;               // Drawing mode (gl.LINES or gl.TRIANGLES)
let animation = false; // Animation is running
let theta = 10; // Camera angle of the axonometric projection
let truckPos = 0.0;   // Position of truck in the x axis
let wheelAngle = 0; // Angle of a wheel in the z axis
let stairBaseAngle = 0; // Angle of the stair base in the y axis
let ladderInclination = 0; // Angle of the ladder in the z axis
let upperLadderPos = 0.0; // Position of the upper stairs 
let outlineColor = vec4(0.2, 0.2, 0.2, 1.0); // Color of the outline of an object
let view = 4; // View

const VP_DISTANCE = 12;


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
                if(truckPos>-10.5)
                    truckPos -= 0.1;
                    wheelAngle += 1;
                break;
            case 'd':
                if (truckPos<8)
                    truckPos += 0.1;
                    wheelAngle -= 1;
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
            case ' ':
                if(mode == gl.LINES)
                    mode = gl.TRIANGLES;
                else
                    mode = gl.LINES;
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
                theta += 1;
                break;
            case 'ArrowRight':
                if (theta >-21)
                theta -= 1;
                break;
        }
    }

    gl.clearColor(0.4, 0.1, 0.1, 1.0);
    CYLINDER.init(gl);
    CUBE.init(gl);
    TORUS.init(gl);
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

    //Base ground for the fire truck
    function floor() {
        //Stretch cube on the floor
        //Base of the Truck
        const tileSize = 0.5; // Size of each tile
        const gridSize = 25; // Total size of the floor grid

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
                CUBE.draw(gl, program, gl.TRIANGLES);

                popMatrix();
            }
        }
    }

    //Poles that the fire fighters use to descend to the fire truck
    function poles() {
        //Bases
        pushMatrix();

            let baseColor = vec4(0.1, 0.1, 0.1, 1.0);
            gl.uniform4fv(u_color, baseColor);

            multTranslation([-6.0, 0.0, -8.0]);
            multScale([2.0, 0.2, 2.0]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, baseColor);

            multTranslation([6.0, 0.0, -8.0]);
            multScale([2.0, 0.2, 2.0]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

        popMatrix();

        //Poles
        pushMatrix();

            let poleColor = vec4(0.4, 0.4, 0.4, 1.0);
            gl.uniform4fv(u_color, poleColor);

            multTranslation([-6.0, 5.0, -8.0]);
            multScale([0.5, 10.0, 0.5]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);
        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, poleColor);

            multTranslation([6.0, 5.0, -8.0]);
            multScale([0.5, 10.0, 0.5]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

        popMatrix();
    }

    //Entrance/exit of the truck to/from the fire department
    function entrance() {
        //Wall
        pushMatrix();

            let wallColor = vec4(0.4, 0.4, 0.4, 1.0);
            gl.uniform4fv(u_color, wallColor);

            multTranslation([-12.5, 9.0, -0.4]);
            multScale([0.2, 2.5, 25.0]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, wallColor);

            multTranslation([-12.5, 4.4, -7.9]);
            multScale([0.2, 9.0, 10.0]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, wallColor);

            multTranslation([-12.5, 4.4, 8.35]);
            multScale([0.2, 9.0, 7.5]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        //Garage door
        pushMatrix();

            let doorBorderColor = vec4(1.0, 1.0, 1.0, 1.0);
            gl.uniform4fv(u_color, doorBorderColor);

            multTranslation([-12.5, 3.9, 4.75]);
            multScale([0.3, 8.0, 0.3]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, doorBorderColor);

            multTranslation([-12.5, 3.9, -3.0]);
            multScale([0.3, 8.0, 0.3]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, doorBorderColor);

            multTranslation([-12.5, 7.75, 0.9]);
            multRotationX(90);
            multScale([0.3, 8.0, 0.3]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();
    }

    // Make a wheel composed by a tire and rim for the fire truck
    function wheel() {
        //Torus plus cylinders for the  rim
        //Cylinder connecting two wheels
        //Spin on the x axis and sync with the translation (car movement)
        
        //----------Tire----------//
        pushMatrix();

            let color = vec4(0.1, 0.1, 0.1, 1.0);
            let rimColor = vec4(0.5, 0.5, 0.5, 1.0);
            gl.uniform4fv(u_color, color);

            uploadModelView();
            TORUS.draw(gl, program, mode);

        popMatrix();
        //----------Tire----------//
        //----------Rim----------//
        const numberOfSpokes = 20; // Increased density for spokes
        const spokeRadius = 0.03;
        const rimRadius = 0.5; // Slightly smaller than the tire radius

        multRotationX(90);

        for (let i = 0; i < numberOfSpokes; i++) {
            pushMatrix();        
                // Set color for the rim and spokes
                gl.uniform4fv(u_color, rimColor); // Gray color for the rim

                // Rotate each spoke around the wheel center
                const angle = (360 / numberOfSpokes) * i;
                multRotationZ(angle);

                // Position and scale each spoke from the center to the rim
                multTranslation([rimRadius / 2, 0, 0]);
                multScale([rimRadius, spokeRadius, spokeRadius]);

                uploadModelView();
                CYLINDER.draw(gl, program, mode); // Draws each spoke as a thin cylinder

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CYLINDER.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();

            popMatrix();
        }   
        //----------Rim----------//
    }

    // Cylinders that connect each pair of wheels (front and back)
    function wheelConnector() {
        pushMatrix();

            let color = vec4(0.5, 0.5, 0.5, 1.0);
            gl.uniform4fv(u_color, color);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CYLINDER.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
    }

    //Contains the wheels, the wheels connectors and the a cover on top of them
    function chassis() {
        //Stretch cube on top of the wheel connectors
        //----------Wheels----------//
        pushMatrix();
            multTranslation([-3.0, 0.65, 2.0]);
            multRotationY(90);
            multRotationZ(90);
            multRotationY(wheelAngle);
            wheel();
        popMatrix();
        pushMatrix();
            multTranslation([-3.0, 0.65, -2.0]);
            multRotationY(90);
            multRotationZ(90);
            multRotationY(wheelAngle);
            wheel();
        popMatrix();
        pushMatrix();
            multTranslation([3.0, 0.65, 2.0]);
            multRotationY(90);
            multRotationZ(90);
            multRotationY(wheelAngle);
            wheel();
        popMatrix();
        pushMatrix();
            multTranslation([3.0, 0.65, -2.0]);
            multRotationY(90);
            multRotationZ(90);
            multRotationY(wheelAngle);
            wheel();
        popMatrix();
        //----------Wheels----------//
        //----------Wheel Connectors----------//
        pushMatrix();
            multTranslation([3.0, 0.65, 0.0]);
            multRotationX(90);
            multScale([0.2, 4.0, 0.2]);
            wheelConnector();
        popMatrix();
        pushMatrix();
            multTranslation([-3.0, 0.65, 0.0]);
            multRotationX(90);
            multScale([0.2, 4.0, 0.2]);
            wheelConnector();
        popMatrix();
        //----------Wheel Connectors----------//
        //----------Chassis Cover----------//
        pushMatrix();

            let color = vec4(1.0, 0.0, 0.0, 1);
            gl.uniform4fv(u_color, color);

            multTranslation([0.0, 1.0, 0.0]);
            multScale([10.0, 0.5, 3.5]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
        //----------Chassis Cover----------//
    }

    //Base for the upper part of the truck
    function truckBase() {
        let color = vec4(1.0, 0.0, 0.0, 1);
        gl.uniform4fv(u_color, color);

        multTranslation([0.0, 1.5, 0.0]);
        multScale([10.0, 0.5, 4.5]);

        uploadModelView();
        CUBE.draw(gl, program, mode);

        pushMatrix();
            gl.uniform4fv(u_color, outlineColor);
            CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
        popMatrix();
    }

    function bumpers() {
        //Stretch cube to be on the side of the chassis
        //----------Front Bumper----------//
        pushMatrix();

            let color = vec4(1.0, 1.0, 1.0, 1);
            gl.uniform4fv(u_color, color);

            multTranslation([-5.11, 1.0, 0.0]);
            multScale([0.25, 0.5, 4.5]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([-4.5, 1.0, 2.0]);
            multScale([1.5, 0.5, 0.4]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([-4.5, 1.0, -2.0]);
            multScale([1.5, 0.5, 0.4]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
        //----------Front Bumper----------//
        //----------Side Bumpers----------//
        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([0.0, 1.0, 2.0]);
            multScale([4.5, 0.5, 0.4]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([0.0, 1.0, -2.0]);
            multScale([4.5, 0.5, 0.4]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
        //----------Side Bumpers----------//
        //----------Back Bumper----------//
        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([5.11, 1.0, 0.0]);
            multScale([0.25, 0.5, 4.5]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([4.5, 1.0, 2.0]);
            multScale([1.5, 0.5, 0.4]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, color);

            multTranslation([4.5, 1.0, -2.0]);
            multScale([1.5, 0.5, 0.4]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
        //----------Back Bumper----------//
    }

    //Cabin where the fire fighters drive the truck
    function cabin() {
        //Stretch cube on top of the shassis
        pushMatrix();

            let color = vec4(1.0, 0.0, 0.0, 1);
            gl.uniform4fv(u_color, color);

            multTranslation([-3.7, 3.0, 0.0]);
            multScale([2.25, 3.00, 4.0]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
        //------Windows------//
        pushMatrix();

            let windowColor = vec4(0.6, 0.6, 0.9, 1.0);
            gl.uniform4fv(u_color, windowColor);

            multTranslation([-4.8, 3.5, 0.0]);
            multScale([0.25, 1.5, 3.5]);

            uploadModelView();
            CUBE.draw(gl, program, mode);
        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, windowColor);

            multTranslation([-3.9, 3.5, 2.0]);
            multRotationY(90);
            multScale([0.25, 1.5, 1.25]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, windowColor);

            multTranslation([-3.9, 3.5, -2.0]);
            multRotationY(90);
            multScale([0.25, 1.5, 1.25]);

            uploadModelView();
            CUBE.draw(gl, program, mode);
        popMatrix();
        //------Windows------//
        //------Blinkers------//
        pushMatrix();

            let blinkerColor = vec4(1.0, 1.0, 0.0, 1.0);
            gl.uniform4fv(u_color, blinkerColor);

            multTranslation([-4.75, 2.25, 1.5]);
            multRotationZ(90);
            multScale([0.5, 0.25, 0.5]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, blinkerColor);

            multTranslation([-4.75, 2.25, -1.5]);
            multRotationZ(90);
            multScale([0.5, 0.25, 0.5]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

        popMatrix();
        //------Blinkers------//
        //------Head Lights------//
        pushMatrix();

            let blueLight = vec4(0.0, 0.0, 1.0, 1);
            let redLight = vec4(1.0, 0.0, 0.0, 1.0);
            let whiteSeperator = vec4(1.0, 1.0, 1.0, 1.0);

            multTranslation([-3.75, 4.6, 0.0]);

            pushMatrix();

                gl.uniform4fv(u_color, blueLight);

                multTranslation([0.0, 0.0, -0.5]);
                multScale([0.5, 0.25, 0.5]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();

            popMatrix();

            pushMatrix();

                gl.uniform4fv(u_color, whiteSeperator);

                multScale([0.5, 0.25, 0.5]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();

            popMatrix();

            pushMatrix();

                gl.uniform4fv(u_color, redLight);

                multTranslation([0.0, 0.0, 0.5]);
                multScale([0.5, 0.25, 0.5]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();

            popMatrix();

        popMatrix();
        //------Head Lights------//
    }

    function waterTank() {
        pushMatrix();
            //Stretch cube on top of the shassis
            let color = vec4(1.0, 0.0, 0.0, 1);
            gl.uniform4fv(u_color, color);

            multTranslation([1.25, 3.0, 0.0]);
            multScale([7.0, 2.5, 4.0]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
    }

    //Cylinder that controls the rotation of the stairs and the base elevation
    function stairBaseRotation() {
        //Shorten cylinder on top of the waterTank (rotates)
        pushMatrix();

            let color = vec4(1.0, 0.45, 0.0, 1);
            gl.uniform4fv(u_color, color);

            multScale([2.2, 0.7, 2.2]);

            uploadModelView();
            CYLINDER.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CYLINDER.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
    }

    //Cube that is the stand for the stairs that controls the elevation of the stairs
    function stairBaseElevation() {
        //Cube stays in place
        //lower and upper stairs elevate
        let color = vec4(0.3, 0.3, 0.3, 1);
        gl.uniform4fv(u_color, color);
        
        multScale([1.3,0.9,1.3]);

        uploadModelView();
        CUBE.draw(gl, program, mode);

        pushMatrix();
            gl.uniform4fv(u_color, outlineColor);
            CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
        popMatrix();
    }

    function stair() {
        
        const stairWidth = 0.16;
        const stairDepth = stairWidth;
        const stepNr = 8 + 2; // Number of steps on the lower stair (1st nr = nr of steps, 2nd nr = when 1st step starts)
        const stepHeight = 0.2;
        const stepWidth = 1.5;
        const stepDepth = stairDepth-0.04;
        const stepDistance = 0.4;
        const stepSpace = stepHeight + stepDistance; // Space needed for each step
        const stairHeight = stepNr * stepSpace;

        pushMatrix();

            multRotationY(90);
            multRotationX(-90);

            // Left side
            pushMatrix();
            
                let color = vec4(0.3, 0.3, 0.3, 1);
                gl.uniform4fv(u_color, color);

                multTranslation([stepWidth/2*-1, 0, 0]);
                multScale([stairWidth, stairHeight, stairDepth]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

            // Right side
            pushMatrix();

                multTranslation([stepWidth/2, 0, 0]);
                multScale([stairWidth, stairHeight, stairDepth]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

            // Steps
            for (let i = 2; i < stepNr; i++) { // i=2 creates space for connection with stairBaseElevation
                pushMatrix();

                    multTranslation([0, i * stepSpace - stairHeight/2 , 0]); // stairHeight/2 centers steps
                    multScale([stepWidth, stepHeight, stepDepth]);

                    uploadModelView();
                    CUBE.draw(gl, program, mode);

                    pushMatrix();
                        gl.uniform4fv(u_color, outlineColor);
                        CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                        gl.uniform4fv(u_color, color);
                    popMatrix();

                popMatrix();
            }

        popMatrix();
    }


    function lowerStair() {
        //Stair that stays in place
        pushMatrix();
            multTranslation([-0.7,-0.6,0]);
            stair();
        popMatrix();
    }

    function upperStair() {
        //Stair that extends
        pushMatrix();
            multTranslation([-0.78,-0.42,0]);
            stair();
        popMatrix();
    }


    // Decals - Write each character on the sides of the truck
    function decalC() {
        pushMatrix();

            let color = vec4(0.6, 0, 0 , 1.0);
            gl.uniform4fv(u_color, color);
        
            // Upper line
            pushMatrix();

                multTranslation([-0.2, 0.3, -0.001]);
                multScale([0.2, 0.2, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

            // Left line
            pushMatrix();

                multTranslation([-0.3, 0, 0]);
                multScale([0.1, 0.6, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Lower line
            pushMatrix();

                multTranslation([-0.2, -0.3, -0.001]);
                multScale([0.2, 0.2, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

        popMatrix();
    }
    
    function decalG() {
        pushMatrix();

            let color = vec4(0.6, 0, 0, 1.0);
            gl.uniform4fv(u_color, color);
        
            // Upper line
            pushMatrix();

                multTranslation([-0.15, 0.3, 0]);
                multScale([0.2, 0.2, 0.01]);
                
                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Left line
            pushMatrix();

                multTranslation([-0.3, 0, 0]);
                multScale([0.1, 0.6, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Lower line
            pushMatrix();

                multTranslation([-0.15, -0.3, 0]);
                multScale([0.2, 0.2, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Right line
            pushMatrix();

                multTranslation([-0.1, -0.13, -0.004]);
                multScale([0.05, 0.4, 0.01]);
                
                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();
                
            popMatrix();
        
            // Dot
            pushMatrix();

                multTranslation([-0.1, 0, 0]);
                multScale([0.1, 0.2, 0.01]);
                
                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();

            popMatrix();

        popMatrix();
    }
    
    function decalI() {
        pushMatrix();

            let color = vec4(0.6, 0, 0, 1.0);
            gl.uniform4fv(u_color, color);
        
            pushMatrix();
                multTranslation([0, 0, 0]);
                multScale([0.1, 0.8, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();

            popMatrix();

        popMatrix();
    }
    
    function decalT() {
        pushMatrix();

            let color = vec4(0.6, 0, 0, 1.0);
            gl.uniform4fv(u_color, color);
        
            // Upper line
            pushMatrix();

                multTranslation([0, 0.8, 0]);
                multScale([2.0, 0.4, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Middle line
            pushMatrix();

                multTranslation([0, 0, 0]);
                multScale([0.4, 2.0, 0.01]);
                
                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

        popMatrix();
    }
    
    function decalP() {
        pushMatrix();

            let color = vec4(0.6, 0, 0, 1.0);            
            gl.uniform4fv(u_color, color);
        
            // Vertical line
            pushMatrix();

                multTranslation([-0.8, 0, 0]);
                multScale([0.4, 2.0, 0.01]);
                
                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Upper horizontal line
            pushMatrix();

                multTranslation([0, 0.8, 0]);
                multScale([1.2, 0.4, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Right vertical line
            pushMatrix();

                multTranslation([0.8, 0.4, 0]);
                multScale([0.4, 1.2, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

            // Bottom horizontal line
            pushMatrix();

                multTranslation([0, 0, 0]);
                multScale([1.2, 0.4, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

        popMatrix();
    }

    function decal2() {
        pushMatrix();

            let color = vec4(0.6, 0, 0, 1.0);
            gl.uniform4fv(u_color, color);
        
            // Top line
            pushMatrix();

                multTranslation([0, 0.8, 0]);
                multScale([2.0, 0.4, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();
                
            popMatrix();
        
            // Right line top
            pushMatrix();

                multTranslation([0.8, 0.4, 0]);
                multScale([0.4, 1.2, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();
                
            popMatrix();
        
            // Middle line
            pushMatrix();

                multTranslation([0, 0, 0]);
                multScale([2.0, 0.4, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Left line bottom
            pushMatrix();
                multTranslation([-0.8, -0.4, 0]);
                multScale([0.4, 1.2, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();
        
            // Bottom line
            pushMatrix();

                multTranslation([0, -0.8, 0]);
                multScale([2.0, 0.4, 0.01]);

                uploadModelView();
                CUBE.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();  

            popMatrix();

        popMatrix();
    }

    function firehose() {

        pushMatrix();

        let color = vec4(1, 1, 1, 1.0);
        gl.uniform4fv(u_color, color);
        
            // Outer Torus
            pushMatrix();

                multTranslation([0, 0, 0]);
                multRotationX(90);
                multRotationZ(90);
                multScale([1.5, 0.8, 1.5]);

                uploadModelView();
                TORUS.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    TORUS.draw(gl, program, gl.LINES); // Draw torus outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

            // Inner Torus
            pushMatrix();
                multTranslation([0.1, 0, 0]);
                multRotationX(90);
                multRotationZ(90);
                multScale([0.75, 0.8 , 0.75]);

                uploadModelView();
                TORUS.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    TORUS.draw(gl, program, gl.LINES); // Draw torus outline in wireframe
                    gl.uniform4fv(u_color, color);
                popMatrix();

            popMatrix();

            // Inner inner Torus
            pushMatrix();

                multTranslation([0.2, 0, 0]);
                multRotationX(90);
                multRotationZ(90);
                multScale([0.3575, 0.8 , 0.3575]);

                uploadModelView();
                TORUS.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    TORUS.draw(gl, program, gl.LINES); // Draw torus outline in wireframe
                popMatrix();

            popMatrix();

            // Hose
            pushMatrix();

                multTranslation([0.4, 0, 0]);
                multRotationX(90);
                multRotationZ(90);
                multScale([0.2, 0.2 , 0.2]);
        
                uploadModelView();
                CYLINDER.draw(gl, program, mode);

                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CYLINDER.draw(gl, program, gl.LINES); // Draw cylinder outline in wireframe
                popMatrix();

            popMatrix();

        popMatrix();
    }


    function decal() {
        pushMatrix();

            multTranslation([1.4, 3,2]);
            multScale([7.0, 2.5, 4.0]); // keeps proportions as intended

            pushMatrix();
                multTranslation([-0.1,0,0]);
                decalC();
            popMatrix();

            pushMatrix();
                multTranslation([0.23,0,0]);
                decalG();
            popMatrix();

            pushMatrix();
                multTranslation([0.33,0,0]);
                decalI();
            popMatrix();
        popMatrix();

        pushMatrix();

            multTranslation([1.2, 3 ,-2]);
            multScale([-1,1,1]);

            pushMatrix();
                multTranslation([-2.2, 0,0]);
                decalT();
            popMatrix();

            pushMatrix();
                decalP();
            popMatrix();

            pushMatrix();
                multTranslation([2.2, 0,0]);
                decal2();
            popMatrix();

        popMatrix();

        pushMatrix();
            multTranslation([4.9,3,0]);
            firehose();
        popMatrix();

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

        switch (view) {
            case '4':
                loadMatrix(lookAt([5, 5, theta + 1], [0, 0, 0], [0, 1, 0])); // Axonometric Projection View
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
                loadMatrix(lookAt([0, 0, 0], [0, 0, 0], [0, 0, 1])); // 1/4 View
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
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))