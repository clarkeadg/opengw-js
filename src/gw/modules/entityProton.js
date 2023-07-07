
import { entity, ENTITY_TYPE_PROTON, ENTITY_STATE_INACTIVE } from "./entity"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { PI } from "./defines"
import { calculate2dAngle, rotate2dPoint, clamp2dVector } from "./mathutils"

export class entityProton extends entity {

  constructor() {
    super()

    this.mScale = 1;
    this.mRadius = 1.2;

    this.mEdgeBounce = true;

    this.mSpawnTime = 0;

    this.mScoreValue = 50; // ??

    this.mDestroyTime = 0;

    this.mPen = new pen(.5, .6, 1, .7, 12);

    this.mType = ENTITY_TYPE_PROTON;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mModel.mNumVertex = 16;
    this.mModel.mVertexList = [];

    const delta_theta = (2*PI)/this.mModel.mNumVertex;
    const r = this.mScale.x * this.mRadius;

    let i = 0;
    for (let angle = 0; i<this.mModel.mNumVertex; angle += delta_theta, i++ ) {
      this.mModel.mVertexList[i] = new Point3d(r*Math.cos(angle), r*Math.sin(angle));
    }

    this.mModel.mNumEdges = 4;
    this.mModel.mEdgeList = [];
    for(i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    for (i=0; i<this.mModel.mNumEdges-1; ++i) {
      this.mModel.mEdgeList[i].from = i; this.mModel.mEdgeList[i].to = i+1;
    }
    this.mModel.mEdgeList[i].from = i; this.mModel.mEdgeList[i].to = 0;
  }

  run() {
    const z = this;

    if (this.getEnabled()) {

      // Seek the player
      let angle = calculate2dAngle(z.mPos, z.mPlayers.getPlayerClosestToPosition(mPos).getPos());
      let moveVector = new Point3d(1, 0, 0);
      moveVector = rotate2dPoint(moveVector, angle);
      mSpeed.add(moveVector).multiply(.1);
      mSpeed = clamp2dVector(mSpeed, .6 * mAggression);
    }
  }

  spawnTransition() {
    super.spawnTransition();
    this.mDrift.x = (Math.random() * 4) - 2;
    this.mDrift.y = (Math.random() * 4) - 2;
  }
}
