
import { glLineWidth, glColor4f, glBegin, glVertex3d, glEnd, GL_LINES } from "./webgl"
import { Point3d } from "./point3d"
import { pen } from "./vector"
import { DegreesToRads, rotate2dPoint, calculate2dDistance } from "./mathutils"
import { ENTITY_STATE_INACTIVE, ENTITY_STATE_INDICATING, ENTITY_STATE_INDICATE_TRANSITION, ENTITY_STATE_DESTROY_TRANSITION, ENTITY_STATE_DESTROYED } from "./entity"
import { PI } from "./defines"
import { NUM_ENEMIES } from "./enemies"

class RING {
  constructor() {
    this.pos = new Point3d()
    this.radius = 1;
    this.thickness = 1;
    this.speed = 1;
    this.timeToLive = 100;
    this.fadeStep = 1;
    this.mPen = new pen();
  }
}
export class bomb {

  constructor(attractor, particles, enemies) {
    const z = this;

    z.mParticles = particles;
    z.mAttractors = attractor;
    z.mEnemies = enemies;

    z.mNumRings = 20;

    z.mRings = [];
    for (let i=0; i<z.mNumRings; i++) {
      z.mRings.push(new RING())
    }

    if (z.mRings) {
      for (let i=0; i<z.mNumRings; i++) {
        z.mRings[i].timeToLive = 0;
      }
    }
  }

  run() {
    const z = this;

    for (let i=0; i<z.mNumRings; i++) {
      if (z.mRings[i].timeToLive > 0) {
        --z.mRings[i].timeToLive;
        z.mRings[i].radius += z.mRings[i].speed;
        z.mRings[i].thickness += .03;

        // Push the grid out
        if (z.mRings[i].radius < 40) {
          const att = z.mAttractors.getAttractor();
          if (att) {
            att.strength = 5;
            att.zStrength = 0;
            att.radius = z.mRings[i].radius;

            att.pos = z.mRings[i].pos;
            att.enabled = true;
            att.attractsParticles = true;
          }
        }

        // Look for any enemies within the blast radius and destroy them
        for (let j=0; j<NUM_ENEMIES; j++) {
          if ((z.mEnemies.mEnemies[j].getState() !== ENTITY_STATE_INACTIVE)
            && (z.mEnemies.mEnemies[j].getState() != ENTITY_STATE_INDICATING)
            && (z.mEnemies.mEnemies[j].getState() != ENTITY_STATE_INDICATE_TRANSITION)
            && (z.mEnemies.mEnemies[j].getState() != ENTITY_STATE_DESTROY_TRANSITION)
            && (z.mEnemies.mEnemies[j].getState() != ENTITY_STATE_DESTROYED))
          {
            const distance = calculate2dDistance(z.mRings[i].pos, z.mEnemies.mEnemies[j].getPos());
            if ((distance > z.mRings[i].radius-10) && (distance < z.mRings[i].radius)) {
              // Destroy it
              z.mEnemies.mEnemies[j].hit(null);
            }
          }
        }

      }
    }
  }

  draw() {
    const z = this;

    for (let i=0; i<z.mNumRings; i++) {
      if (z.mRings[i].timeToLive > 0) {
        const ring = z.mRings[i];

        // Fade out
        ring.mPen.a -= ring.fadeStep;
        if (ring.mPen.a <= 0) {
          ring.mPen.a = 0;
        } else if (ring.mPen.a > 1) {
          ring.mPen.a = 1;
        }

        glLineWidth(ring.mPen.lineRadius);
        glColor4f(ring.mPen.r, ring.mPen.g, ring.mPen.b, ring.mPen.a);
        glBegin(GL_LINES);

        for (let a=0; a<360; a+=.5) {
          let angle = DegreesToRads(a);

          let from = new Point3d(0, ring.radius, 0);
          from = rotate2dPoint(from, angle);

          let to = new Point3d(0, ring.radius + ring.thickness, 0);
          to = rotate2dPoint(to, angle);

          from.add(ring.pos);
          to.add(ring.pos);

          glVertex3d(from.x, from.y, 0);
          glVertex3d(to.x, to.y, 0);
        }

        glEnd();
      }
    }
  }

  startBomb(pos, radius, thickness, speed, timeToLive, pen1) {
    const z = this;

    let ring = null;
    for (let i=0; i<z.mNumRings; i++) {
      if (z.mRings[i].timeToLive <= 0) {
        ring = z.mRings[i];
      }
    }

    if (ring) {
      ring.pos = pos;
      ring.radius = radius;
      ring.thickness = thickness;
      ring.speed = speed;
      ring.timeToLive = timeToLive;
      ring.fadeStep = 1.0 / ring.timeToLive;
      ring.mPen = pen1;

      const angle = new Point3d(0,0,0);
      const spread = 2*PI;
      const num = 100;
      timeToLive = 100;//ring->timeToLive;
      ring.mPen.lineRadius=5;
      ring.mPen.a = .3;
      z.mParticles.emitter(pos, angle, speed, spread, num, ring.mPen, timeToLive, false, false, 1, true);
    }
  }
}