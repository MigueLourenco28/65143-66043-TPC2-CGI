/*
Computação Gráfica e Interfaces 2024-2025
Projeto 2: Modelação e visualização duma carro de combate a incêndios

Alexandre Cristóvão 65143
Miguel Lourenço 66043

scenery.js: Responsible for creating and transforming scene's and truck's accessory components
*/

import { vec4 } from "../../libs/MV.js";
import { multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ } from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';

import { outlineColor, program, u_color, mode, updateModelView, doorPos, gl } from "./app.js";

export { floor, poles, entrance, clock };

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

                updateModelView();
                CUBE.draw(gl, program, gl.TRIANGLES);

            popMatrix();
        }
    }
}


//Poles that the fire fighters use to descend to the fire truck
function poles() {
    //Bases
    let baseColor = vec4(0.1, 0.1, 0.1, 1.0);
    gl.uniform4fv(u_color, baseColor);

    pushMatrix();

        multTranslation([-6.0, 0.0, -8.0]);
        multScale([2.0, 0.2, 2.0]);

        updateModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    pushMatrix();

        multTranslation([6.0, 0.0, -8.0]);
        multScale([2.0, 0.2, 2.0]);

        updateModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    let poleColor = vec4(0.7, 0.7, 0.7, 1.0);
    gl.uniform4fv(u_color, poleColor);

    //Poles
    pushMatrix();

        multTranslation([-6.0, 5.0, -8.0]);
        multScale([0.5, 10.0, 0.5]);

        updateModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    multTranslation([6.0, 5.0, -8.0]);
    multScale([0.5, 10.0, 0.5]);

    updateModelView();
    CYLINDER.draw(gl, program, mode);
}


function elevatingDoor() {
    
    let doorBorderColor = vec4(1.0, 1.0, 1.0, 1.0);
    let doorColor = vec4(0.5, 0.5, 0.5, 1.0);

    gl.uniform4fv(u_color, doorBorderColor);
    
    pushMatrix(); // Floor protector

        multTranslation([0.0, -0.85, 0.0]);
        multRotationX(90);
        multScale([0.3, 8.0, 0.3]);

        updateModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();
 

    let plackPos = -1.5;

    for(let i = 0; i < 5; i++) { // Horizontal parts
        plackPos += 1.5;

        pushMatrix();

            gl.uniform4fv(u_color, doorColor);

            multTranslation([0.0, plackPos, 0.0]);
            multScale([0.1, 1.5, 7.5]);

            updateModelView();
            CUBE.draw(gl, program, mode);

            gl.uniform4fv(u_color, outlineColor);
            CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe

        popMatrix();
    }
}


function clock() {

    let clockBorderColor = vec4(0.1, 0.1, 0.1, 1.0);
    let clockInteriorColor = vec4(1.0, 1.0, 1.0, 1.0);

    gl.uniform4fv(u_color, clockBorderColor);

    pushMatrix(); // Clock's border

        multTranslation([0.2, 6.0, 8.0]);
        multRotationZ(90);
        multScale([2.2, 0.1, 2.2]);

        updateModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    gl.uniform4fv(u_color, clockInteriorColor);

    pushMatrix(); // Clock's interior

        multTranslation([0.21, 6.0, 8.0]);
        multRotationZ(90);
        multScale([1.75, 0.1, 1.75]);

        updateModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    gl.uniform4fv(u_color, clockBorderColor);

    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // Calculate angles for hands
    const secondAngle = (seconds / 60.0) * 2.0 * Math.PI; // Radians
    const minuteAngle = (minutes / 60.0) * 2.0 * Math.PI + (secondAngle / 60.0); // Radians
    const hourAngle = (hours / 12.0) * 2.0 * Math.PI + (minuteAngle / 12.0); // Radians

    pushMatrix();

        multTranslation([0.22, 6.0, 8.0]);
        multRotationZ(90);
        multScale([0.1, 0.1, 0.1]);

        updateModelView();
        CYLINDER.draw(gl, program, mode); // Center dot

        gl.uniform4fv(u_color, clockBorderColor);

        pushMatrix(); // Hours hand

            multTranslation([Math.cos(hourAngle) * 2.0, -1.0, Math.sin(hourAngle) * -2.0]); // Moves the hours hand
            multRotationY(hourAngle / Math.PI * 180.0); // Converts radians to degrees
            multScale([4.0, 0.4, 1.0]);

            updateModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix(); // Minutes hand

            multTranslation([Math.cos(minuteAngle) * 3.0, -1.0, Math.sin(minuteAngle) * -3.0]); // Moves the minutes hand
            multRotationY(minuteAngle / Math.PI * 180.0); // Converts radians to degrees
            multScale([6.0, 0.4, 0.75]);

            updateModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

        pushMatrix(); // Seconds hand

            multTranslation([Math.cos(secondAngle) * 4.0, -1.0, Math.sin(secondAngle) * -4.0]); // Moves the seconds hand
            multRotationY(secondAngle/Math.PI*180.0); // Converts radians to degrees
            multScale([8.0, 0.4, 0.5]);

            updateModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();
    popMatrix();
}


function garageDoor() {

    let doorBorderColor = vec4(1.0, 1.0, 1.0, 1.0);

    gl.uniform4fv(u_color, doorBorderColor);

    pushMatrix(); // Left Vertical Support

        multTranslation([-12.5, 3.9, 4.75]);
        multScale([0.3, 8.0, 0.3]);

        updateModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();

    pushMatrix(); // Right Vertical Support

        multTranslation([-12.5, 3.9, -3.0]);
        multScale([0.3, 8.0, 0.3]);

        updateModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();

    // Upper Horizontal Support

    multTranslation([-12.5, 7.75, 0.9]);
    multRotationX(90);
    multScale([0.3, 8.0, 0.3]);

    updateModelView();
    CUBE.draw(gl, program, mode);

}


function wall() {

    let wallColor = vec4(0.4, 0.4, 0.4, 1.0);

    gl.uniform4fv(u_color, wallColor);

    pushMatrix(); // Middle part

        multTranslation([-12.5, 11.0, -0.4]);
        multScale([0.2, 7.0, 25.0]);

        updateModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();

    pushMatrix(); // Left part

        multTranslation([-12.5, 4.4, 8.35]);
        multScale([0.2, 9.0, 7.5]);

        updateModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();

    // Right part
    multTranslation([-12.5, 4.4, -7.9]);
    multScale([0.2, 9.0, 10.0]);

    updateModelView();
    CUBE.draw(gl, program, mode);

}


//Entrance/exit of the truck to/from the fire department
function entrance() {

    // Wall
    pushMatrix();
        wall();
    popMatrix();

    // Garage Door
    pushMatrix();
        garageDoor();
    popMatrix();

    // Clock
    pushMatrix();
        multTranslation([-12.5, 0.9, 0.9]);
        clock();
    popMatrix();

    // Elevating door
    multTranslation([-12.5, doorPos, 0.9]);
    elevatingDoor();
}