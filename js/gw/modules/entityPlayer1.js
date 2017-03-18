
import { ENTITY_TYPE_PLAYER1 } from "./entity"
import { player, PLAYER_SHEILD_TIME } from "./player"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { entityPlayerMissile } from "./entityPlayerMissile"

export class entityPlayer1 extends player {

  constructor(attractor, grid, particles) {
    super(attractor, grid)

    const z = this;

    this.mAttractors = attractor;
    this.mGrid = grid;
    this.mParticles = particles;

    this.mPlayerAssignment = 0;

    this.mType = ENTITY_TYPE_PLAYER1;

    this.mScale = 1.7;
    this.mRadius = 2;

    this.mScoreValue = 0;

    this.mSpawnTime = 35;
    this.mSheildTimer = PLAYER_SHEILD_TIME;

    let i = 0;

    this.mModel.mNumVertex = 8;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, -1);
    this.mModel.mVertexList[i++] = new Point3d(1, -.15);
    this.mModel.mVertexList[i++] = new Point3d(.5, .7);
    this.mModel.mVertexList[i++] = new Point3d(.72, .02);
    this.mModel.mVertexList[i++] = new Point3d(0, -.4);
    this.mModel.mVertexList[i++] = new Point3d(-.72, .02);
    this.mModel.mVertexList[i++] = new Point3d(-.5, .7);
    this.mModel.mVertexList[i++] = new Point3d(-1, -.15);    

    this.mModel.mNumEdges = 8;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 3; this.mModel.mEdgeList[i++].to = 4;
    this.mModel.mEdgeList[i].from = 4; this.mModel.mEdgeList[i++].to = 5;
    this.mModel.mEdgeList[i].from = 5; this.mModel.mEdgeList[i++].to = 6;
    this.mModel.mEdgeList[i].from = 6; this.mModel.mEdgeList[i++].to = 7;
    this.mModel.mEdgeList[i].from = 7; this.mModel.mEdgeList[i++].to = 0;

    for (let i=0; i<this.mMaxMissiles; i++) {
      const missile = new entityPlayerMissile(z.mAttractors, z.mEnemies, z.mGrid, z.mParticles);
      missile.setEnabled(false);
      this.missiles.push(missile);
    }
  }

  initPlayerForGame() {
    super.initPlayerForGame();

    this.mPen = new pen(1, 1, 1, .5, 12);
    this.mPos.x = this.mGrid.extentX() / 2;
    this.mPos.y = this.mGrid.extentY() / 2;
    this.mPos.z = 0;
  }

  spawnTransition() {
    super.spawnTransition();
  }

  spawn() {
    super.spawn();

    const att = this.mAttractors.getAttractor();
    if (att) {
      //if (this.mStateTimer > (this.mSpawnTime-25))
      //{
        att.strength = -20;
        att.zStrength = 0;
        att.radius = 10;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = true;
      //}
      //else if (this.mStateTimer > (this.mSpawnTime-50) && this.mStateTimer <= (this.mSpawnTime-25))
      //{
        /*att.strength = 10;
        att.zStrength = 0;
        att.radius = 10;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = true;*/
      //}
    }
  }

  run() {
    if (this.mDrawSheild) {
      const att = this.mAttractors.getAttractor();
      if (att) {
        att.strength = 20;
        att.zStrength = 0;
        att.radius = 4;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = false;
      }
    }

    super.run();
  }

}
