
import { ENTITY_TYPE_PLAYER2 } from "./entity"
import { player, PLAYER_SHEILD_TIME } from "./player"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"

export class entityPlayer2 extends player {

  constructor() {
    super()

    this.mPlayerAssignment = 1;

    this.mType = ENTITY_TYPE_PLAYER2;

    this.mScale = .1;
    this.mRadius = 2;

    this.mScoreValue = 0;

    this.mSpawnTime = 35;
    this.mSheildTimer = PLAYER_SHEILD_TIME;

    this.mPen = new pen(.5, .5, 1, .7, 12);

    let i = 0;

    this.mModel.mNumVertex = 13;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, 17.5);
    this.mModel.mVertexList[i++] = new Point3d(6.5, 5.5);
    this.mModel.mVertexList[i++] = new Point3d(0, -6.5);
    this.mModel.mVertexList[i++] = new Point3d(-6.5, 5.5);

    this.mModel.mVertexList[i++] = new Point3d(1.5, -10.5);
    this.mModel.mVertexList[i++] = new Point3d(15, 1.5);
    this.mModel.mVertexList[i++] = new Point3d(9.2, -13.1);

    this.mModel.mVertexList[i++] = new Point3d(-1.5, -10.5);
    this.mModel.mVertexList[i++] = new Point3d(-15, 1.5);
    this.mModel.mVertexList[i++] = new Point3d(-9.2, -13.1);

    this.mModel.mVertexList[i++] = new Point3d(5, -17.7);
    this.mModel.mVertexList[i++] = new Point3d(0, -14.5);
    this.mModel.mVertexList[i++] = new Point3d(-5, -17.7);

    this.mModel.mNumEdges = 12;
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
    this.mModel.mEdgeList[i].from = 6; this.mModel.mEdgeList[i++].to = 4;

    this.mModel.mEdgeList[i].from = 7; this.mModel.mEdgeList[i++].to = 9;
    this.mModel.mEdgeList[i].from = 9; this.mModel.mEdgeList[i++].to = 8;
    this.mModel.mEdgeList[i].from = 8; this.mModel.mEdgeList[i++].to = 7;

    this.mModel.mEdgeList[i].from = 10; this.mModel.mEdgeList[i++].to = 11;
    this.mModel.mEdgeList[i].from = 11; this.mModel.mEdgeList[i++].to = 12;
  }

  //initPlayerForGame() {}

  //spawnTransition() {}

}
