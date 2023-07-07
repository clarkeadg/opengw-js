
import { calculate2dAngle, calculate2dDistance, rotate2dPoint } from "./mathutils"
import { Point3d } from "./point3d"

class Attractor {
  constructor() {
    this.pos = new Point3d(0,0,0);
    this.strength = 0;
    this.zStrength = 0;
    this.radius = 0;
    this.enabled = false;
    this.attractsParticles = false;
  }
}

export class attractor {

  constructor() {
    const z = this;

    z.mNumAttractors = 200;
    z.mAttractors = [];

    for (let i=0; i<z.mNumAttractors; i++) {
      z.mAttractors.push(new Attractor());
    }

    z.clearAll();        
  }

  getAttractor() {
    const z = this;

    for (let i=0; i<z.mNumAttractors; i++) {
      if (!z.mAttractors[i].enabled) {
        return z.mAttractors[i];
      }
    }

    return null;
  }

  clearAll() {
    const z = this;

    for (let i=0; i<z.mNumAttractors; i++) {
      z.mAttractors[i].enabled = false;
    }
  }

  evaluateParticle(p) {
    const z = this;

    const speed = new Point3d(0,0,0);

    for (let i=0; i<z.mNumAttractors; i++) {
      const att = z.mAttractors[i];
      if (att.enabled && att.attractsParticles) {
        const apoint = new Point3d(att.pos.x, att.pos.y, att.pos.z);

        const angle = calculate2dAngle(p.posStream[0], apoint);
        let distance = calculate2dDistance(p.posStream[0], apoint);

        const strength = att.strength;

        if (distance < att.radius) {
          distance = att.radius;
        }

        const r = 1.0/(distance*distance);

        // Add a slight curving vector to the gravity
        const gravityVector = new Point3d(-r * strength * .5, 0, 0); // .5
        const g = rotate2dPoint(gravityVector, angle+.35); // .7

        speed.x += g.x;
        speed.y += g.y;
      }
    }

    return speed;
  }
}
