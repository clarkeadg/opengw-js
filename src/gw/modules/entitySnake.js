
import { entity, ENTITY_TYPE_SNAKE_SEGMENT, ENTITY_STATE_INDICATING, ENTITY_STATE_SPAWNING } from "./entity"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { calculate2dDistance, rotate2dPoint, DegreesToRads, clamp2dVector } from "./mathutils"
import { RENDERPASS_BLUR } from "./scene"

const NUM_SEGMENTS  = 23;
const NUM_SEG_STREAM_ITEMS = 5; // sets the spacing between segments

class SegmentStreamItem {
  constructor() {
    this.pos = new Point3d();
    this.angle = 0;    
  }
}

class entitySnakeSegment extends entity {

  constructor() {
    super();

    this.mScale = 1; // gets sized dynamically by the head
    this.mRadius = 1;

    this.mScoreValue = 0;

    this.mTail = 0;

    this.mDestroyTime = 0;

    this.mType = ENTITY_TYPE_SNAKE_SEGMENT;

    this.mPen = new pen(1, 1, .8, .5, 12);

    let i = 0;

    this.mModel.mNumVertex = 3;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, .8);
    this.mModel.mVertexList[i++] = new Point3d(.5, -.5);
    this.mModel.mVertexList[i++] = new Point3d(-.5, -.5);    

    this.mModel.mNumEdges = 3;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; mModel.mEdgeList[i++].to = 0;

    this.mSegmentStream = [];
    for(let i=0;i<NUM_SEG_STREAM_ITEMS;i++) {
      this.mSegmentStream.push(new SegmentStreamItem());
    }

    for (let i=0; i<NUM_SEG_STREAM_ITEMS; i++) {
      this.mSegmentStream[i].pos = mPos;
      this.mSegmentStream[i].angle = mAngle;
    }
  }

  setParent(parent) {
    this.mParent = parent;
  }

  getParent() {
    return this.mParent;
  }

  setStreamHead(item) {
    this.mSegmentStream[0].pos = item.pos;
    this.mSegmentStream[0].angle = item.angle;
  }

  getStreamHead() {
    return this.mSegmentStream[0];
  }

  getStreamTail() {
    return this.mSegmentStream[parseInt(this.mTail,10)];
  }

  draw() {
    if (this.getState() == ENTITY_STATE_INDICATING) {
      if ((parseInt(this.mParent.getStateTimer()/10),10) & 1) {
        const pen1 = this.mPen;
        if (this.mPass == RENDERPASS_BLUR) {
          pen1.r = 1;
          pen1.g = .5;
          pen1.b = .1;
          pen1.lineRadius = 18;
        }
        this.mModel.draw(pen1);
      }
    } else if (this.getEnabled()) {
      const pen1 = this.mPen;
      if (this.mPass == RENDERPASS_BLUR) {
        pen1.r = 1;
        pen1.g = .5;
        pen1.b = .1;
        pen1.lineRadius = 18;
      }
      this.mModel.draw(pen1);
    }
  }

  drawSpawn(index, total) {
    const pen1 = this.mPen;

    let scale = this.mScale;
    let trans = this.mPos;

    let inc = 1.0 / total;
    let progress = index * inc;

    // *********************************************

    progress = 1-progress;

    let a = progress;
    if (a<0) a = 0;
    if (a>1) a = 1;

    pen1.a = a;

    this.mModel.Identity();
    const s = new Point3d(scale.x * progress * 1, scale.y, scale.z);
    this.mModel.Scale(s);
    this.mModel.Rotate(this.mAngle);
    this.mModel.Translate(trans);
    this.mModel.draw(pen1);

    // Restore stuff
    this.mModel.Identity();
    this.mModel.Rotate(this.mAngle);
    this.mModel.Scale(scale);
    this.mModel.Translate(trans);
  }

  run() {
    super.run();

    this.setPos(this.mSegmentStream[0].pos);
    this.setAngle(this.mSegmentStream[0].angle);

    // Shift the stream from head to tail
    for (let i=NUM_SEG_STREAM_ITEMS-2; i>=0; i--) {
      this.mSegmentStream[i+1].pos = this.mSegmentStream[i].pos;
      this.mSegmentStream[i+1].angle = this.mSegmentStream[i].angle;
    }

    if (this.mTail < NUM_SEG_STREAM_ITEMS-1) {
      this.mTail += .1;
      if (this.mTail > NUM_SEG_STREAM_ITEMS-1)
        this.mTail = NUM_SEG_STREAM_ITEMS-1;
    }
  }

  spawnTransition() {
    super.spawnTransition();
    this.mTail = NUM_SEG_STREAM_ITEMS-1;
  }

  postSpawnTransition() {
    // Set up all the segments
    for (let i=0; i<NUM_SEG_STREAM_ITEMS; i++) {
      this.mSegmentStream[i].pos = this.mPos;
      this.mSegmentStream[i].angle = this.mAngle;
    }
  }

  destroyTransition() {
    this.setState(ENTITY_STATE_DESTROYED);
    this.mStateTimer = this.mDestroyTime;

    // Throw out some particles
    const pos = new Point3d(this.mPos.x, this.mPos.y, this.mPos.z);
    const angle = new Point3d(0,0,0);
    const speed = 1.2;
    const spread = 2*PI;
    const num = 10;
    const timeToLive = 150;
    const pen1 = this.mPen;
    pen1.r *= 1.2;
    pen1.g *= 1.2;
    pen1.b *= 1.2;
    pen1.a = .8;
    pen1.lineRadius=5;
    this.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive, true, true, .98, true);

    // Explode the object into line entities
    this.mEnemies.explodeEntity(this);
  }

  destroy() {
    super.destroy();
  }

  hit(aEntity) {
    // Do nothing and don't call the base class method (tail segments are invinsible)
  }
}

