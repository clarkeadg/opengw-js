
import { NUM_ENEMIES } from "./enemies"
import { ENTITY_TYPE_BLACKHOLE, ENTITY_STATE_RUNNING } from "./entity"
import { calculate2dDistance, calculate2dAngle, rotate2dPoint } from "./mathutils"
import { Point3d } from "point3d"

export class blackholes {

  constructor() {

  }

  run() {
    const z = this;

    // Suck enemies and the player into the black holes
    for (let i=0; i<NUM_ENEMIES; i++) {
      if ((z.mEnemies.mEnemies[i].getType() == ENTITY_TYPE_BLACKHOLE) && (z.mEnemies.mEnemies[i].getState() == ENTITY_STATE_RUNNING)) {
        const blackHole = z.mEnemies.mEnemies[i];
        if (blackHole.mActivated) {
          // Players
          for (let p=0; p<2; p++) {
            const player = (p==0) ? z.mPlayers.mPlayer1 : z.mPlayers.mPlayer2;
            if (player.getEnabled()) {
              let angle = calculate2dAngle(player.getPos(), blackHole.getPos());
              let distance = calculate2dDistance(player.getPos(), blackHole.getPos());

              if (distance < blackHole.getRadius()) {
                // Destroy the player
                // player.setState(ENTITY_STATE_DESTROY_TRANSITION);
              } else {
                const strength = 2.4;
                if (distance < blackHole.getRadius()) {
                    distance = blackHole.getRadius();
                }

                const r = 1.0/(distance*distance);

                const gravityVector = new Point3d(r * strength, 0, 0);
                const g = rotate2dPoint(gravityVector, angle);

                const speed = player.getDrift();
                speed.x += g.x;
                speed.y += g.y;
                player.setDrift(speed);
              }
            }
          }

          for (let j=0; j<NUM_ENEMIES; j++) {
            if ((z.mEnemies.mEnemies[j].getState() == ENTITY_STATE_RUNNING)) {
              if (j != i) {
                const enemy = z.mEnemies.mEnemies[j];

                let angle = calculate2dAngle(enemy.getPos(), blackHole.getPos());
                let distance = calculate2dDistance(enemy.getPos(), blackHole.getPos());

                if (z.mEnemies.mEnemies[j].getType() == ENTITY_TYPE_BLACKHOLE) {
                  
                  // It's another black hole. Keep it at the proper distance
                  const blackHole2 = z.mEnemies.mEnemies[j];

                  const totalRadius = blackHole.getRadius()+blackHole2.getRadius();

                  if (distance < totalRadius) {
                      
                    // Activate it and nudge each away from each other
                    if (!blackHole2.mActivated)
                        blackHole2.hit(blackHole);

                    let angle1 = calculate2dAngle(blackHole2.getPos(), blackHole.getPos());
                    let angle2 = calculate2dAngle(blackHole.getPos(), blackHole2.getPos());

                    const overlap = totalRadius - distance;

                    let vector1 = new Point3d(overlap/2,0,0);
                    let vector2 = new Point3d(overlap/2,0,0);

                    vector1 = rotate2dPoint(vector1, angle1);
                    vector2 = rotate2dPoint(vector2, angle2);

                    blackHole.setPos(blackHole.getPos().add(vector1));
                    blackHole2.setPos(blackHole2.getPos().add(vector2));
                      
                  } else {
                    const strength = 10;
                    if (distance < blackHole.getRadius()) {
                      distance = blackHole.getRadius();
                    }

                    const r = 1.0/(distance*distance);

                    // Add a slight curving vector to the gravity
                    const gravityVector = new Point3d(r * strength, 0, 0);
                    const g = rotate2dPoint(gravityVector, angle);

                    const speed = enemy.getDrift();
                    speed.x += g.x;
                    speed.y += g.y;
                    enemy.setDrift(speed);
                  }

                } else if ((z.mEnemies.mEnemies[j].getType() == ENTITY_TYPE_GEOM_SMALL)
                  || (z.mEnemies.mEnemies[j].getType() == ENTITY_TYPE_GEOM_MEDIUM)
                  || (z.mEnemies.mEnemies[j].getType() == ENTITY_TYPE_GEOM_LARGE))
                {
                  // Geoms not effected
                } else {
                  if (distance < blackHole.getRadius()) {
                    // Add its drift to ours
                    let drift = enemy.getDrift();
                    drift *= .25;
                    blackHole.setDrift(blackHole.getDrift() + drift);

                    // Destroy the enemy
                    enemy.hit(blackHole);

                    // Feed the black hole
                    blackHole.feed(enemy.getScoreValue());

                    // Distrupt the grid at the destruction point
                    const att = z.mAttractors.getAttractor();
                    if (att) {
                      att.strength = 1.5;
                      att.zStrength = 0;
                      att.radius = 30;
                      att.pos = blackHole.getPos();
                      att.enabled = true;
                      att.attractsParticles = false;
                    }
                  } else {
                    const strength = 8;
                    if (distance < blackHole.getRadius()) {
                      distance = blackHole.getRadius();
                    }

                    const r = 1.0/(distance*distance);

                    // Add a slight curving vector to the gravity
                    const gravityVector = new Point3d(r * strength, 0, 0);
                    const g = rotate2dPoint(gravityVector, angle+.4);

                    const speed = enemy.getDrift();
                    speed.x += g.x;
                    speed.y += g.y;
                    enemy.setDrift(speed);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Kill any particles that fly into the black hole

    for (let i=0; i<NUM_ENEMIES; i++) {
      if ((z.mEnemies.mEnemies[i].getType() == ENTITY_TYPE_BLACKHOLE) && (z.mEnemies.mEnemies[i].getState() == ENTITY_STATE_RUNNING)) {
        const blackHole = z.mEnemies.mEnemies[i];
        if (blackHole.mActivated) {
          for (let p=0; p<z.mParticles.mNumParticles; p++) {
            if (z.mParticles.mParticles[p].timeToLive > 0) {
              // This particle is active
              const particle = z.mParticles.mParticles[p];
              if (particle.gravity) {
                const distance = calculate2dDistance(particle.posStream[0], blackHole.getPos());
                if (distance < blackHole.getRadius()) {
                  particle.timeToLive = 0;
                }
              }
            }
          }
        }
      }
    }
  }
}
