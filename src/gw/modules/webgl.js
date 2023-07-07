
// https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html

/* TODO:
GL_MULTISAMPLE
GL_LINE_SMOOTH
GL_POINT_SMOOTH

glLineWidth
*/

let pointSize = 1;
let lineWidth = 1;
let position = { x: 0, y: 0, z: 0 };
const color = { r: 0, g: 0, b: 0, a: 1 };
const colors = [];
const vertices = [];
const points = [];

let gl;
let vertex_buffer;
let color_buffer;
let vertexColor;
let vertexCoordinates;
let vertexPointSize;
let cameraPosition;

// Enable
export const GL_DEPTH_TEST      = 0;
export const GL_BLEND           = 1;
export const GL_MULTISAMPLE     = 2;
export const GL_LINE_SMOOTH     = 3;

// BLEND
export const GL_ONE             = 0;
export const GL_SRC_ALPHA       = 1;

// Matrix
export const GL_PROJECTION      = 4;

// Draw Modes
export const GL_POINTS          = 0;
export const GL_LINES           = 1;
export const GL_LINE_STRIP      = 2;
export const GL_LINE_LOOP       = 3;
export const GL_TRIANGLE_STRIP  = 4;

// Canvas
export const CANVAS_WIDTH  = 480;
export const CANVAS_HEIGHT = 271;
export const CANVAS_ZOOM = 8;

//export const CANVAS_WIDTH  = 960;
//export const CANVAS_HEIGHT = 542;
//export const CANVAS_ZOOM = 15;

export const CANVAS_W = (CANVAS_WIDTH / CANVAS_ZOOM).toFixed(2);
export const CANVAS_H = (CANVAS_HEIGHT / CANVAS_ZOOM).toFixed(2);

export const gl_init = () => {

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas); 

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  window.gl = gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('NO WEBGL');
    return;
  }

  const vertCode = ' '+ 
  'attribute vec3 coordinates;' +
  'attribute vec4 color;' + 
  'uniform vec3 position;' +
  'uniform float pointSize;' +
  'varying vec4 vColor;' +
  'void main(void) {' +
    'float x = (coordinates.x + position.x) / '+CANVAS_W+';' +
    'float y = (coordinates.y + position.y) / '+CANVAS_H+';' +
    'gl_Position = vec4(x, y, 0, 1.0);' +
    'gl_PointSize = pointSize;'+
    'vColor = color;' +
  '}';

  const fragCode = ' '+
  'varying mediump vec4 vColor;' +
  'void main(void) {' +
    'gl_FragColor = vColor;' +
  '}';       

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  vertex_buffer = gl.createBuffer();
  color_buffer = gl.createBuffer();

  vertexColor = gl.getAttribLocation(shaderProgram, 'color'); 
  vertexCoordinates = gl.getAttribLocation(shaderProgram, "coordinates");
  
  vertexPointSize = gl.getUniformLocation(shaderProgram, "pointSize"); 
  cameraPosition = gl.getUniformLocation(shaderProgram, "position"); 

  window.webgl = {
    vertex_buffer: vertex_buffer,
    color_buffer: color_buffer,
    vertexColor: vertexColor,
    vertexCoordinates: vertexCoordinates,
    vertexPointSize: vertexPointSize,
    pointSize: pointSize,
    lineWidth: lineWidth,
    cameraPosition: cameraPosition,
    type: GL_POINTS
  }
}

export const glEnable = (type) => {
  gl = window.gl;
  if (type === GL_DEPTH_TEST) {
    gl.enable(gl.DEPTH_TEST);
  }
  if (type === GL_BLEND) {
    gl.enable(gl.BLEND);
  }
  /*if (type === GL_MULTISAMPLE) {
    gl.enable(gl.MULTISAMPLE);
  }
  if (type === GL_LINE_SMOOTH) {
    gl.enable(gl.LINE_SMOOTH);
  }
  if (type === GL_POINT_SMOOTH) {
    gl.enable(gl.POINT_SMOOTH);
  }*/
}

export const glDisable = (type) => {
  gl = window.gl;
  if (type === GL_DEPTH_TEST) {
    gl.disable(gl.DEPTH_TEST);
  }
  if (type === GL_BLEND) {
    gl.disable(gl.BLEND);
  }
  /*if (type === GL_MULTISAMPLE) {
    gl.disable(gl.MULTISAMPLE);
  }
  if (type === GL_LINE_SMOOTH) {
    gl.disable(gl.LINE_SMOOTH);
  }
  if (type === GL_POINT_SMOOTH) {
    gl.disable(gl.POINT_SMOOTH);
  }*/
}

export const glBlendFunc = (sfactor, dfactor) => {
   gl = window.gl;
   sfactor = sfactor || gl.ONE;
   dfactor = dfactor || gl.ZERO;
   if (sfactor === GL_ONE) {
      sfactor = gl.ONE;
   }
   if (dfactor === GL_SRC_ALPHA) {
      dfactor = gl.SRC_ALPHA;
   }
   //gl.blendFunc(sfactor, dfactor);

   // source is not premultiplied alpha
   //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

   // source IS premultiplied
   //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

   // additive with src alpha (usually used for effects like particles, explosions, magic)
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
}

export const glViewport = (x, y, width, height) => {
  gl = window.gl;
  gl.viewport(x, y, width, height);
}

