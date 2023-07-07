
import { entity, ENTITY_TYPE_MAYFLY, ENTITY_STATE_INACTIVE } from "./entity"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { calculate2dAngle, rotate2dPoint, clamp2dVector } from "./mathutils"

export class entityMayfly extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = 0.8;
    this.mRadius = 3;
    this.mTarget = new Point3d();

    this.mScoreValue = 50;

    this.mType = ENTITY_TYPE_MAYFLY;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mFlipTimer = Math.random() * 15;
    this.mFlipDirection = 1;

    this.mPen = new pen(1, .5, 1, .7, 12);

    let i = 0;

    this.mModel.mNumVertex = 6;
    this.mModel.mVertexList = [];

    this.mModel.mVertexList[i++] = new Point3d(-.25, 1.25);
    this.mModel.mVertexList[i++] = new Point3d(.25, 1.25);

    this.mModel.mVertexList[i++] = new Point3d(1.2, -.5);
    this.mModel.mVertexList[i++] = new Point3d(1, -.9);

    this.mModel.mVertexList[i++] = new Point3d(-1, -.9);
    this.mModel.mVertexList[i++] = new Point3d(-1.2, -.5);

    this.mModel.mNumEdges = 3;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 4;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 5;
  }

  run() {
    if (this.getEnabled()) {
      // Seek the player

      // Run animation
      if (--this.mFlipTimer <= 0) {
        this.mFlipTimer = 15;
        this.mFlipDirection = -this.mFlipDirection;

        // Update the target
        this.mTarget = new Point3d(this.mPlayers.mPlayer1.getPos().x, this.mPlayers.mPlayer1.getPos().y, this.mPlayers.mPlayer1.getPos().z);
        this.mTarget.x += (Math.random() * 30) - 15;
        this.mTarget.y += (Math.random() * 30) - 15;
      }

      const desiredAngle = 1.2 * this.mFlipDirection;
      const diff = desiredAngle-this.mAngle;
      this.mRotationRate += diff * .03;
      this.mRotationRate *= .9;

      let angle = calculate2dAngle(this.mPos, this.mTarget);
      let moveVector = new Point3d(1, 0, 0);
      moveVector = rotate2dPoint(moveVector, angle);
      this.mSpeed.add(moveVector).multiply(.5);
      this.mSpeed = clamp2dVector(this.mSpeed, .45 * this.mAggression);

      this.mSpeed.multiply(.9);
    }
    super.run();
  }

}
