
import { ENTITY_TYPE_GEOM_LARGE } from "./entity"
import { entityGeom } from "./entityGeom"
import { Edge } from "./model"
import { Point3d } from "./point3d"

export class entityGeomLarge extends entityGeom {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = .4;
    this.mRadius = .5;

    this.mScoreValue = 50;

    this.mType = ENTITY_TYPE_GEOM_LARGE;

    let i = 0;

    this.mModel.mNumVertex = 12;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(-.5, -2);
    this.mModel.mVertexList[i++] = new Point3d(-.5, -.5);
    this.mModel.mVertexList[i++] = new Point3d(-2, -.5);
    this.mModel.mVertexList[i++] = new Point3d(-2, .5);
    this.mModel.mVertexList[i++] = new Point3d(-.5, .5);
    this.mModel.mVertexList[i++] = new Point3d(-.5, 2);
    this.mModel.mVertexList[i++] = new Point3d(.5, 2);
    this.mModel.mVertexList[i++] = new Point3d(.5, .5);
    this.mModel.mVertexList[i++] = new Point3d(2, .5);
    this.mModel.mVertexList[i++] = new Point3d(2, -.5);
    this.mModel.mVertexList[i++] = new Point3d(.5, -.5);
    this.mModel.mVertexList[i++] = new Point3d(.5, -2);

    this.mModel.mNumEdges = 12;
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
    this.mModel.mEdgeList[i].from = 7; this.mModel.mEdgeList[i++].to = 8;
    this.mModel.mEdgeList[i].from = 8; this.mModel.mEdgeList[i++].to = 9;
    this.mModel.mEdgeList[i].from = 9; this.mModel.mEdgeList[i++].to = 10;
    this.mModel.mEdgeList[i].from = 10; this.mModel.mEdgeList[i++].to = 11;
    this.mModel.mEdgeList[i].from = 11; this.mModel.mEdgeList[i++].to = 0;

  }

}
