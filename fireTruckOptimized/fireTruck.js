import { vec4 } from "../../libs/MV.js";
import { multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ } from "../../libs/stack.js";
import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as TORUS from '../../libs/objects/torus.js';
import { outlineColor, program, u_color, mode, updateModelView, wheelAngle, gl } from "./app.js";

export { wheel, wheelConnector, chassis, truckBase, bumpers, cabin, waterTank, stairBaseRotation, stairBaseElevation, lowerStair, upperStair, decalC, decalG, decalI, decalT, decalP, decal2, decal, firehose };

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

        updateModelView();
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

            updateModelView();
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

        updateModelView();
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

        updateModelView();
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

    updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
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

        updateModelView();
        CUBE.draw(gl, program, mode);
    popMatrix();

    pushMatrix();

        gl.uniform4fv(u_color, windowColor);

        multTranslation([-3.9, 3.5, 2.0]);
        multRotationY(90);
        multScale([0.25, 1.5, 1.25]);

        updateModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();

    pushMatrix();

        gl.uniform4fv(u_color, windowColor);

        multTranslation([-3.9, 3.5, -2.0]);
        multRotationY(90);
        multScale([0.25, 1.5, 1.25]);

        updateModelView();
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

        updateModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    pushMatrix();

        gl.uniform4fv(u_color, blinkerColor);

        multTranslation([-4.75, 2.25, -1.5]);
        multRotationZ(90);
        multScale([0.5, 0.25, 0.5]);

        updateModelView();
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

            updateModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();

        pushMatrix();

            gl.uniform4fv(u_color, whiteSeperator);

            multScale([0.5, 0.25, 0.5]);

            updateModelView();
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

            updateModelView();
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

        updateModelView();
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

        updateModelView();
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

    updateModelView();
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

            updateModelView();
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

            updateModelView();
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

                updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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
            
            updateModelView();
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

            updateModelView();
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

            updateModelView();
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
            
            updateModelView();
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
            
            updateModelView();
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

            updateModelView();
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

            updateModelView();
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
            
            updateModelView();
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
            
            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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

            updateModelView();
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
    
            updateModelView();
            CYLINDER.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CYLINDER.draw(gl, program, gl.LINES); // Draw cylinder outline in wireframe
            popMatrix();

        popMatrix();

    popMatrix();
}

//Assemble all decals on the truck
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