
import { entity, ENTITY_TYPE_PLAYER_MISSILE, ENTITY_TYPE_BLACKHOLE, ENTITY_STATE_RUNNING, ENTITY_STATE_INACTIVE, ENTITY_STATE_DESTROY_TRANSITION } from "./entity"
import { Point3d } from "./point3d"
import { Edge } from "./model"
import { pen } from "./vector"
import { fmod } from "./util"
import { calculate2dDistance, calculate2dAngle, DegreesToRads, diffAngles, rotate2dPoint } from "./mathutils"
import { NUM_ENEMIES } from "./enemies"
import { PI } from "./defines"

export class entityPlayerMissile extends entity {

  constructor(attractors, enemies, grid, particles) {
    super()

    this.mAttractors = attractors;
    this.mEnemies = enemies;
    this.mGrid = grid;
    this.mParticles = particles;

    this.mScale = .16;
    this.mRadius = 1;

    this.mType = 0;
    this.mPlayerSource = 1;

    this.mScoreValue = 0;

    this.mSpawnTime = 0;
    this.mDestroyTime = 0;

    this.mType = ENTITY_TYPE_PLAYER_MISSILE;

    let i = 0;

    this.mModel.mNumVertex = 3;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, 7.5);
    this.mModel.mVertexList[i++] = new Point3d(2, -5.2);
    this.mModel.mVertexList[i++] = new Point3d(-2, -5.2);

    this.mModel.mNumEdges = 3;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 0;
  }

  run(enemies, grid, particles) {
    const z = this;

    this.mEnemies = enemies;
    this.mGrid = grid;
    this.mParticles = particles;

    this.mLastPos = this.mPos;

    //console.log('11111', z.mEnemies)

    // Check for black holes that may effect us
    let warped = false;
    if (z.mEnemies) {
      for (let i=0; i<NUM_ENEMIES; i++) {
        if (z.mEnemies[i] && (z.mEnemies[i].getType() == ENTITY_TYPE_BLACKHOLE) && (z.mEnemies[i].getState() == ENTITY_STATE_RUNNING)) {
          const blackHole = z.mEnemies[i];
          if (blackHole.mActivated) {
            const distance = calculate2dDistance(z.mPos, blackHole.getPos());
            if (distance < 20) {
              const v2 = new Point3d(blackHole.getPos().x, blackHole.getPos().y, blackHole.getPos().z);
              const v1 = new Point3d(z.mPos.x, z.mPos.y, z.mPos.z);

              const angle = mod(calculate2dAngle(v1, v2), 2*PI);
              const heading = mod(getAngle() + DegreesToRads(90), 2*PI);

              const targetingAngle = diffAngles(angle, heading);
              const targetingOffset = Math.abs(targetingAngle);

              if (targetingOffset < 0.8) {
                z.mRotationRate += targetingAngle * .1;
                warped = true;
              }
            }
          }
        }
      }
    }

    z.mRotationRate *= .5;

    if (warped) {
      const vector = new Point3d(this.mVelocity,0,0);
      z.mSpeed = rotate2dPoint(vector, z.mAngle + DegreesToRads(90));
    }

    this.mPos.add(this.mSpeed);
    this.mPos.add(this.mDrift);
    this.mAngle -= z.mRotationRate;
    this.mAngle = fmod(z.mAngle, 2.0*PI);

    // Update the model's matrix
    this.mModel.Identity();
    this.mModel.Scale(this.mScale);
    this.mModel.Rotate(this.mAngle);
    this.mModel.Translate(this.mPos);

    this.mDrift.multiply(.95);

    if (this.getEnabled()) {

      // Hit test 10 positions against enemies
      let hit = false;
      for (let i=0; i<10; i++) {
        const amount1 = i/10.0;
        const amount2 = 1-amount1;

        const pos = new Point3d((z.mPos.x * amount1) + (z.mLastPos.x * amount2), (z.mPos.y * amount1) + (z.mLastPos.y * amount2), 0);

        if (z.mEnemies) {
          const enemy = z.mEnemies.hitTestEnemiesAtPosition(pos, z.getRadius(), true);
          if (enemy) {
            // We hit an enemy - destroy it and ourselves
            z.setState(ENTITY_STATE_DESTROY_TRANSITION);
            enemy.hit(z);
          }
        }
      }

      if (!hit) {
        if (z.mGrid) {
          if (z.mGrid.hitTest(z.mPos, 0)) {
            // Hit the edge of the grid - destroy it
            z.setState(ENTITY_STATE_DESTROY_TRANSITION);
            z.mSpeed = new Point3d(0,0,0);

            //z.mSound.playTrack(SOUNDID_MISSILEHITWALL);
          }
        }

        // Here be an attractor
        if (z.mType == 0) {
          const att = z.mAttractors.getAttractor();
          if (att) {
            att.strength = 5;
            att.zStrength = 0;
            att.radius = 5;
            att.pos = z.mPos;
            att.enabled = true;
            att.attractsParticles = false;
          }
        } else if (z.mType == 1) {
          const att = z.mAttractors.getAttractor();
          if (att) {
            att.strength = 5;
            att.zStrength = 0;
            att.radius = 5;
            att.pos = z.mPos;
            att.enabled = true;
            att.attractsParticles = false;
          }
        } else if (z.mType == 2) {
          const att = z.mAttractors.getAttractor();
          if (att) {
            att.strength = 50;
            att.zStrength = 0;
            att.radius = 5;
            att.pos = z.mPos;
            att.enabled = true;
            att.attractsParticles = false;
          }
        }
      }
    }
  }

  spawnTransition() {
    this.spawn();
    this.setState(ENTITY_STATE_RUNNING);
    this.mRotationRate = 0;
    this.run();
  }

  destroyTransition() {
    this.mStateTimer = this.mDestroyTime;
    super.destroy();

    this.setState(ENTITY_STATE_INACTIVE); // kill it off immediately

    // Throw out some particles
    /*const pos = new Point3d(this.mPos.x, this.mPos.y, this.mPos.z);
    const angle = new Point3d(0,0,0);
    const speed = 1;
    const spread = 2*PI;
    const num = 6;
    const timeToLive = 100;
    //const pen1 = new pen(this.mPen.r, this.mPen.g, this.mPen.b, this.mPen.a);
    const pen1 = new pen(1, 1, 1, 1);
    //pen1.lineRadius=5;
    //pen1.a = .8;
    this.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive);*/
  }

  draw() {
    if (this.getState() == ENTITY_STATE_RUNNING) {
      this.mPen = (this.mPlayerSource == 0) ? new pen(1, .9, .2, .7, 12) : new pen(.5, .5, 1, .7, 12);
      super.draw();
    }
  }

}
