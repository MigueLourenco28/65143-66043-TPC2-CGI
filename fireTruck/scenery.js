import { vec4 } from "../../libs/MV.js";
import { multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ } from "../../libs/stack.js";
import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import { outlineColor, program, u_color, mode, uploadModelView, time, doorPos, gl } from "./app.js";

export { floor, poles, entrance };

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

function elevatingDoor() {
    pushMatrix();

        let doorBorderColor = vec4(1.0, 1.0, 1.0, 1.0);
        gl.uniform4fv(u_color, doorBorderColor);

        multTranslation([0.0, -0.85, 0.0]);
        multRotationX(90);
        multScale([0.3, 8.0, 0.3]);

        uploadModelView();
        CUBE.draw(gl, program, mode);

    popMatrix();

    let plackPos = -1.5;
    for(let i = 0; i < 5; i++) {  
        plackPos += 1.5;
        pushMatrix();

            let doorColor = vec4(0.5, 0.5, 0.5, 1.0);
            gl.uniform4fv(u_color, doorColor);

            multTranslation([0.0, plackPos, 0.0]);
            multScale([0.1, 1.5, 7.5]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

            pushMatrix();
                gl.uniform4fv(u_color, outlineColor);
                CUBE.draw(gl, program, gl.LINES); // Draw cube outline in wireframe
            popMatrix();

        popMatrix();
    }
}

function clock() {
    pushMatrix();

        let clockBorderColor = vec4(0.1, 0.1, 0.1, 1);
        gl.uniform4fv(u_color, clockBorderColor);

        multTranslation([0.0, 6.0, 8.0]);
        multRotationZ(90);
        multScale([2.2, 0.7, 2.2]);

        uploadModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    pushMatrix();

        let clockInteriorColor = vec4(1.0, 1.0, 1.0, 1);
        gl.uniform4fv(u_color, clockInteriorColor);

        multTranslation([0.01, 6.0, 8.0]);
        multRotationZ(90);
        multScale([1.75, 0.7, 1.75]);

        uploadModelView();
        CYLINDER.draw(gl, program, mode);

    popMatrix();

    pushMatrix();

        gl.uniform4fv(u_color, clockBorderColor);

        multTranslation([0.02, 6.0, 8.0]);
        multRotationZ(90);
        multScale([0.1, 0.7, 0.1]);

        uploadModelView();
        CYLINDER.draw(gl, program, mode);

        //Clock hands
        //Hour hand
        pushMatrix();

            gl.uniform4fv(u_color, clockBorderColor);

            multRotationY(360 * time / 20);
            multScale([2.0, 1.0, 2.0]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();
        //Minute hand
        pushMatrix();

            gl.uniform4fv(u_color, clockBorderColor);

            multRotationY(360 * time / 20);
            multScale([2.0, 1.0, 5.0]);

            uploadModelView();
            CUBE.draw(gl, program, mode);

        popMatrix();

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

    //Clock
    pushMatrix();
        multTranslation([-12.5, 0.9, 0.9]);
        clock();
    popMatrix();

    //Elevating door
    multTranslation([-12.5, doorPos, 0.9]);
    elevatingDoor();
}