
import { entity, ENTITY_TYPE_SPINNER, ENTITY_TYPE_TINYSPINNER, ENTITY_STATE_INACTIVE, ENTITY_STATE_SPAWN_TRANSITION } from "./entity"
import { Edge } from "./model"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { calculate2dAngle, rotate2dPoint, clamp2dVector, DegreesToRads } from "./mathutils"

export class entitySpinner extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = 1.6;
    this.mRadius = 2.5;

    this.mScoreValue = 100;

    this.mType = ENTITY_TYPE_SPINNER;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mAnimationIndex = 0;

    this.mPen = new pen(1, .5, 1, .7, 12);

    let i = 0;

    this.mModel.mNumVertex = 5;
    this.mModel.mVertexList = [];
    this.mModel.mVertexList[i++] = new Point3d(0, 0);
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

    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 0;
    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 4; this.mModel.mEdgeList[i++].to = 0;
    this.mModel.mEdgeList[i].from = 0; this.mModel.mEdgeList[i++].to = 2;
    this.mModel.mEdgeList[i].from = 2; this.mModel.mEdgeList[i++].to = 3;
    this.mModel.mEdgeList[i].from = 3; this.mModel.mEdgeList[i++].to = 4;
    this.mModel.mEdgeList[i].from = 4; this.mModel.mEdgeList[i++].to = 1;
    this.mModel.mEdgeList[i].from = 1; this.mModel.mEdgeList[i++].to = 2;
  }

  spawnTransition() {
    super.spawnTransition();
    //this.mSound.playTrackGroup(SOUNDID_ENEMYSPAWN2A, SOUNDID_ENEMYSPAWN2A);
  }

  run() {
    const z = this;

    if (z.getEnabled()) {
      // Seek the player

      const angle = calculate2dAngle(z.mPos, z.mPlayers.mPlayer1.getPos());
      let moveVector = new Point3d(1, 0, 0);
      moveVector = rotate2dPoint(moveVector, angle);
      z.mSpeed.add(moveVector.multiply(.2));
      z.mSpeed = clamp2dVector(z.mSpeed, .6 * z.mAggression);
      z.mSpeed.multiply(.9);

      // Run animation
      z.mAnimationIndex += .12; // .07
      z.mAngle = (Math.sin(z.mAnimationIndex)) * .5;
    }
    super.run();
  }

  destroyTransition() {
    const z = this;

    // Spawn 2 tiny spinners here at 90 degrees to the player
    const pos = z.mPos;
    super.destroyTransition();

    // Spawn them at opposing right angles to the player
    let spawnPoint = new Point3d(12,0,0);
    let angleToPlayer = calculate2dAngle(pos, z.mPlayers.mPlayer1.getPos());
    spawnPoint = rotate2dPoint(spawnPoint, angleToPlayer + DegreesToRads(90));

    let enemy = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_TINYSPINNER);
    if (enemy) {
      enemy.setPos(spawnPoint.copy().add(pos));
      enemy.setSpeed(spawnPoint.copy().multiply(.2));
      enemy.setState(ENTITY_STATE_SPAWN_TRANSITION);
    }

    spawnPoint = rotate2dPoint(spawnPoint, angleToPlayer - DegreesToRads(90));

    enemy = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_TINYSPINNER);
    if (enemy) {
      enemy.setPos(spawnPoint.copy().add(pos));
      enemy.setSpeed(spawnPoint.copy().multiply(.2));
      enemy.setState(ENTITY_STATE_SPAWN_TRANSITION);
    }
  }

  hit(aEntity) {
    if (aEntity) {
      const missile = aEntity;
      if (missile) {
        super.hit(aEntity);
        return;
      }
    }

    // If it's not a missile don't spawn tiny spinners

    super.destroyTransition();
  }

  spawnTransition() {
    super.spawnTransition();
    //this.mSound.playTrackGroup(SOUNDID_ENEMYSPAWN2A, SOUNDID_ENEMYSPAWN2A);
  }
}
