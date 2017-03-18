
import { entity, ENTITY_TYPE_GRUNT, ENTITY_STATE_INACTIVE, ENTITY_STATE_DESTROYED } from "./entity"
import { Point3d } from "./point3d"
import { pen, extendVector } from "./vector"
import { Edge } from "./model"
import { calculate2dAngle, calculate2dDistance, clamp2dVector, rotate2dPoint } from "./mathutils"
//import { getPlayerClosestToPosition } from "./getPlayerClosestToPosition"

export class entityGrunt extends entity {

  constructor(players, enemies) {
    super();

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = 1.5;
    this.mRadius = 3;

    this.mScoreValue = 50;

    this.mType = ENTITY_TYPE_GRUNT;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mAnimationIndex = 0;

    this.mPen = new pen(.5, 1, 1, .7, 12);

    let i = 0;

    this.mModel.mNumVertex = 4;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, 1);
    this.mModel.mVertexList[i++] = new Point3d(1, 0);
    this.mModel.mVertexList[i++] = new Point3d(0, -1);
    this.mModel.mVertexList[i++] = new Point3d(-1, 0);

    this.mModel.mNumEdges = 4;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 3; this.mModel.mEdgeList[i++].to = 0;   
  }

  run() {

    const z = this;

    if (this.getEnabled()) {

      // Seek the player
      //const angle = 0.52; //calculate2dAngle(z.mPos, z.mPlayers.getPlayerClosestToPosition(z.mPos).getPos());
      const angle = calculate2dAngle(z.mPos, z.mPlayers.mPlayer1.getPos());
      let moveVector = new Point3d(1, 0, 0);
      moveVector = rotate2dPoint(moveVector, angle);
      z.mSpeed.add(moveVector).multiply(.01);
      z.mSpeed = clamp2dVector(z.mSpeed, .3 * z.mAggression);

      z.mSpeed.multiply(20.99);

      // Run animation
      z.mAnimationIndex += .07;
      z.mScale = (2 + (Math.sin(this.mAnimationIndex) * .4));    
    }

    super.run();
  }

  spawnTransition() {
    super.spawnTransition();
    //game::mSound.playTrackGroup(SOUNDID_ENEMYSPAWN4A, SOUNDID_ENEMYSPAWN4A);
  }

}
