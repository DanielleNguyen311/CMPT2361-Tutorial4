import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
main();

let cubeRotation = 0.0;
let deltaTime = 0;

function main()
{
    //obtain reference to the canvas, assign a variable name to it
    const canvas = document.querySelector("#glcanvas");

    /*initialize context by asking the web if it supports webgl
      if browser does not support webgl, browser initializes context,
      we set clear color to black*/
    const gl = canvas.getContext("webgl");

    if(gl == null)
    {
        alert("Browser does not support webGl");
        return;
    }

    gl.clearColor(0.0,0.0,0.0,1.0);//black
    gl.clear(gl.COLOR_BUFFER_BIT);

    // start render to the initialized context : 
        //include glMatrix lib
        //Draw the scene
            //Define VS and FS source 
    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor; }`;
        
    //fs is called once for every pixel on each shape to be drawn to determine the pixel's color 
    //color is then returned to webgl layer by storing it in gl_FragColor
    //right now we are just drawing white
    const fsSource = `
        varying lowp vec4 vColor;    
        void main(void) { gl_FragColor = vColor; }`;


    const shaderProgram = initShaderProgram(gl,vsSource,fsSource);

    /*Collect info for shader program.
    Look up attribute in use for aVertexPositon and its uniform locations */
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
    };
    //call buffer init routine to build object we are drawing
    const buffers = initBuffers(gl);

    let then = 0;
    function render(now)
    {
        now *= 0.001;//convert to seconds
        deltaTime = now - then;
        then = now;

        drawScene(gl ,programInfo ,buffers, cubeRotation);
        cubeRotation += deltaTime;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}
/*Helper function initShaderProgram: After defining 2 shaders, pass them to webgl, compile and link them.
The code below creates 2 shaders by calling loadShader, passing it the types and
sources. 
LoadShader then create a prog, attach the shader and link them. 
If compiling and link shaders fail, code display alert*/

function initShaderProgram(gl,vsSource,fsSource)  {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl,gl.FRAGMENT_SHADER,fsSource );

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS))
    {
        alert('Unable to init the shader progrqam: ${gl.getProgramInfoLog(shaderProgram)}');
        return null;
    }
    return shaderProgram;

}
//create a shader of the given type, upload the source and compiles it
//if compilation failes -> alert. else return shader
function loadShader(gl,type,source)
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader,source);//send source
    gl.compileShader(shader);//compiles
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert('Shader compilation fails: ${gl.getShaderInfoLog(shader)}');
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}