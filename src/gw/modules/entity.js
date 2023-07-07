
import { glLineWidth, GL_LINES, glBegin, glEnd } from "./webgl"
import { Point3d } from "./point3d"
import { calculate2dDistance, calculate2dAngle, diffAngles, rotate2dPoint } from "./mathutils"
import { fmod } from "./util"
import { model } from "./model"
import { pen } from "./vector"
import { PI } from "./defines"

// Entity Types
export const ENTITY_TYPE_UNDEF          = 0;
export const ENTITY_TYPE_PLAYER1        = 1;
export const ENTITY_TYPE_PLAYER2        = 2;
export const ENTITY_TYPE_PLAYER_MISSILE = 3;
export const ENTITY_TYPE_GRUNT          = 4;
export const ENTITY_TYPE_WANDERER       = 5;
export const ENTITY_TYPE_WEAVER         = 6;
export const ENTITY_TYPE_SPINNER        = 7;
export const ENTITY_TYPE_TINYSPINNER    = 8;
export const ENTITY_TYPE_MAYFLY         = 9;
export const ENTITY_TYPE_SNAKE          = 10;
export const ENTITY_TYPE_SNAKE_SEGMENT  = 11;
export const ENTITY_TYPE_BLACKHOLE      = 12;
export const ENTITY_TYPE_PROTON         = 13;
export const ENTITY_TYPE_GEOM_SMALL     = 14;
export const ENTITY_TYPE_GEOM_MEDIUM    = 15;
export const ENTITY_TYPE_GEOM_LARGE     = 16;
export const ENTITY_TYPE_LINE           = 17;
export const ENTITY_NUM_TYPES           = 18; // Must be last

// Entity States
export const ENTITY_STATE_INACTIVE            = 0;
export const ENTITY_STATE_SPAWN_TRANSITION    = 1;
export const ENTITY_STATE_SPAWNING            = 2;
export const ENTITY_STATE_RUN_TRANSITION      = 3;
export const ENTITY_STATE_RUNNING             = 4;
export const ENTITY_STATE_DESTROY_TRANSITION  = 5;
export const ENTITY_STATE_DESTROYED           = 6;
export const ENTITY_STATE_INDICATE_TRANSITION = 7;
export const ENTITY_STATE_INDICATING          = 8;

export class entity {
  
  constructor(particles) {
    this.mParticles = particles;
    this.mSpawnTime = 50;
    this.mDestroyTime = 0;
    this.mIndicateTime = 100;
    this.mStateTimer = 0;
    this.mAggression = 1;
    this.mEdgeBounce = false;
    this.mGridBound = true;
    this.mGenId = 0;
    this.mRotationRate = 0;
    this.mAngle = 0;
    this.mPen = new pen();

    this.mModel = new model();

    // hack
    this.mPos = new Point3d(0,0,0);
    this.mSpeed = new Point3d(0,0,0);
    this.mDrift = new Point3d(0,0,0);
  }  

  getType() { return this.mType; }

  getPos() { return this.mPos; }
  setPos(pos) { this.mPos = pos; }

  getSpeed() { return this.mSpeed; }
  setSpeed(speed) { this.mSpeed = speed; }

  getDrift() { return this.mDrift; }
  setDrift(drift) { this.mDrift = drift; }

  getAngle() { return this.mAngle; }
  setAngle(angle) { this.mAngle = angle; }

  getRotationRate() { return this.mRotationRate; }
  setRotationRate(rate) { this.mRotationRate = rate; }

  getScale() { return this.mScale; }
  setScale(scale) { this.mScale = scale; }
  setScale(scale) { this.mScale = scale; }

  getPen() { return this.mPen; }
  setPen(pen) { this.mPen = pen; }

  getEnabled() { return this.mState !== ENTITY_STATE_INACTIVE; }
  setEnabled(enabled) { this.mState = (this.enabled) ? ENTITY_STATE_SPAWN_TRANSITION : ENTITY_STATE_INACTIVE; }

  getState() { return this.mState; }  
  setState(state) { this.mState = state; }

  getStateTimer() { return this.mStateTimer; }
  setStateTimer(stateTimer) { this.mStateTimer = stateTimer; }

  getModel() { return this.mModel; }

  getScoreValue() { return this.mScoreValue; }

  getRadius() { return this.mRadius; }

  getAggression() { return this.mAggression; }

  setEdgeBounce(bounce) { this.mEdgeBounce = bounce; }

  runTransition() {
    this.setState(ENTITY_STATE_RUNNING);
  }

