
import { entity, ENTITY_TYPE_TINYSPINNER, ENTITY_STATE_INDICATING } from "./entity"
import { Point3d } from "./point3d"
import { pen } from "./vector"
import { calculate2dAngle, rotate2dPoint, clamp2dVector } from "./mathutils"

export class entityTinySpinner extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = 1;
    this.mRadius = 2.2;

    this.mScoreValue = 50;

    this.mVirtualPos = new Point3d(0,0,0);
    this.mAnimationIndex = 0;

    this.mType = ENTITY_TYPE_TINYSPINNER;
  }

  draw() {
    if (this.getState() == ENTITY_STATE_INDICATING) {
      if ((parseInt(this.mStateTimer/10),10) & 1) {
        this.mModel.draw(this.mPen);
      }
    }
    else if (this.getEnabled()) {
      this.mModel.Identity();
      this.mModel.Scale(this.mScale);
      this.mModel.Rotate(this.mAngle);
      this.mModel.Translate(this.mVirtualPos);

      this.mModel.draw(this.mPen);
    }
  }

  run() {
    if (this.getEnabled()) {
      // Seek the player

      let angle = calculate2dAngle(this.mPos, this.mPlayers.getPlayerClosestToPosition(this.mPos).getPos());
      let moveVector = new Point3d(1, 0, 0);
      moveVector = rotate2dPoint(moveVector, angle);
      this.mSpeed.add(moveVector).multiply(.02);
      this.mSpeed = clamp2dVector(this.mSpeed, .3 * mAggression);
      this.mSpeed.multiply(.9);

      // Run circling animation

      this.mAnimationIndex += .1;
      let offset = new Point3d(4,0,0);
      offset = rotate2dPoint(offset, this.mAnimationIndex);
      this.mVirtualPos = this.mPos + offset;
      this.mAngle = this.mAnimationIndex*2;
    }
    super.run();
  }

  spawnTransition() {
    super.spawnTransition();
  }

  spawn() {
    super.spawn();

    if (this.mStateTimer > 0) {
      // Make them invincible (and brighter) for a short period of time
      // so we don't just pick them off as soon as they spawn
      let c = this.mStateTimer / this.mSpawnTime;
      c = (1 * c) + (.5 * (1-c));
      this.mPen = new pen(1, c, 1, .5, 12);
      this.mStateTimer -= 1;
      this.run();
    }
    if (mStateTimer <= 0) {
      this.mPen = new pen(1, .5, 1, .5, 12);
    }
  }

  destroyTransition() {
    super.destroyTransition();
  }

  destroy() {
    super.destroy();
  }

}
