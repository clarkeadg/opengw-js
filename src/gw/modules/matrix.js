
// https://web.archive.org/web/20091027131421/http://geocities.com/evilsnack/matrix.htm
// http://jsfiddle.net/9vr2dorz/

/*
[ 34,    0,   0,   0],
[  0,   34,   0,   0],
[  0,    0,  34,   0],
[240,135.5,   0,   1]

[ -0.8, -0,   0,   0],
[  0,   -0.8,   0,  0],
[  0,    0,  34,   0],
[240,135.5,   0,   1]
*/

// Rotate around Z axis
/*var rotateZMatrix = [
  cos(a), -sin(a),    0,    0,
  sin(a),  cos(a),    0,    0,
       0,       0,    1,    0,
       0,       0,    0,    1
];*/

export class matrix {

  constructor(mat) {
    this._matrix = [
      [0,0,0,0], // scaleX, ?,      ?,      ?
      [0,0,0,0], // ?,      scaleY, ?,      ?
      [0,0,0,0], // ?,      ?,      scaleZ, ?
      [0,0,0,0]  // posX,   posY,   posZ,    ?
    ];
    if (!mat) {
      this.Identity();
    } else {
      this.Copy(mat)
    }
  }

  Copy(mat) {
    this._matrix[0][0] = mat._matrix[0][0];  this._matrix[0][1] = mat._matrix[0][1];  this._matrix[0][2] = mat._matrix[0][2];  this._matrix[0][3] = mat._matrix[0][3];
    this._matrix[1][0] = mat._matrix[1][0];  this._matrix[1][1] = mat._matrix[1][1];  this._matrix[1][2] = mat._matrix[1][2];  this._matrix[1][3] = mat._matrix[1][3];
    this._matrix[2][0] = mat._matrix[2][0];  this._matrix[2][1] = mat._matrix[2][1];  this._matrix[2][2] = mat._matrix[2][2];  this._matrix[2][3] = mat._matrix[2][3];
    this._matrix[3][0] = mat._matrix[3][0];  this._matrix[3][1] = mat._matrix[3][1];  this._matrix[3][2] = mat._matrix[3][2];  this._matrix[3][3] = mat._matrix[3][3];
  }

  Identity() {
    this._matrix[0][0]=1;  this._matrix[0][1]=0;  this._matrix[0][2]=0;  this._matrix[0][3]=0;
    this._matrix[1][0]=0;  this._matrix[1][1]=1;  this._matrix[1][2]=0;  this._matrix[1][3]=0;
    this._matrix[2][0]=0;  this._matrix[2][1]=0;  this._matrix[2][2]=1;  this._matrix[2][3]=0;
    this._matrix[3][0]=0;  this._matrix[3][1]=0;  this._matrix[3][2]=0;  this._matrix[3][3]=1;
  }

  Multiply(mat) {
    const z = this;
    let i,j;

    const temp = [
      [this._matrix[0][0],this._matrix[0][1],this._matrix[0][2],this._matrix[0][3]], 
      [this._matrix[1][0],this._matrix[1][1],this._matrix[1][2],this._matrix[1][3]],
      [this._matrix[2][0],this._matrix[2][1],this._matrix[2][2],this._matrix[2][3]],
      [this._matrix[3][0],this._matrix[3][1],this._matrix[3][2],this._matrix[3][3]]
    ];

    //console.log(temp._mat, mat._matrix)
    //debug;

    for (i=0; i<4; i++) {
      for (j=0; j<4; j++) {
        z._matrix[i][j] = ((temp[i][0] * mat._matrix[0][j])
                         + (temp[i][1] * mat._matrix[1][j])
                         + (temp[i][2] * mat._matrix[2][j])
                         + (temp[i][3] * mat._matrix[3][j]));
      }
    }
  }

  Scale(sx, sy, sz) {
    this._matrix[0][0] *= sx;  this._matrix[1][1] *= sy;  this._matrix[2][2] *= sz;
  }

  Translate(tx, ty, tz) {
    this._matrix[3][0] += tx;  this._matrix[3][1] += ty;  this._matrix[3][2] += tz;
  }

  Rotate(rx, ry, rz) {

    /*this._matrix = [
      [ -0.8, -0,   0,   0],
      [  0,   -0.8,   0,  0],
      [  0,    0,  34,   0],
      [240,135.5,   0,   1]
    ];*/

    //console.log(rx, ry, rz)

    const xmat = new matrix();
    const ymat = new matrix();
    const zmat = new matrix();

    // x axis

    xmat._matrix[1][1] = Math.cos(rx);     xmat._matrix[1][2] = Math.sin(rx);
    xmat._matrix[2][0] = 0;                xmat._matrix[2][1] = -Math.sin(rx);    xmat._matrix[2][2] = Math.cos(rx);

    // y axis

    ymat._matrix[0][0] = Math.cos(ry);     ymat._matrix[0][2] = -Math.sin(ry);
    ymat._matrix[2][0] = Math.sin(ry);     ymat._matrix[2][2] = Math.cos(ry);

    // z axis

    zmat._matrix[0][0] = Math.cos(rz);  zmat._matrix[0][1] = Math.sin(rz);
    zmat._matrix[1][0] = -Math.sin(rz);  zmat._matrix[1][1] = Math.cos(rz);

    //console.log('xmat', rx, xmat._matrix)
    //console.log('ymat', ry, ymat._matrix)
    //console.log('zmat', rz, zmat._matrix)
    //console.log('this', this._matrix)

    //this._matrix[0][0] = this._matrix[0][0] * zmat._matrix[0][0];
    //this._matrix[0][1] = this._matrix[0][1] * zmat._matrix[0][1];

    //this._matrix[1][0] = this._matrix[1][0] * zmat._matrix[1][0];
    //this._matrix[1][1] = this._matrix[1][1] * zmat._matrix[1][1];

    //const temp = new matrix(xmat);
    //temp.Multiply(ymat);
    //temp.Multiply(zmat);

    this.Multiply(xmat);
    this.Multiply(ymat);
    this.Multiply(zmat);
  }

  TransformVertex(vertex, result) {
    const x = vertex.x * this._matrix[0][0] + vertex.y * this._matrix[1][0] + vertex.z * this._matrix[2][0] + this._matrix[3][0];
    const y = vertex.x * this._matrix[0][1] + vertex.y * this._matrix[1][1] + vertex.z * this._matrix[2][1] + this._matrix[3][1];
    const z = vertex.x * this._matrix[0][2] + vertex.y * this._matrix[1][2] + vertex.z * this._matrix[2][2] + this._matrix[3][2];

    // x = vertexX * scaleX + vertexY * ? + vertexZ * ? + positionX

    //const x = vertex.x * this._matrix[0][0] + this._matrix[3][0]; 
    //const y = vertex.y * this._matrix[1][1] + this._matrix[3][1];
    //const z = vertex.z * this._matrix[2][2] + this._matrix[3][2];

    result.x = x;
    result.y = y;
    result.z = z;
  }

  ProjectVertex(point, vertex, distance) {
    
    // avoid divide by zero error...
    let z = vertex.z;
    if (z == 0) z = 0.00001;

    // project
    point.x = distance * (vertex.x) / z;
    point.y = distance * (vertex.y) / z;
  }
}
