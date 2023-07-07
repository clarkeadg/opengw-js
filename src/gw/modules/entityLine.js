
import { entity, ENTITY_TYPE_LINE, ENTITY_STATE_INACTIVE, ENTITY_STATE_RUNNING, ENTITY_STATE_DESTROYED } from "./entity"
import { Point3d } from "./point3d"
import { pen, extendVector } from "./vector"
import { Edge } from "./model"
import { calculate2dDistance } from "./mathutils"

export class entityLine extends entity {

  constructor() {
    super();

    this.mScale = 1;
    this.mRadius = 1;

    this.mEdgeBounce = false;
    this.mGridBound = false;

    this.mTimeToLive = 0;
    this.mSpawnTime = 0;
    this.mDestroyTime = 0;

    this.mType = ENTITY_TYPE_LINE;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mModel.mNumVertex = 2;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[0] = new Point3d(0, 0);
    this.mModel.mVertexList[1] = new Point3d(0, 0);

    this.mModel.mNumEdges = 1;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }
    this.mModel.mEdgeList[0].from = 0;
    this.mModel.mEdgeList[0].to = 1;

    this.mPen = new pen(1,0,0,1,1);
  }

  spawnTransition() {
    this.setState(ENTITY_STATE_RUNNING);
    this.mTimeToLive = 100;
    this.run();
  }

  spawn() {}

  runTransition() {}

  run() {
    if (this.mTimeToLive < 50){
      this.mPen.a *= .95;
      extendVector(this.mModel.mVertexList[0], this.mModel.mVertexList[1], .97);
      const length = calculate2dDistance(this.mModel.mVertexList[0], this.mModel.mVertexList[1]);
      if (length < .1)
        this.mTimeToLive = 0;
    }

    if (--this.mTimeToLive <= 0) {
      this.mTimeToLive = 0;
      this.setState(ENTITY_STATE_DESTROYED);
    }

    this.mSpeed.multiply(.98);

    super.run();
  }

  destroyTransition() {}

  destroy() {
    super.destroy();
  }

  draw() {
    super.draw();
  }

  addEndpoints(from, to) {
    this.mModel.mVertexList[0] = new Point3d(from.x, from.y, from.z);
    this.mModel.mVertexList[1] = new Point3d(to.x, to.y, to.z);
  }

}
