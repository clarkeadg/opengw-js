
import { glLineWidth, glColor4f, glBegin, glVertex3d, glEnd, GL_LINES, GL_LINE_STRIP } from "./webgl"
import { Point3d } from "./point3d";
import { matrix } from "./matrix";
import { clamp2dVector, calculate2dDistance } from "./mathutils"

const NUM_POS_STREAM_ITEMS = 7;

let logonce = false;

class PARTICLE {
  constructor() {
    this.posStream = [];
    for(let i=0;i<NUM_POS_STREAM_ITEMS;i++) {
      this.posStream.push(new Point3d())
    }

    this.speedX = 0.0;
    this.speedY = 0.0;
    this.speedZ = 0.0;

    this.color = null;

    this.timeToLive = 0;

    this.fadeStep = 0.0;

    this.gravity = false;
    this.gridBound = false;
    this.drag = 0.0;

    this.hitGrid = false;

    this.glowPass = false;
  }
}

export class particle {

  constructor() {
    const z = this;

    z.mNumParticles = 1000;

    z.mParticles = []; //new PARTICLE[mNumParticles];
    for(let i=0;i<z.mNumParticles; i++) {
      z.mParticles.push(new PARTICLE())
    }

    if (z.mParticles) {
      for (let i=0; i<z.mNumParticles; i++) {
        z.mParticles[i].timeToLive = 0;
      }
    }
  }  

  emitter(position, angle, speed, spread, num, color, timeToLive, gravity, gridBound, drag, glowPass) {
    const z = this;
    // Emit a number of random thrust particles from the nozzle
    for (let p=0; p<num; p++) {
      const speedVertex = new Point3d();
      const speedVector = new Point3d();

      speedVertex.x = 0;
      speedVertex.y = speed + ((Math.random()*.5)-.25);
      speedVertex.z = 0;

      const mat = new matrix();
      mat.Identity();
      mat.Rotate(0, 0, angle.y + ((Math.random()*spread)-spread/2));

      mat.TransformVertex(speedVertex, speedVector);

      z.assignParticle(position, speedVector.x, speedVector.y, speedVector.z, timeToLive, color, gravity, gridBound, drag, glowPass);
    }
  }  

  assignParticle(position, aSpeedX, aSpeedY, aSpeedZ, aTime, aColor, gravity, gridBound, drag, glowPass) {
    const z = this;

    // Find an unused particle
    let particle = null;
    let i;

    if (z.mParticles) {
      for (i=0; i<z.mNumParticles; i++) {
        if (z.mParticles[i].timeToLive <= 0) {
          // Found one
          particle = z.mParticles[i];
          break;
        }
      }
    }

    if (!particle) {
      // Out of particles - pick off the particle closest to being done
      let minTime = 320000;
      let minIndex = 0;

      for (i=0; i<z.mNumParticles; i++) {
        if (z.mParticles[i].timeToLive <= minTime) {
          minIndex = i;
          minTime = z.mParticles[i].timeToLive;
        }
      }

      particle = z.mParticles[minIndex];
    }

    if (particle) {
      let pos = new Point3d(position.x, position.y, position.z);

      /*if (gridBound) {
        let hitPoint = new Point3d();
        if (z.mGrid.hitTest(pos, 1, hitPoint)) {
          pos = hitPoint;
        }
      }*/

      for (let p=0; p<NUM_POS_STREAM_ITEMS; p++) {
        particle.posStream[p] = new Point3d(pos.x, pos.y, pos.z);
      }

      particle.speedX = aSpeedX;
      particle.speedY = aSpeedY;
      particle.speedZ = aSpeedZ;
      particle.color = aColor;
      particle.timeToLive = aTime * Math.random();
      particle.fadeStep = 1.0 / particle.timeToLive;
      particle.gravity = gravity;
      particle.gridBound = gridBound;
      particle.drag = drag;
      particle.glowPass = glowPass;
      particle.hitGrid = false;
    }
  }

