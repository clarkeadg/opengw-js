
import { Point3d } from "./point3d"
import { pen } from "./vector"
import { glLineWidth, glColor4f, glBegin, glVertex3d, glEnd, GL_POINTS, GL_LINES, GL_LINE_STRIP } from "./webgl"

const NUM_HS_STARS = 2000;
const size = 200;

class Star {
  constructor() {
    this.lastPos = new Point3d();
    this.pos = new Point3d();
    this.lastProjected = new Point3d();
    this.projected = new Point3d();
    this.color = new pen();
  }
}

export class hyperspace {
  
  constructor(camera) {
    const z = this;
    z.mCamera = camera;
    z.mStars = [];
    for (let i=0; i<NUM_HS_STARS; i++) {
      z.mStars.push(new Star())
      z.mStars[i].lastPos.x = z.mStars[i].pos.x = (Math.random() * size) - (size/2);
      z.mStars[i].lastPos.y = z.mStars[i].pos.y = (Math.random() * size) - (size/2);
      z.mStars[i].lastPos.z = z.mStars[i].pos.z = (Math.random() * size) - (size/2);
      z.mStars[i].color = new pen(Math.random()+.5, Math.random()+.5, Math.random()+.5, 1, 1);
    }
    z.mCurrentBrightness = z.mTargetBrightness = 0;
    //console.log('HYPERSPACE STARS INIT', z.mStars)
  }

  run() {
    const z = this;
    for (let i=0; i<NUM_HS_STARS; i++) {
      z.mStars[i].lastPos.z = z.mStars[i].pos.z;
      z.mStars[i].pos.z += 2 * z.mCurrentBrightness;
      if (z.mStars[i].pos.z > 100) {
        z.mStars[i].lastPos.x = z.mStars[i].pos.x = (Math.random() * size) - (size/2);
        z.mStars[i].lastPos.y = z.mStars[i].pos.y = (Math.random() * size) - (size/2);
        z.mStars[i].lastPos.z = z.mStars[i].pos.z = (Math.random() * size) - (size/2);
        z.mStars[i].color = new pen(Math.random()+.5, Math.random()+.5, Math.random()+.5, 1, 1);
      }
    }
    if (z.mCurrentBrightness < z.mTargetBrightness) {
      z.mCurrentBrightness += .005;
    } else if (z.mCurrentBrightness > z.mTargetBrightness) {
      z.mCurrentBrightness *= .99;
    }
  }

  draw() {
    const z = this;

    //glEnable(GL_POINT_SMOOTH);
    //glPointSize(4);
    glColor4f(1, 1, 1, 1);

    glBegin(GL_LINES);

    for (let i=0; i<NUM_HS_STARS; i++) {

      glColor4f(1,1,1,.5 * z.mCurrentBrightness);

      glVertex3d(z.mStars[i].lastPos.x + z.mCamera.mCurrentPos.x, z.mStars[i].lastPos.y + z.mCamera.mCurrentPos.y, z.mStars[i].lastPos.z + z.mCamera.mCurrentPos.z);
      glVertex3d(z.mStars[i].pos.x + z.mCamera.mCurrentPos.x, z.mStars[i].pos.y + z.mCamera.mCurrentPos.y, z.mStars[i].pos.z + z.mCamera.mCurrentPos.z);
      
    } 

    glEnd();
  }
}