export const glClearColor = (r, g, b, a) => {
  gl = window.gl;
  gl.clearColor(r, g, b, a);
}

export const glClear = (opts) => {
  gl = window.gl;
  if (!opts) opts = gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT;
  gl.clear(opts);
}

export const glLineWidth = (lineWidth) => {
  window.webgl.lineWidth = lineWidth;
}

export const glPointSize = (pointSize) => {
  window.webgl.pointSize = pointSize;
}

export const glColor4f = (r, g, b, a) => {
  color.r = r;
  color.g = g;
  color.b = b;
  color.a = a;
}

export const glBegin = (type) => {
  gl = window.gl;
  gl.type = type;
  gl.bindBuffer(gl.ARRAY_BUFFER, null); 
  colors.length = 0;
  vertices.length = 0;
  points.length = 0;
}

export const glVertex3d = (x, y, z) => {
  vertices.push(x);
  vertices.push(y);
  vertices.push(z);
  colors.push(color.r)
  colors.push(color.g)
  colors.push(color.b)
  colors.push(color.a)
  points.push(4)
}

export const glVertex3f = (x, y, z) => {
  glVertex3d(x, y, z)
}

export const glTranslatef = (x, y, z) => {
  gl = window.gl;
  position.x = x;
  position.y = y;
  position.z = z;
}

let logonce = 0;

export const glEnd = () => { 
  if (!points.length) return; 

  gl = window.gl;

  pointSize = window.webgl.pointSize;

  vertex_buffer = window.webgl.vertex_buffer;
  color_buffer = window.webgl.color_buffer;

  vertexCoordinates = window.webgl.vertexCoordinates;
  vertexColor = window.webgl.vertexColor;  
  vertexPointSize = window.webgl.vertexPointSize; 
  cameraPosition = window.webgl.cameraPosition;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.vertexAttribPointer(vertexCoordinates, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexCoordinates);    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); 

  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);    
  gl.enableVertexAttribArray(vertexColor);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW); 

  gl.uniform1f(vertexPointSize, pointSize); 
  gl.uniform3f(cameraPosition, position.x, position.y, position.z);

  if (gl.type === GL_POINTS) {
    gl.drawArrays(gl.POINTS, 0, points.length)
  }
  if (gl.type === GL_LINES || gl.type === GL_LINE_STRIP) {
    gl.drawArrays(gl.LINES, 0, points.length)
  }
  if (gl.type === GL_LINE_LOOP) {
    gl.drawArrays(gl.LINE_LOOP, 0, points.length)
  }
  if (gl.type === GL_TRIANGLE_STRIP) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length)
  }
}

/////////////////////////////////////////////////////////

export const glEnable2D = () => {
  /*const vPort = [];
  vPort[0] = VIRTUAL_SCREEN_HEIGHT;
  vPort[1] = 0;
  vPort[2] = 0;
  vPort[3] = VIRTUAL_SCREEN_WIDTH;

  glMatrixMode(GL_PROJECTION);
  glPushMatrix();
  glLoadIdentity();

  glOrtho(vPort[0], vPort[0]+vPort[2], vPort[1]+vPort[3], vPort[1], -1, 1);

  glViewport(0, 0, mWidth, mHeight);

  glMatrixMode(GL_MODELVIEW);
  glPushMatrix();
  glLoadIdentity();*/
}

export const glDisable2D = () => {
  /*glMatrixMode(GL_PROJECTION);
  glPopMatrix();
  glMatrixMode(GL_MODELVIEW);
  glPopMatrix();*/
}

export const glMatrixMode = (mode) => {
  //gl_mmode = mode;
}

export const glPushMatrix = () => {
  //const mtop = gl_mat[gl_mmode].length - 1;
  //gl_mat[gl_mmode].push(new Float32Array(16));
  //m4_copy(gl_mat[gl_mmode][mtop + 1], gl_mat[gl_mmode][mtop]);
}

export const glPopMatrix = () => {
  //gl_mat[gl_mmode].pop();
}

export const glLoadIdentity = () => {
  //const mtop = gl_mat[gl_mmode].length - 1;
  //m4_identity(gl_mat[gl_mmode][mtop]);
}

export const glMultMatrixf = (mat) => {
  //const mtop = gl_mat[gl_mmode].length - 1;
  //m4_mul(gl_mat[gl_mmode][mtop], gl_mat[gl_mmode][mtop], mat);
}

export const glFrustum = (left, right, bottom, top, near, far) => {
  /*const dx = right - left;
  const dy = top - bottom;
  const dz = far - near;

  const a = (right + left) / dx;
  const b = (top + bottom) / dy;
  const c = -(far + near) / dz;
  const d = -2.0 * far * near / dz;

  const xform = new Float32Array(16);
  xform[0] = 2.0 * near / dx;
  xform[5] = 2.0 * near / dy;
  xform[8] = a;
  xform[9] = b;
  xform[10] = c;
  xform[11] = -1.0;
  xform[14] = d;
  xform[1] = xform[2] = xform[3] = xform[4] = xform[6] = xform[7] = xform[12] = xform[13] = xform[15] = 0.0;

  glMultMatrixf(xform);*/
}

export const gluPerspective = (vfov, aspect, near, far) => {
  //const x = near * Math.tan(vfov / 2.0);
  //glFrustum(-aspect * x, aspect * x, -x, x, near, far);
}