  draw() {
    const z = this;
    if (z.mParticles) {

      //glLineWidth(z.mParticles[0].color.lineRadius);

      glBegin(GL_LINES);

      for (let i=0; i<z.mNumParticles; i++) {
        if (z.mParticles[i].timeToLive > 0) {
          // This particle is active
          const particle = z.mParticles[i];

          let a = particle.color.a;
          const speedNormal = calculate2dDistance(new Point3d(0,0,0), new Point3d(particle.speedX, particle.speedY, particle.speedZ));
          a = a * (speedNormal * .8);
          
          glColor4f(particle.color.r, particle.color.g, particle.color.b, a); // RGBA

          for (let p=0; p<NUM_POS_STREAM_ITEMS-1; p++) {
            const from = new Point3d(particle.posStream[p].x, particle.posStream[p].y, particle.posStream[p].z);
            const to = new Point3d(particle.posStream[p+1].x, particle.posStream[p+1].y, particle.posStream[p+1].z);
            //const to = new Point3d(from.x - 5 + (Math.random() * 10), from.y + (Math.random() * 10))

            const myPen = particle.color;
            //myPen.lineRadius *= myPen.a;

            glVertex3d(from.x, from.y, 0);
            glVertex3d(to.x, to.y, 0);
          }
        }
      }

      glEnd();

    }    
  }

  run() {
    const z = this;
    let i;
    if (z.mParticles) {
      for (i=0; i<z.mNumParticles; i++) {
        const particle = z.mParticles[i];
        if (particle.timeToLive > 0) {
          // This particle is active
          --particle.timeToLive;
          if (particle.timeToLive <= 0) {
            // This particle died
            particle.timeToLive = 0;
          } else {
            // Evaluate against attractors
            const ppoint = new Point3d(particle.posStream[0].x, particle.posStream[0].y, particle.posStream[0].z);
            /*if (particle.gravity) {
              const speed = game::mAttractors.evaluateParticle(particle);
              particle.speedX += speed.x;
              particle.speedY += speed.y;
            }*/

            // Add drag
            particle.speedX *= particle.drag;
            particle.speedY *= particle.drag;

            /*let speedClamp = new Point3d(particle.speedX, particle.speedY, 0);
            speedClamp = clamp2dVector(speedClamp, 2);
            particle.speedX = speedClamp.x;
            particle.speedY = speedClamp.y;*/

            // Move the particle
            particle.posStream[0].x += particle.speedX;
            particle.posStream[0].y += particle.speedY;
            particle.posStream[0].z = 0;

            /*if (particle.gridBound) {
              // Keep it within the grid

              Point3d hitPoint;
              float deflectionAngle;
              if (game::mGrid.hitTest(particle->posStream[0], 0, &hitPoint, &deflectionAngle)) {
                particle->hitGrid = true;
                particle->posStream[0] = hitPoint;

                // Calculate deflection angle
                Point3d particleVector(particle->speedX, particle->speedY, 0);
                float particleAngle = mathutils::calculate2dAngle(Point3d(0,0,0), particleVector);
                float diff = mathutils::diffAngles(particleAngle, deflectionAngle);
                particleVector = mathutils::rotate2dPoint(particleVector, diff*2);
                particle->speedX = particleVector.x;
                particle->speedY = particleVector.y;
              }
            }*/

            // Shift the position stream
            for (let p=NUM_POS_STREAM_ITEMS-2; p >= 0; p--) {
              particle.posStream[p+1] = new Point3d(particle.posStream[p].x, particle.posStream[p].y, particle.posStream[p].z);
            }
          }          
        }
      }
    }
  }

  killAll() {
    const z = this;
    if (z.mParticles) {
      for (let i=0; i<z.mNumParticles; i++) {
        z.mParticles[i].timeToLive = 0;
      }
    }
  }
}