  run() {
    this.mAggression += .0002;

    this.mPos.add(this.mSpeed);
    this.mPos.add(this.mDrift);
    this.mAngle += this.mRotationRate;
    this.mAngle = fmod(this.mAngle, 2.0*PI);
    
    // Keep it on the grid
    if (this.mGrid && this.mGridBound) {
      let deflectionAngle = 0;
      const hit = this.mGrid.hitTest(this.mPos, 0, new Point3d(), deflectionAngle);      
      if (hit) {
        this.mPos = hit.hitPoint;
        deflectionAngle = hit.angle;
        //console.log(hit)        
        //if (this.mEdgeBounce) {
          // Calculate the deflection angle
          /*let entityVector = new Point3d(this.mSpeed.x, this.mSpeed.y, 0);
          const entityAngle = calculate2dAngle(new Point3d(0,0,0), entityVector);
          const diff = diffAngles(entityAngle, deflectionAngle);
          entityVector = rotate2dPoint(entityVector, diff*2);
          this.mSpeed.x = entityVector.x;
          this.mSpeed.y = entityVector.y;
          console.log(entityVector)*/
        //}
      }
      //const hitPoint = new Point3d();
      //let deflectionAngle;
      //if (this.mGrid.hitTest(this.mPos, 0, hitPoint, deflectionAngle)) {
        //console.log('hit grid', hitPoint)
        //this.mPos = new Point3d(hitPoint.x, hitPoint.y, hitPoint.z);
        /*if (this.mEdgeBounce) {
          // Calculate the deflection angle
          let entityVector = new Point3d(this.mSpeed.x, this.mSpeed.y, 0);
          const entityAngle = calculate2dAngle(new Point3d(0,0,0), entityVector);
          const diff = diffAngles(entityAngle, deflectionAngle);
          entityVector = rotate2dPoint(entityVector, diff*2);
          this.mSpeed.x = entityVector.x;
          this.mSpeed.y = entityVector.y;
        }*/
      //}
    }

    // Update the model's matrix
    this.mModel.Identity();
    this.mModel.Scale(this.mScale);
    this.mModel.Rotate(this.mAngle);
    this.mModel.Translate(this.mPos);

    this.mDrift.multiply(.95);
  }

  spawnTransition() {
    this.setState(ENTITY_STATE_SPAWNING);
    this.mStateTimer = this.mSpawnTime;
    this.mSpeed = new Point3d(0,0,0);
    this.mDrift = new Point3d(0,0,0);
    this.mAngle = 0;
    this.mRotationRate = 0;
    this.mAggression = 1;

    this.spawn();

    // Update the model's matrix
    this.mModel.Identity();
    this.mModel.Scale(this.mScale);
    this.mModel.Rotate(this.mAngle);
    this.mModel.Translate(this.mPos);
  }

  spawn() {
    if (--this.mStateTimer <= 0) {
      this.setState(ENTITY_STATE_RUNNING);
    }
  }

  destroyTransition() {
    this.setState(ENTITY_STATE_DESTROYED);
    this.mStateTimer = this.mDestroyTime;

    ++this.mGenId;

    // Throw out some particles
    const pos = new Point3d(this.mPos.x, this.mPos.y, this.mPos.z);
    const angle = new Point3d(0,0,0);
    const speed = 1.2;
    const spread = 2*PI;
    const num = 50;
    const timeToLive = 150;
    const pen1 = new pen(this.mPen.r, this.mPen.g, this.mPen.b, this.mPen.a);
    pen1.r *= 1.2;
    pen1.g *= 1.2;
    pen1.b *= 1.2;
    pen1.a = .9;
    pen1.lineRadius=5;
    this.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive, true, true, .97, true);

