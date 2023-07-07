
import { entity, ENTITY_TYPE_GEOM_MEDIUM } from "./entity"
import { entityGeom } from "./entityGeom"
import { Edge } from "./model"
import { Point3d } from "./point3d"

export class entityGeomMedium extends entityGeom {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = .45;
    this.mRadius = .5;

    this.mScoreValue = 20;

    this.mType = ENTITY_TYPE_GEOM_MEDIUM;

    let i = 0;

    this.mModel.mNumVertex = 4;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(-2, 0);
    this.mModel.mVertexList[i++] = new Point3d(0, 1);
    this.mModel.mVertexList[i++] = new Point3d(2, 0);
    this.mModel.mVertexList[i++] = new Point3d(0, -1);

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

}
