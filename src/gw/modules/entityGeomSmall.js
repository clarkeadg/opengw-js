
import { entity, ENTITY_TYPE_GEOM_SMALL } from "./entity"
import { entityGeom } from "./entityGeom"
import { Edge } from "./model"
import { Point3d } from "./point3d"

export class entityGeomSmall extends entityGeom {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = .4;
    this.mRadius = .5;

    this.mScoreValue = 10;

    this.mType = ENTITY_TYPE_GEOM_SMALL;

    let i = 0;

    this.mModel.mNumVertex = 3;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, 1);
    this.mModel.mVertexList[i++] = new Point3d(1, -1);
    this.mModel.mVertexList[i++] = new Point3d(-1, -1);

    this.mModel.mNumEdges = 3;
    this.mModel.mEdgeList = [];
    for(let i=0;i<this.mModel.mNumEdges;i++) {
      this.mModel.mEdgeList.push(new Edge());
    }

    i = 0;

    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 0;
  }

}
