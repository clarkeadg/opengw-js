
import { glLineWidth, glColor4f, glBegin, glVertex3d, glEnd, GL_LINES, GL_LINE_STRIP } from "./webgl"
import { Point3d } from "./point3d"
import { matrix } from "./matrix"

export class Edge {
  constructor() {
    this.from = 0;
    this.to = 0;
  }
}

export class model {

  constructor() {

    this.mMatrix = new matrix();
    this.mMatrix.Identity();

    this.mVertexList = 0;
    this.mEdgeList = 0;
    this.mNumVertex = 0;
    this.mNumEdges = 0;

    this.mIsLineLoop = false;
  }

  draw(pen) {
  
    glColor4f(pen.r, pen.g, pen.b, pen.a);
    glLineWidth(pen.lineRadius*.3);

    glBegin(GL_LINE_STRIP); 

    for (let i=0; i<this.mNumEdges; i++) {
      const from = this.mVertexList[this.mEdgeList[i].from];
      const to = this.mVertexList[this.mEdgeList[i].to];

      const from2 = new Point3d();
      const to2 = new Point3d();

      this.mMatrix.TransformVertex(from, from2);
      this.mMatrix.TransformVertex(to, to2);  

      glVertex3d(from2.x, from2.y, 0 );
      glVertex3d(to2.x, to2.y, 0 );
    }

    glEnd();
  }

  emit(pen) {
    const z = this;
    
    glColor4f(pen.r, pen.g, pen.b, pen.a);

    glBegin(GL_LINES);

    for (let i=0; i<z.mNumEdges; i++) {
      const from = z.mVertexList[z.mEdgeList[i].from];
      const to = z.mVertexList[z.mEdgeList[i].to];

      const from2 = new Point3d();
      const to2 = new Point3d();

      z.mMatrix.TransformVertex(from, from2);
      z.mMatrix.TransformVertex(to, to2);

      glVertex3d(from2.x, from2.y, 0 );
      glVertex3d(to2.x, to2.y, 0 );   
    }

    glEnd();
  }

  Identity() { this.mMatrix.Identity(); }
  Scale(scale) { this.mMatrix.Scale(scale, scale, scale); }
  Translate(trans) { this.mMatrix.Translate(trans.x, trans.y, trans.z); }
  Rotate(angle) { this.mMatrix.Rotate(0, 0, angle); }
}

