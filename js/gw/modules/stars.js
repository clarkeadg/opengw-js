
import { glPointSize, glColor4f, glBegin, glVertex3d, glEnd, GL_POINTS } from "./webgl"
import { randFromTo, frandFrom0To1 } from "./mathutils"
import { Point3d } from "./point3d"
import { GAMEMODE_ATTRACT, GAMEMODE_CREDITED } from "./game"

const NUM_STARS = 8000;

class Star {
  constructor() {
    this.pos = new Point3d(0,0,0);
    this.radius = 0;
  }
}

export class stars {

  constructor(grid) {
    const self = this;

    this.mGrid = grid;

    const overscan = 700;
    const leftEdge = 0-overscan;
    const bottomEdge = 0-overscan;
    const rightEdge = (this.mGrid.extentX() + overscan);
    const topEdge = (this.mGrid.extentY() + overscan);

    self.mStars = [];

    for (let i=0; i<NUM_STARS; i++) {
      self.mStars.push(new Star());
    }

    for (let i=0; i<NUM_STARS; i++) {
      let z;
      if (i < 2000) {
        // Layer 1
        z = -20;
      } else if (i < 4000) {
        // Layer 2
        z = -40;
      } else if (i < 6000) {
        // Layer 3
        z = -60;
      } else  {
        // Layer 4
        z = -80;
      }

      self.mStars[i].pos.x = randFromTo(leftEdge, rightEdge);
      self.mStars[i].pos.y = randFromTo(bottomEdge, topEdge);
      self.mStars[i].pos.z = z;
      self.mStars[i].radius = ((frandFrom0To1()*.5) + .25);
    }

  }

  run() {}

  draw() {
    const z = this;
    let brightness = ((z.mGrid.brightness() - .5) * 2);
    if (brightness > 1) brightness = 1;

    if (z.mGameMode == GAMEMODE_ATTRACT || z.mGameMode == GAMEMODE_CREDITED)
      brightness = 1;

    if (brightness <= 0)
      return;

    //glEnable(GL_POINT_SMOOTH);
    glPointSize(1);

    glBegin(GL_POINTS);

    for(let i = 0; i < NUM_STARS; i++ ) {
      glColor4f(1.0, 1.0, 1.0, (z.mStars[i].radius+.5) * brightness);
      glVertex3d(z.mStars[i].pos.x, z.mStars[i].pos.y, z.mStars[i].pos.z);
    }

    glEnd();
    //glDisable(GL_POINT_SMOOTH);
  }
}
