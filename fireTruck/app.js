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
let cameraAngle = 10; // Camera angle of the axonometric projection
let truckPos = 0;   // Position of truck in the x axis
let wheelAngle = 0; // Angle of a wheel in the z axis
let stairBaseAngle = 0; // Angle of the stair base in the y axis
let ladderInclination = -80; // Angle of the ladder in the z axis
let upperLadderPos = 0; // Position of the upper stairs 
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
                truckPos -= 0.1;
                wheelAngle += 1;
                break;
            case 'd':
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
                // TODO: Implement ladder movement
                break;
            case 's':
                // TODO: Implement ladder movement
                break;
            case 'o':
                // TODO: Implement ladder movement
                break;
            case 'p':
                // TODO: Implement ladder movement
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
                cameraAngle += 1;
                break;
            case 'ArrowRight':
                cameraAngle -= 1;
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
                CUBE.draw(gl, program, mode);

                popMatrix();
            }
        }
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
                    gl.uniform4fv(u_color, color);
                    CYLINDER.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();
            popMatrix();
        }   
        //----------Rim----------//
    }

    // Cilinders that connect each pair of wheels (front and back)
    function wheelConnector() {
        pushMatrix();

        let color = vec4(0.5, 0.5, 0.5, 1.0);
        let outlineColor = vec4(0.1, 0.1, 0.1, 1.0);
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
            let outlineColor = vec4(0.1, 0.1, 0.1, 1);
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
        let outlineColor = vec4(0.1, 0.1, 0.1, 1);
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
            let outlineColor = vec4(0.1, 0.1, 0.1, 1);
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

    function cabin() {
        //Stretch cube on top of the shassis
        let color = vec4(1.0, 0.0, 0.0, 1);
        let outlineColor = vec4(0.1, 0.1, 0.1, 1);
        gl.uniform4fv(u_color, color);
        multTranslation([-3.7, 3.0, 0.0]);
        multScale([2.25, 3.00, 4.0]);
        uploadModelView();
        CUBE.draw(gl, program, mode);
        pushMatrix();
            gl.uniform4fv(u_color, outlineColor);
            CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
        popMatrix();
    }

    function waterTank() {
        //Stretch cube on top of the shassis
        let color = vec4(1.0, 0.0, 0.0, 1);
        let outlineColor = vec4(0.1, 0.1, 0.1, 1);
        gl.uniform4fv(u_color, color);
        multTranslation([1.25, 3.0, 0.0]);
        multScale([7.0, 2.5, 4.0]);
        uploadModelView();
        CUBE.draw(gl, program, mode);
        pushMatrix();
            gl.uniform4fv(u_color, outlineColor);
            CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
        popMatrix();
    }

    function stairBaseRotation() {
        //Shorten cylinder on top of the waterTank (rotates)
        pushMatrix();
            let color = vec4(1.0, 0.45, 0.0, 1);
            let outlineColor = vec4(0.1, 0.1, 0.1, 1);
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

    function stairBaseElevation() {
        //Cube stays in place
        //lower and upper stairs elevate
        let color = vec4(0.3, 0.3, 0.3, 1);
        let outlineColor = vec4(0.1, 0.1, 0.1, 1);
        gl.uniform4fv(u_color, color);
        multScale([1.3,0.9,1.3]);
        uploadModelView();
        CUBE.draw(gl, program, mode);
        pushMatrix();
            gl.uniform4fv(u_color, outlineColor);
            CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
        popMatrix();
    }

    function stair(tmp) {
        const ladderSteps = 9 + 1; // Number of steps on the lower stair (change first number & ignore +1)
        const railWidth = 0.16;
        const railDepth = 0.16;
        const stepHeight = 0.2; // Height of each step
        const stepWidth = 1.5; // Width of each step
        const stepDepth = railDepth; // Depth of each step
        const stepSpacing = 0.6; // Increased spacing between steps
        pushMatrix();
        multRotationY(90);
        multRotationX(tmp);

        // Create and position the left rail
        pushMatrix();
            let color = vec4(0.3, 0.3, 0.3, 1);
            let outlineColor = vec4(0.1, 0.1, 0.1, 1);
            gl.uniform4fv(u_color, color);
            multTranslation([stepWidth/2*-1, 0.0, 0.0]);
            multScale([railWidth, ladderSteps * (stepHeight + stepSpacing), railDepth]);
            uploadModelView();
            CUBE.draw(gl, program, mode);
            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();
        popMatrix();

        // Create and position the right rail
        pushMatrix();
            multTranslation([stepWidth/2, 0.0, 0.0]);
            multScale([railWidth, ladderSteps * (stepHeight + stepSpacing), railDepth]);
            uploadModelView();
            CUBE.draw(gl, program, mode);
            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();
        popMatrix();

        // Create and position each step
        for (let i = 2; i < ladderSteps; i++) {
            pushMatrix();
                multTranslation([0.0, i * (stepHeight + stepSpacing) - (ladderSteps * (stepHeight + stepSpacing)) / 2 + stepHeight / 2, 0.0]);
                multScale([stepWidth, stepHeight, stepDepth]);
                uploadModelView();
                CUBE.draw(gl, program, mode);
                pushMatrix();
                    gl.uniform4fv(u_color, outlineColor);
                    CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
                popMatrix();
            popMatrix();
        }
        popMatrix();


        

    }


    function lowerStair() {
    //Stair that stays in place
    
    pushMatrix();
            multTranslation([2.2,-0.4,0]);
            stairBaseElevation();
    popMatrix();
    multTranslation([-1.3,-0.5,0]);
    stair(-90);

    }

    function upperStair() {
        //Stair that extends
        pushMatrix();
            multTranslation([-0.08,0.16+0,0]);
            stair(-90);
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
                loadMatrix(lookAt([cameraAngle, 5, cameraAngle], [0, 0, 0], [0, 1, 0])); // Axonometric Projection View
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
        pushMatrix();
            floor();
        popMatrix();
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
            // Stairs      
            pushMatrix();         
                multTranslation([3.2,4.4,0.0]);
                multRotationY(stairBaseAngle);
                stairBaseRotation();
                pushMatrix();
                    multTranslation([-2.2,1.2,0]);
                    lowerStair();                       
                    upperStair();
                popMatrix(); 
            popMatrix();
        popMatrix();
    }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))