//////////////////////////////////////////////////////////////////////////

export class entitySnake extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    const z = this;

    this.mScale = 1; // gets sized dynamically by the head
    this.mRadius = 1;

    this.mScoreValue = 0;

    this.mTail = 0;

    this.mDestroyTime = 0;

    this.mType = ENTITY_TYPE_SNAKE_SEGMENT;

    this.mPen = new pen(1, 1, .8, .5, 12);

    let i = 0;

    this.mModel.mNumVertex = 3;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, .8);
    this.mModel.mVertexList[i++] = new Point3d(.5, -.5);
    this.mModel.mVertexList[i++] = new Point3d(-.5, -.5);

    this.mModel.mNumEdges = 3;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 0;

    this.mSegmentStream = [];
    for(let i=0;i<NUM_SEG_STREAM_ITEMS;i++) {
      const s = new SegmentStreamItem()
      s.pos.x = z.mPos.x;
      s.pos.y = z.mPos.y;
      s.pos.z = z.mPos.z;
      s.angle = z.mAngle;
      z.mSegmentStream.push(s);
    }
  }

  runTransition() {
    super.runTransition();
  }

  run() {
    const z = this;

    if (z.getEnabled()) {
      const targetDistance = calculate2dDistance(z.mPos, mTarget);
      if (targetDistance < 10) {
        // Pick a new target
        z.updateTarget();
      }

      const diff = (calculate2dAngle(z.mPos, mTarget) - DegreesToRads(90));

      if (Math.abs(diff) > .1) {
        if (z.mAngle < diff) {
          z.mRotationRate += .005;
        } else if ((z.mAngle > diff)) {
          z.mRotationRate -= .005;
        }
      }

      z.mRotationRate *= .98;

      const maxRate = 2;

      if (z.mRotationRate > maxRate)
        z.mRotationRate = maxRate;
      else if (mRotationRate < -maxRate)
        z.mRotationRate = -maxRate;

      let moveVector = new Point3d(0, 1, 0);
      moveVector = rotate2dPoint(moveVector, mAngle);
      z.mSpeed.add(moveVector);
      z.mSpeed = clamp2dVector(z.mSpeed, .5);

      z.mSpeed.multiply(.95);

      // Segments

      // Set the first segment head
      
      const item = new SegmentStreamItem();
      item.pos = mPos;
      item.angle = mAngle;
      mSegments[0].setStreamHead(item);      

      // Propagate the segment streams tail to head
      for (let i=NUM_SEGMENTS-2; i>=0; i--) {
        const segmentThis = z.mSegments[i];
        const segmentNext = z.mSegments[i+1];

        segmentNext.setStreamHead(segmentThis.getStreamTail());
      }

      // Run each
      for (let i=0; i<NUM_SEGMENTS; i++) {
        z.mSegments[i].run();
      }

    }
    super.run();
  }

  draw() {  

    if (this.getState() == ENTITY_STATE_INDICATING) {
      if ((parseInt(mStateTimer/10),10) & 1) {
        this.mModel.draw(this.mPen);
      }
    } else if (this.getEnabled()) {
      const pen1 = this.mPen;

      if (this.getState() == ENTITY_STATE_SPAWNING) {
        let scale = this.mScale;
        let trans = this.mPos;

        let inc = 1.0 / this.mSpawnTime;
        let progress = this.mStateTimer * inc;

        // *********************************************

        //glLineWidth(pen1.lineRadius*.3);
        //glBegin(GL_LINES);

        progress = 1-progress;

        let a = progress;
        if (a<0) a = 0;
        if (a>1) a = 1;

        pen1.a = a;

        this.mModel.Identity();
        this.mModel.Scale(scale * progress * 1);
        this.mModel.Rotate(this.mAngle);
        this.mModel.Translate(trans);
        this.mModel.emit(pen1);

        // *********************************************

        // Restore stuff
        this.mModel.Identity();
        this.mModel.Rotate(this.mAngle);
        this.mModel.Scale(scale);
        this.mModel.Translate(trans);

        //glEnd();
      }

      this.mModel.draw(pen1);
    }

    if (this.getState() == ENTITY_STATE_SPAWNING) {
      for (let i=0; i<NUM_SEGMENTS; i++) {
        //this.mSegments[i].drawSpawn(this.mStateTimer, this.mSpawnTime);
      }
    } else {
      for (let i=0; i<NUM_SEGMENTS; i++) {
        //this.mSegments[i].draw();
      }
    }    
  }

  spawnTransition() {
    const z = this;

    super.spawnTransition();

    // Aim towards the closest player
    z.mAngle = calculate2dAngle(z.mPos, z.mPlayers.getPlayerClosestToPosition(z.mPos).getPos()) + DegreesToRads(-90);

    z.updateTarget();

    // Position and aim the tail segments correctly for a spawn
    for (let i=0; i<NUM_SEGMENTS; i++) {
      z.mSegments[i].spawnTransition();

      let posVector = new Point3d(0, (i+1) * -.2, 0);
      posVector = rotate2dPoint(posVector, z.mAngle);
      z.mSegments[i].setPos(z.mPos.copy().add(posVector));
      z.mSegments[i].setAngle(mAngle);

      z.mSegments[i].postSpawnTransition();
    }

    //z.mSound.playTrack(SOUNDID_ENEMYSPAWN6A);
  }

  spawn() {
    super.spawn();

    for (let i=0; i<NUM_SEGMENTS; i++) {
      this.mSegments[i].spawn();
    }
  }

  hitTest(pos, radius) {
    // First see if it hit the head
    const e = super.hitTest(pos, radius);
    if (e) return e;

    const z = this;

    // Nope, check the tail segments
    for (let i=0; i<NUM_SEGMENTS; i++) {
      const segment = z.mSegments[i];
      let ourPos = new Point3d(0,0,0);
      segment.getModel().mMatrix.TransformVertex(new Point3d(0,0,0), ourPos);

      const distance = calculate2dDistance(pos, ourPos);
      const resultRadius = radius + segment.getRadius();
      if (distance < resultRadius) {
        return segment;
      }
    }

    return null;
  }

  destroyTransition() {
    super.destroyTransition();

    for (let i=0; i<NUM_SEGMENTS; i++) {
      this.mSegments[i].destroyTransition();
    }
  }

  destroy() {
    super.destroy();

    for (let i=0; i<NUM_SEGMENTS; i++) {
      this.mSegments[i].destroy();
    }
  }

  indicateTransition() {
    super.indicateTransition();
    for (let i=0; i<NUM_SEGMENTS; i++) {
      this.mSegments[i].setState(ENTITY_STATE_INDICATING);
    }
  }

  updateTarget() {
    // Pick a random point around us
    const distance = 40;

    let angle = Math.random() * (2*PI);
    this.mTarget = new Point3d(distance, 0, 0);
    this.mTarget = rotate2dPoint(this.mTarget, angle);
    this.mTarget.add(this.mPos);

    const margin = 15;

    // THIS IS WRONG theGame.mGrid.extentX()
    // TODO - FIX THIS

    const leftEdge = margin;
    const bottomEdge = margin;
    const rightEdge = (this.mGrid.extentX()-1)-margin;
    const topEdge = (this.mGrid.extentY()-1)-margin;

    if (this.mTarget.x < leftEdge)
      this.mTarget.x = leftEdge;
    else if (this.mTarget.x > rightEdge)
      this.mTarget.x = rightEdge;
    if (this.mTarget.y < bottomEdge)
      this.mTarget.y = bottomEdge;
    else if (this.mTarget.y > topEdge)
      this.mTarget.y = topEdge;
  }
}
