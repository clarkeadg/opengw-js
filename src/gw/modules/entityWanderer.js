
import { entity, ENTITY_TYPE_WANDERER, ENTITY_STATE_INACTIVE } from "./entity"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { PI } from "./defines"
import { rotate2dPoint, clamp2dVector } from "./mathutils"

export class entityWanderer extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;
    this.mGrid = this.mPlayers.mGrid;

    const z = this;

    this.mScale = 1.7;
    this.mRadius = 2.6;

    this.mScoreValue = 25;

    this.mEdgeBounce = true;

    this.mType = ENTITY_TYPE_WANDERER;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mAnimationIndex = 0;

    // 211, 128, 255
    this.mPen = new pen(.65, .5, 1, .7, 12);

    let i = 0;

    this.mModel.mNumVertex = 9;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0,0);
    this.mModel.mVertexList[i++] = new Point3d(0,1);
    this.mModel.mVertexList[i++] = new Point3d(1,1);
    this.mModel.mVertexList[i++] = new Point3d(1,0);
    this.mModel.mVertexList[i++] = new Point3d(1,-1);
    this.mModel.mVertexList[i++] = new Point3d(0,-1);
    this.mModel.mVertexList[i++] = new Point3d(-1,-1);
    this.mModel.mVertexList[i++] = new Point3d(-1,0);
    this.mModel.mVertexList[i++] = new Point3d(-1,1);

    this.mFlipped = (Math.random() < .5);
    if (this.mFlipped) {
      for (let i=0; i<z.mModel.mNumVertex; i++) {
        const temp = z.mModel.mVertexList[i].y;
        z.mModel.mVertexList[i].y = z.mModel.mVertexList[i].x;
        z.mModel.mVertexList[i].x = temp;
      }
    }

    this.mModel.mNumEdges = 12;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 0;
    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 3; this.mModel.mEdgeList[i++].to = 4;
    this.mModel.mEdgeList[i].from = 4; this.mModel.mEdgeList[i++].to = 0;
    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 5;
    this.mModel.mEdgeList[i].from = 5; this.mModel.mEdgeList[i++].to = 6;
    this.mModel.mEdgeList[i].from = 6; this.mModel.mEdgeList[i++].to = 0;
    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 7;
    this.mModel.mEdgeList[i].from = 7; this.mModel.mEdgeList[i++].to = 8;
    this.mModel.mEdgeList[i].from = 8; this.mModel.mEdgeList[i++].to = 0;
  }

  run() {
    const z = this;

    if (z.getEnabled()) {
      if ((Math.random() * 40) < 1) {
        // Pick a random direction
        const variation = 1.5;
        z.mCurrentHeading = z.mCurrentHeading + ((Math.random() * variation) - (variation/2));
      }

      let speed = new Point3d(1,0,0);
      speed = rotate2dPoint(speed, z.mCurrentHeading);
      speed.multiply(.8)
      z.mSpeed.add(speed).multiply(.02);
      z.mSpeed = clamp2dVector(z.mSpeed, .3); // No aggression
      z.mSpeed.multiply(.98);

      // Change direction when we hit the grid edges
      if (z.mGrid.hitTest(z.mPos, this.getRadius()*2)) {
        z.mCurrentHeading = Math.random() * (2*PI);
      }
    }
    super.run();
  }

  spawnTransition() {
    super.spawnTransition();

    this.mSpeed = new Point3d(0,0,0);
    this.mAngle = 0;

    // Pick a random direction
    this.mCurrentHeading = Math.random() * (2*PI);

    this.mAngle = 0;
    this.mRotationRate = this.mFlipped ? -.12 : .12;

    //this.mSound.playTrackGroup(SOUNDID_ENEMYSPAWN1A, SOUNDID_ENEMYSPAWN1A);
  }

}