    // Explode the object into line entities
    this.mEnemies.explodeEntity(this);
  }

  destroy() {
    if (--this.mStateTimer <= 0) {
      this.setState(ENTITY_STATE_INACTIVE);
    }
  }

  indicateTransition() {
    this.mStateTimer = this.mIndicateTime;
    this.setState(ENTITY_STATE_INDICATING);
  }

  indicating() {
    if (--this.mStateTimer <= 0) {
      this.setState(ENTITY_STATE_INACTIVE);
    }
  }

  hit(aEntity) {
    const z = this;

    let createGeoms = false;

    if (aEntity) {
      const missile = aEntity;
      //console.log('missile', missile.getType())
      if (missile.getType() < 3) {

        if (z.mScoreValue) {
          //console.log('score', missile.mPlayerSource, z.mScoreValue)
          // Add points and display them at the destruction point
          if (missile.mPlayerSource == 0)
            z.mPlayers.mPlayer1.addKillAtLocation(z.mScoreValue, z.getPos());
          else if (missile.mPlayerSource == 1)
            z.mPlayers.mPlayer2.addKillAtLocation(z.mScoreValue, z.getPos());

          createGeoms = true;
        }

        //z.mSound.playTrackGroup(SOUNDID_ENEMYHITA, SOUNDID_ENEMYHITA);
      } else if (aEntity && aEntity.getType() == ENTITY_TYPE_BLACKHOLE) {
        //z.mSound.playTrackGroup(SOUNDID_ENEMYHITA, SOUNDID_ENEMYHITA);
      } else if (aEntity && (aEntity.getType() == ENTITY_TYPE_PLAYER1) || (aEntity.getType() == ENTITY_TYPE_PLAYER2)) {
        //z.mSound.playTrackGroup(SOUNDID_ENEMYHITA, SOUNDID_ENEMYHITA);
      }
    } else {
      // It must be a bomb
      createGeoms = true;
    }

    this.setState(ENTITY_STATE_DESTROY_TRANSITION);

    if (createGeoms) {
      // Poop out random Geoms
      if (Math.random() * 100 < 50) {
        const geom = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_GEOM_MEDIUM);
        if (geom) {
          geom.setState(ENTITY_STATE_SPAWN_TRANSITION);
          geom.setPos(this.getPos());
          geom.setRotationRate((.01 * Math.random()) - .05);
          geom.setSpeed(new Point3d((.1 * Math.random()) - .05, (.1 * Math.random()) - .05, 0));
          geom.setDrift(new Point3d((1 * Math.random()) - .5, (1 * Math.random()) - .5, 0));
        }
      } else {
        for (let i=0; i<2; i++) {
          const geom = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_GEOM_SMALL);
          if (geom) {
            geom.setState(ENTITY_STATE_SPAWN_TRANSITION);
            geom.setPos(this.getPos());
            geom.setRotationRate((.01 * Math.random()) - .05);
            geom.setSpeed(new Point3d((.1 * Math.random()) - .05, (.1 * Math.random()) - .05, 0));
            geom.setDrift(new Point3d((1 * Math.random()) - .5, (1 * Math.random()) - .5, 0));
          }
        }
      }
    }
  }

  hitTest(pos, radius) {

    let ourPos = new Point3d(0,0,0);
    this.getModel().mMatrix.TransformVertex(new Point3d(0,0,0), ourPos);

    const distance = calculate2dDistance(pos, ourPos);
    const resultRadius = radius + this.getRadius();
    if (distance < resultRadius) {
      return this;
    }
    return null;
  }

  draw() {

    if (this.getState() == ENTITY_STATE_INDICATING) {
      if (parseInt((this.mStateTimer/10),10) & 1) {
        this.mModel.draw(this.mPen);
      }
    } else if (this.getEnabled()) {

      const myPen = new pen(this.mPen.r,this.mPen.g,this.mPen.b,this.mPen.a);
      
      if (this.getState() == ENTITY_STATE_SPAWNING) {
        let scale = this.mScale;
        let trans = this.mPos;

        let inc = 1.0 / this.mSpawnTime;
        let progress = this.mStateTimer * inc;

        // *********************************************

        glLineWidth(myPen.lineRadius*.3);
        glBegin(GL_LINES);

        progress = 1-progress;
  
        let a = progress;
        if (a<0) a = 0;
        if (a>1) a = 1;
  
        myPen.a = a;

        this.mModel.Identity();
        this.mModel.Scale(scale * progress * 1);
        this.mModel.Rotate(this.mAngle);
        this.mModel.Translate(trans);
        this.mModel.emit(myPen);
      
        // *********************************************

        progress = progress + .25;

        a = 1-progress;
        if (a<0) a = 0;
        if (a>1) a = 1;

        myPen.a = a;

        this.mModel.Identity();
        this.mModel.Scale(scale * progress * 4);
        this.mModel.Rotate(this.mAngle);
        this.mModel.Translate(trans);
        this.mModel.emit(myPen);

        // *********************************************

        progress = progress + .25;

        a = 1-progress;
        if (a<0) a = 0;
        if (a>1) a = 1;

        myPen.a = a;

        this.mModel.Identity();
        this.mModel.Scale(scale * progress * 7);
        this.mModel.Rotate(this.mAngle);
        this.mModel.Translate(trans);
        this.mModel.emit(myPen);

        // *********************************************

        // Restore stuff
        this.mModel.Identity();        
        this.mModel.Scale(scale);
        this.mModel.Rotate(this.mAngle);
        this.mModel.Translate(trans);

        glEnd();
      }

      this.mPen.a = 1;

      this.mModel.draw(this.mPen);
    }
  }

  getParent() { return this; }

  getGenId() { return this.mGenId; }
  incGenId() { ++this.mGenId; }
}
