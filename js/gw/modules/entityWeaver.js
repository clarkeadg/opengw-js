
import { entity, ENTITY_TYPE_WEAVER, ENTITY_STATE_INACTIVE } from "./entity"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { calculate2dAngle, calculate2dDistance, rotate2dPoint, clamp2dVector, DegreesToRads, diffAngles } from "./mathutils"

export class entityWeaver extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = 1.5;
    this.mRadius = 2.4;

    this.mScoreValue = 100;

    this.mType = ENTITY_TYPE_WEAVER;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mAnimationIndex = 0;

    // 128, 255, 142
    this.mPen = new pen(.3, 1, .35, .5, 12);

    let i = 0;

    this.mModel.mNumVertex = 8;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, 1);
    this.mModel.mVertexList[i++] = new Point3d(1, 0);
    this.mModel.mVertexList[i++] = new Point3d(0, -1);
    this.mModel.mVertexList[i++] = new Point3d(-1, 0);
    this.mModel.mVertexList[i++] = new Point3d(-1, 1);
    this.mModel.mVertexList[i++] = new Point3d(1, 1);
    this.mModel.mVertexList[i++] = new Point3d(1, -1);
    this.mModel.mVertexList[i++] = new Point3d(-1, -1);

    this.mModel.mNumEdges = 8;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 3; this.mModel.mEdgeList[i++].to = 0;
    this.mModel.mEdgeList[i].from = 4; this.mModel.mEdgeList[i++].to = 5;
    this.mModel.mEdgeList[i].from = 5; this.mModel.mEdgeList[i++].to = 6;
    this.mModel.mEdgeList[i].from = 6; this.mModel.mEdgeList[i++].to = 7;
    this.mModel.mEdgeList[i].from = 7; this.mModel.mEdgeList[i++].to = 4;
  }

  run() {
    const z = this;

    if (z.getEnabled()) {

      // Check for missiles around us
      for (let i=0; i<z.mMaxMissiles; i++) {
        const missile = z.mPlayers.mPlayer1.missiles[i];
        if (missile.getEnabled()) {
          // Test this missile to see if it's aimed at us

          let angle = calculate2dAngle(missile.getPos(), z.mPos);
          let missileAngle = calculate2dAngle(new Point3d(0,0,0), missile.getSpeed());

          const diff = diffAngles(angle, missileAngle);

          if (Math.abs(diff) < 1) {
            // And close to us
            const distance = calculate2dDistance(missile.getPos(), z.mPos);
            if (distance < 25) {
              // Run away from it
              const angle = calculate2dAngle(mPos, z.mPlayers.mPlayer1.getPos());
              let moveVector = new Point3d(.8, diff > 0 ? 1.1 : -1.1, 0);
              moveVector = rotate2dPoint(moveVector, angle + DegreesToRads(180));
              moveVector = clamp2dVector(moveVector, .08);
              z.mDrift.add(moveVector);
            }
          }
        }
      }

      // Seek the player
      let angle = calculate2dAngle(z.mPos, z.mPlayers.getPlayerClosestToPosition(z.mPos).getPos());
      let moveVector = new Point3d(1, 0, 0);
      moveVector = rotate2dPoint(moveVector, angle);
      moveVector = clamp2dVector(moveVector, .08);
      z.mSpeed.add(moveVector);
      z.mSpeed = clamp2dVector(z.mSpeed, .6 * z.mAggression);

      z.mSpeed.multiply(.95);
    }

    super.run();
  }

  spawnTransition() {
    super.spawnTransition();
    this.mRotationRate = -.06;
    //this.mSound.playTrack(SOUNDID_ENEMYSPAWN3A);
  }

}
