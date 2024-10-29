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
let rotParte1 = 0;
let rotParte2 = 0;
let rotParte3 = 0;
let char = ' ';

const VP_DISTANCE = 4; //colocar 4

function switchRotMore(char) {
    switch (char) {
        case 'w':
            if (rotParte1 < 120)
                rotParte1++;
            break;
        case 's':
            if (rotParte2 < 45)
                rotParte2++;
            break;
        case 'x':
            rotParte3++;
            break;
    }
}

function switchRotLess(char) {

    switch (char) {
        case 'w':
            if (rotParte1 > -120)
                rotParte1--;
            break;
        case 's':
            if (rotParte2 > -45)
                rotParte2--;
            break;
        case 'x':
            rotParte3--;
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
        let rot;
        switch (event.key) {
            case 'w':
                char = 'w';
                break;
            case 's':
                char = 's';
                break;
            case 'x':
                char = 'x';
                break;
            case 'a':
                switchRotMore(char);
                break;
            case 'd':
                switchRotLess(char);
                break;
            case ' ':
                animation = !animation;
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
    }

    function wheel() {
        //Torus plus cylinders for the  rim
        //Spin on the x axis and sync with the translation (car movement)
    }

    function wheelConnector() {
        //Cylinder connecting two wheels
    }

    function chassis() {
        //Stretch cube on top of the wheel connectorsa
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

    function stairBase() {
        //Stretch cube on top of the waterTank (rotates)
    }

    function stairs() {
        //Stretch cube on top of the stair base
    }

    //-------FireTruck-------// 

    function tabel(color) {
        multScale([25, 0.1, 10]);
        multTranslation([0, -24.7, 0.5]);
        uploadModelView();
        gl.uniform4fv(u_color, color);
        CUBE.draw(gl, program, mode);
        gl.uniform4fv(u_color, vec4(0, 0, 0, 1));
        CUBE.draw(gl, program, gl.LINES);
    }

    function pinca(color) {
        multScale([0.2, 0.7, 0.2]);
        multTranslation([-1.15, 0.625, 0]);
        uploadModelView();
        gl.uniform4fv(u_color, color);
        CUBE.draw(gl, program, mode);
        gl.uniform4fv(u_color, vec4(0, 0, 0, 1));
        CUBE.draw(gl, program, gl.LINES);

    }

    function baseHead(color) {
        multScale([1, 0.25, 1]);
        uploadModelView();
        gl.uniform4fv(u_color, color);
        CYLINDER.draw(gl, program, mode);
        gl.uniform4fv(u_color, vec4(0, 0, 0, 1));
        CYLINDER.draw(gl, program, gl.LINES);
    }

    function head() {
        pushMatrix();
        baseHead(vec4(0.5, 0.5, 0.5, 1));
        popMatrix();
        pushMatrix();
        multTranslation([-time, 0, 0]);
        pinca(vec4(1, 1, 0, 1));
        popMatrix();
        multTranslation([0.5, 0, 0]);
        multTranslation([time, 0, 0]);
        pinca(vec4(1, 1, 0, 1));
    }


    function poste(color) {
        multScale([0.25, 1, 0.25]);
        multTranslation([0, 0.5, 0]);
        uploadModelView();
        gl.uniform4fv(u_color, color);
        CUBE.draw(gl, program, mode);
        gl.uniform4fv(u_color, vec4(0, 0, 0, 1));
        CUBE.draw(gl, program, gl.LINES);
    }

    function rot(color) {
        multScale([0.25, 0.25, 0.26]);
        multRotationX(90);
        uploadModelView();
        gl.uniform4fv(u_color, color);
        CYLINDER.draw(gl, program, mode);
        gl.uniform4fv(u_color, vec4(0, 0, 0, 1));
        CYLINDER.draw(gl, program, gl.LINES);
    }

    function base(color) {
        multScale([1, 1, 1]);
        multScale([0.8, 0.25, 0.8]);
        multTranslation([0, -1, 0]);
        uploadModelView();
        gl.uniform4fv(u_color, color);
        CUBE.draw(gl, program, mode);
        gl.uniform4fv(u_color, vec4(0, 0, 0, 1));
        CUBE.draw(gl, program, gl.LINES);
    }

    function parte1() {
        pushMatrix();
        rot(vec4(0, 0, 1, 1));
        popMatrix();
        poste(vec4(1, 0, 0, 1));
    }

    function parte2() {
        pushMatrix();
        rot(vec4(1, 1, 0, 1));
        popMatrix();
        poste(vec4(1, 0, 0, 1));
    }

    function parte3() {
        pushMatrix();
        multScale([1.7, 1, 1.7]);
        multRotationX(-90);
        rot(vec4(0, 1, 0, 1));
        popMatrix();
        multScale([1, 0.7, 1]);
        poste(vec4(1, 0, 0, 1));
    }




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
            tabel(vec4(0.3, 0.3, 0.3, 1));
        popMatrix();
        multTranslation([0, -2, 2.5]);
        pushMatrix();
            base(vec4(1, 0, 0, 1));
        popMatrix();
            multRotationY(rotParte3)
        pushMatrix();
            parte3();
        popMatrix();
        multTranslation([0, 0.7, 0]);
        multRotationZ(rotParte2);
        pushMatrix();
            parte2()
        popMatrix();
            multTranslation([0, 1, 0])
            multRotationZ(rotParte1);
        pushMatrix();
            parte1();
        popMatrix();
        multTranslation([0, 1, 0]);
        head();

        //-------FireTruck-------// 
        /**
         * pushMatrix();
         * floor();
         * popMatrix();
         */
        //-------FireTruck-------// 

    }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))