
import { entity, ENTITY_STATE_INACTIVE, ENTITY_STATE_RUNNING } from "./entity"
import { pen } from "./vector"
import { calculate2dDistance, calculate2dAngle, rotate2dPoint } from "./mathutils"
import { Point3d } from "./point3d"

export class entityGeom extends entity {

  constructor() {
    super()

    this.setState(ENTITY_STATE_INACTIVE);

    this.mEdgeBounce = true;

    this.mLifetime = 0;

    this.mPen = new pen(1, 1, 0, .7, 12);
  }

  run() {
    const z = this;

    --z.mLifetime;
    if (z.mLifetime <= 0) {
      z.mState = ENTITY_STATE_INACTIVE;
    }

    if (z.getEnabled()) {
      // Suck the geoms into the player when in proximity
      const player = z.mPlayers.getPlayerClosestToPosition(z.mPos);
      if (player) {
        const distance = calculate2dDistance(player.getPos(), z.mPos);
        if (distance < 17) {
          z.mLifetime = 250;
          if (distance < 4) {
            z.mState = ENTITY_STATE_INACTIVE;
            player.addGeom(z.mScoreValue);
          } else {
            let angle = calculate2dAngle(z.mPos, z.mPlayers.getPlayerClosestToPosition(z.mPos).getPos());
            let moveVector = new Point3d(2, 0, 0);
            moveVector = rotate2dPoint(moveVector, angle);
            z.mSpeed.add(moveVector).multiply(.2);
            z.mSpeed.multiply(.8);
          }
        }
      }
    }

    super.run();
  }

  draw() {
    // Flicker as the Geom burns out
    let a = .7;
    if (this.mLifetime < 100) {
      a = (this.mLifetime / 200.0) * .7;
    }
    if (this.mLifetime < 200) {
      if (this.mLifetime/2 & 1) a /= 2;
    }
    this.mPen = new pen(1, 1, 0, a, 12);

    super.draw();
  }

  hit(aEntity) {;} // yeah, thanks for letting me know

  spawnTransition() {
    this.mLifetime = 350;
    this.mState = ENTITY_STATE_RUNNING;
  }

}
