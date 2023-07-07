
import { entity, ENTITY_TYPE_BLACKHOLE, ENTITY_TYPE_PROTON, ENTITY_STATE_INACTIVE, ENTITY_STATE_INDICATING, ENTITY_STATE_SPAWNING, ENTITY_STATE_SPAWN_TRANSITION, ENTITY_STATE_DESTROY_TRANSITION } from "./entity"
import { pen } from "./vector"
import { calculate2dDistance, clamp2dVector, rotate2dPoint, DegreesToRads } from "./mathutils"
import { Point3d } from "./point3d"
import { RENDERPASS_PRIMARY } from "./scene"

export class entityBlackHole extends entity {

  constructor(players, enemies) {
    super()

    this.mPlayers = players;
    this.mEnemies = enemies;
    this.mParticles = enemies.mParticles;

    this.mScale = 1.5;
    this.mRadius = 2.5;

    this.mEdgeBounce = true;

    this.mScoreValue = 50;

    this.mPen = new pen(1, .5, .5, .7, 4);

    this.mType = ENTITY_TYPE_BLACKHOLE;
    this.setState(ENTITY_STATE_INACTIVE);

    this.mActivated = false;
    this.mDestroyTime = 0;
    this.mAnimationIndex = 0;
    this.mAnimationSpeed = 0;
    this.mAnimationDepth = 0;
    this.mAttractorStrengthIndex = 0;
    this.mStrength = 1;
    this.mBalance = 0;
    this.mBalanceRate = 0;

    this.mHumLoopSoundId = -1;

    // This entity doesn't use a model
  }

  runTransition() {
    super.runTransition();
  }

  spawnTransition() {
    super.spawnTransition();

    this.mActivated = false;
    this.mRadius = 2.5;
    this.mStrength = 1.5;
    this.mBalance = 0;
    this.mBalanceRate = 0;
    this.mFeedCount = 0;

    this.mDestroyTime = 0;
    this.mAnimationIndex = 0;
    this.mAnimationSpeed = 0;
    this.mAnimationDepth = 0;
    this.mAttractorStrengthIndex = 0;
    this.mBalance = 0;

    this.mPoints = 150;

    this.mHumSpeed = (this.mStrength*this.mStrength)/2;
    this.mHumSpeedTarget = this.mHumSpeed;
    this.mHumLoopSoundId = -1;

    //this.mSound.playTrack(SOUNDID_ENEMYSPAWN5A);
  }

  destroyTransition() {
    // Here we actually get destroyed
    super.destroyTransition();

    //if (this.mHumLoopSoundId != -1)
    //  this.mSound.stopTrack(mHumLoopSoundId);
    this.mHumLoopSoundId = -1;

    // Throw out some particles
    for (let i=0; i<100; i++) {
      const pos = new Point3d(this.mPos.x, this.mPos.y, this.mPos.z);
      const angle = new Point3d(0,0,0);
      const speed = (i/200) * 1000;
      const spread = 2*PI;
      const num = 1;
      const timeToLive = Math.random() * 300;
      const pen1 = this.mPen;
      pen1.lineRadius = 5;
      z.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive);
    }

    const att = this.mAttractors.getAttractor();
    if (att) {
      att.strength = 20;
      att.zStrength = 0;
      att.radius = 30;
      att.pos = this.mPos;
      att.enabled = true;
      att.attractsParticles = false;
    }
  }

  indicateTransition() {
    super.indicateTransition();

    if (this.mHumLoopSoundId != -1) {
      this.mSound.stopTrack(this.mHumLoopSoundId);
    }
    this.mHumLoopSoundId = -1;
  }

  hitTest(pos, radius) {
    const distance = calculate2dDistance(pos, mPos);
    const resultRadius = radius + this.getRadius();
    if (distance < resultRadius) {
      return this;
    }
    return null;
  }

  feed(points) {
    this.mPoints += points * 2;
    this.mStrength += .05;
    this.mBalanceRate += .2;
    ++this.mFeedCount;
  }

  getRadius() {
    let r;
    if (this.mActivated) {
      r = this.mRadius + (Math.sin(mAnimationIndex)*mAnimationDepth);
      r *= this.mStrength + (this.mBalance*.1);
    } else {
      r = this.mRadius;
    }

    return r;
  }

  run() {
    const z = this;

    z.mAnimationSpeed = z.mStrength * .5;
    z.mAnimationDepth = /*mStrength **/ .2;

    z.mSpeed = clamp2dVector(z.mSpeed, .2);
    z.mSpeed.multiply(.96);

    z.mDrift = clamp2dVector(z.mDrift, .8);

    z.mHumSpeedTarget = (z.mStrength*z.mStrength)/2;
    if (z.mHumSpeed < z.mHumSpeedTarget)
      z.mHumSpeed += .01;
    else if (mHumSpeed > z.mHumSpeedTarget)
      z.mHumSpeed -= .01;

    if (z.mActivated) {
      z.mStrength += .0003;

      if (z.mHumLoopSoundId == -1)
        z.mHumLoopSoundId = z.mSound.playTrackGroup(SOUNDID_GRAVITYWELL_HUMLOOPA, SOUNDID_GRAVITYWELL_HUMLOOPF);
      if (z.mHumLoopSoundId != -1)
      z.mSound.setTrackSpeed(z.mHumLoopSoundId, z.mHumSpeed+.2);

      if (z.mStrength > 2.2) {
        if (!z.mSound.isTrackPlaying(SOUNDID_GRAVITYWELLALERT))
          z.mSound.playTrack(SOUNDID_GRAVITYWELLALERT);
      }
      if (z.mStrength > 2.3) {
        // Explode and spawn a bunch of protons
        z.setState(ENTITY_STATE_DESTROY_TRANSITION);
        z.mSound.playTrack(SOUNDID_GRAVITYWELLEXPLODE);

        for (let i=0; i<20; i++) {
          const enemy = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_PROTON);
          if (enemy) {
            const distance = Math.random() * 10;
            const angle = Math.random() * (2*PI);
            let spawnPoint = new Point3d(distance, 0, 0);
            spawnPoint = rotate2dPoint(spawnPoint, angle);

            enemy.setDrift(new Point3d(spawnPoint.x*100, spawnPoint.y*100, 0));
            enemy.setPos(spawnPoint.copy().add(mPos));
            enemy.setState(ENTITY_STATE_SPAWN_TRANSITION);
          }
        }

        return;
      }

      if (z.mBalance > 0)
        z.mBalanceRate -= .01;
      else if (z.mBalance < 0)
        z.mBalanceRate += .01;

      z.mBalanceRate *= .95;
      z.mBalance += z.mBalanceRate;
      z.mBalance *= .95;

      // Distort the grid

      const distance = 2;

      const dir = (Math.random() * 100) < 10 ? -1 : 1;

      const att = z.mAttractors.getAttractor();
      if (att) {
        att.strength = -25 * dir;
        att.zStrength = 0;
        att.radius = 10;

        att.pos = z.mPos;
        att.enabled = true;
        att.attractsParticles = true;
      }
    }

    // Seek the player

    const angle = calculate2dAngle(z.mPos, z.mPlayers.getPlayerClosestToPosition(z.mPos).getPos());
    let moveVector = new Point3d(1, 0, 0);
    moveVector = rotate2dPoint(moveVector, angle);
    z.mSpeed.add(moveVector).multiply(.002);

    z.mSpeed.multiply(.98);

    z.mAnimationIndex+= z.mAnimationSpeed;

    super.run();

    // Keep it on the grid
    // THIS IS WRONG!!!!

    const leftEdge = z.getRadius();
    const bottomEdge = z.getRadius();
    const rightEdge = (z.mGrid.extentX() - z.getRadius())-1;
    const topEdge = (z.mGrid.extentY() - z.getRadius())-1;

    if (z.mPos.x < leftEdge) {
      z.mPos.x = leftEdge;
      z.mSpeed.x = -z.mSpeed.x;
    } else if (z.mPos.x > rightEdge) {
      z.mPos.x = rightEdge;
      z.mSpeed.x = -z.mSpeed.x;
    }
    if (z.mPos.y < bottomEdge) {
      z.mPos.y = bottomEdge;
      z.mSpeed.y = -z.mSpeed.y;
    } else if (z.mPos.y > topEdge) {
      z.z.mPos.y = topEdge;
      z.mSpeed.y = -z.mSpeed.y;
    }
  }

  hit(aEntity) {
    const z = this;

    const missile = aEntity;
    if (missile) {
      if (z.mActivated) {
        z.mSound.playTrack(SOUNDID_GRAVITYWELLHIT);

        z.mStrength *= .985;

        let createGeoms = false;

        if (z.mStrength < .7) {
          // Destroy
          z.setState(ENTITY_STATE_DESTROY_TRANSITION);
          z.mSound.playTrack(SOUNDID_GRAVITYWELLDESTROYED);

          //entityPlayerMissile* missile = dynamic_cast<entityPlayerMissile*>(aEntity);
          if (missile) {
            if (z.mPoints) {
              const pos = z.getPos();

              // Add points and display them at the destruction point
              if (missile.mPlayerSource == 0)
                z.mPlayers.mPlayer1.addKillAtLocation(z.mPoints, pos);
              else if (missile.mPlayerSource == 1)
                z.mPlayers.mPlayer2.addKillAtLocation(z.mPoints, pos);

              createGeoms = true;
            }
          } else {
            createGeoms = true;
          }

          // Poop out random Geoms
          if (createGeoms) {
            for (let j=0; j<z.mFeedCount; j++) {
              if (Math.random() * 100 < 50) {
                if (Math.random() * 100 < 50) {
                  const geom = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_GEOM_MEDIUM);
                  if (geom) {
                    geom.setState(ENTITY_STATE_SPAWN_TRANSITION);
                    geom.setPos(z.getPos());
                    geom.setRotationRate((.01 * Math.random()) - .05);
                    geom.setSpeed(new Point3d((.1 * Math.random()) - .05, (.1 * Math.random()) - .05, 0));
                    geom.setDrift(new Point3d((1 * Math.random()) - .5, (1 * Math.random()) - .5, 0));
                  }
                } else {
                  for (let i=0; i<2; i++) {
                    const geom = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_GEOM_SMALL);
                    if (geom) {
                      geom.setState(ENTITY_STATE_SPAWN_TRANSITION);
                      geom.setPos(z.getPos());
                      geom.setRotationRate((.01 * Math.random()) - .05);
                      geom.setSpeed(new Point3d((.1 * Math.random()) - .05, (.1 * Math.random()) - .05, 0));
                      geom.setDrift(new Point3d((1 * Math.random()) - .5, (1 * Math.random()) - .5, 0));
                    }
                  }
                }
              } else  {
                const geom = z.mEnemies.getUnusedEnemyOfType(ENTITY_TYPE_GEOM_LARGE);
                if (geom) {
                  geom.setState(ENTITY_STATE_SPAWN_TRANSITION);
                  geom.setPos(z.getPos());
                  geom.setRotationRate((.01 * Math.random()) - .05);
                  geom.setSpeed(new Point3d((.1 * Math.random()) - .05, (.1 * Math.random()) - .05, 0));
                  geom.setDrift(new Point3d((1 * Math.random()) - .5, (1 * Math.random()) - .5, 0));
                }
              }
            }
          }
        }
      } else  {
        z.mActivated = true;

        if (z.mGameMode == GAMEMODE_PLAYING) {
          if (z.mHumLoopSoundId == -1)
            z.mHumLoopSoundId = z.mSound.playTrackGroup(SOUNDID_GRAVITYWELL_HUMLOOPA, SOUNDID_GRAVITYWELL_HUMLOOPF);
        }

        z.mBalance = 2;
        z.mBalanceRate = 0;
      }

      let r;
      if (z.mActivated) {
        r = z.mRadius + (Math.sin(mAnimationIndex)*mAnimationDepth);
        r *= z.mStrength + (z.mBalance*.1);
      } else {
        r = z.mRadius;
      }

      for (let i=0; i<360; i++) {
        if (Math.random() * 100 < 10) {
          const ang = DegreesToRads(i);
          let pos = new Point3d(0, r+1, 0);
          pos = rotate2dPoint(pos, ang);
          pos.add(z.mPos);
          let angle = new Point3d(0,ang,0);

          const speed = 30;
          const spread = 0;
          const num = 1;
          const timeToLive = 100;
          const pen1 = z.mPen;
          pen1.r = Math.random() + .5;
          pen1.g = Math.random() + .5;
          pen1.b = Math.random() + .5;
          pen1.a = .2;
          pen1.lineRadius=5;
          z.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive, false, true, .95);
        }
      }

      z.mBalance -= .2;
    } else if (aEntity && aEntity.getType() == ENTITY_TYPE_BLACKHOLE) {
      z.mActivated = true;

      z.mBalance = 2;
      z.mBalanceRate = 0;

      // Distrupt the grid at the activation point
      const att = z.mAttractors.getAttractor();
      if (att) {
        att.strength = 20;
        att.zStrength = 0;
        att.radius = 20;
        att.pos = z.mPos;
        att.enabled = true;
        att.attractsParticles = false;
      }
    } else {
      // It must be a bomb
      z.destroyTransition();
    }
  }

  draw() {
    const z = this;

    if (z.getState() == ENTITY_STATE_INDICATING) {
      if ((parseInt(mStateTimer/10),10) & 1)  {
      } else return;
    }

    if (z.getEnabled()) {
      //glEnable(GL_MULTISAMPLE);
      //glEnable(GL_LINE_SMOOTH);

      if (z.getState() == ENTITY_STATE_SPAWNING) {
        //vector::pen pen = z.mPen;
        let radius = z.mRadius;

        let inc = 1.0 / z.mSpawnTime;
        let progress = z.mStateTimer * inc;

        // *********************************************

        progress = 1-progress;

        let a = progress;
        if (a<0) a = 0;
        if (a>1) a = 1;

        z.mPen.a = a;

        z.mRadius = radius * progress * 1;
        z.drawRing();

        // *********************************************

        progress = progress + .25;

        a = 1-progress;
        if (a<0) a = 0;
        if (a>1) a = 1;

        z.mPen.a = a;

        z.mRadius = radius * progress * 4;
        z.drawRing();

        // *********************************************

        progress = progress + .25;

        a = 1-progress;
        if (a<0) a = 0;
        if (a>1) a = 1;

        z.mPen.a = a;

        z.mRadius = radius * progress * 7;
        z.drawRing();

        // *********************************************

        // Restore stuff
        z.mRadius = radius;
        //z.mPen = pen;
      }

      z.drawRing();

      //glDisable(GL_MULTISAMPLE);
      //glDisable(GL_LINE_SMOOTH);

    }
  }

  drawRing() {
    let activated = (this.getState() == ENTITY_STATE_INDICATING) ? false : this.mActivated;

    const delta_theta = 0.05;

    let r;
    if (activated) {
      r = this.mRadius + (Math.sin(this.mAnimationIndex)*this.mAnimationDepth);
      r *= this.mStrength + (this.mBalance*.1);
    r *= .8;
    } else {
      r = this.mRadius;
    }

    if (activated && (this.mState != ENTITY_STATE_SPAWNING)) {
      //glBlendFunc(GL_DST_COLOR, GL_ONE_MINUS_SRC_ALPHA);

      //glColor4f(0, 0, 0, 1);

      //glBegin(GL_TRIANGLE_FAN);

      //glVertex3f( mPos.x, mPos.y, 0 );

      let c = r;

      //for (angle = 0; angle < 2.01*PI; angle += delta_theta )
      //  glVertex3f( mPos.x + (c*cos(angle)), mPos.y + (c*sin(angle)), 0 );

      //glEnd();

      //glBlendFunc(GL_SRC_ALPHA, GL_ONE);
    }


    if ((this.mState != ENTITY_STATE_SPAWNING) && (this.mPass !== RENDERPASS_PRIMARY)) {
      //glDisable(GL_BLEND);
      //glBlendFunc(GL_SRC_ALPHA, GL_ONE);

      //glColor4f(.3, .05, .05, 1);
      //glLineWidth(6);

      //glBegin(GL_LINE_LOOP);

      let c = r+.2;

      //for (angle = 0; angle < 2*PI; angle += delta_theta )
      //  glVertex3f( mPos.x + (c*cos(angle)), mPos.y + (c*sin(angle)), 0 );

      //glEnd();


      //glBegin(GL_LINE_LOOP);

      c = r;

      //for (angle = 0; angle < 2*PI; angle += delta_theta )
      //  glVertex3f( mPos.x + (c*cos(angle)), mPos.y + (c*sin(angle)), 0 );

      //glEnd();


      //glEnable(GL_BLEND);
      //glBlendFunc(GL_SRC_ALPHA, GL_ONE);
    }

    //c =(Math.sin(this.mAnimationIndex)*this.mAnimationDepth);

    if (activated) {
      //glColor4f(1, 1, 1, 1);
    } else {
      //glColor4f(this.mPen.r+(c*.25), this.mPen.g+(c*.25), this.mPen.b+(c*.25), this.mPen.a);
    }

    if (activated && (this.mState != ENTITY_STATE_SPAWNING)) {
      //glLineWidth(this.mPen.lineRadius);
    } else {
      //glLineWidth(this.mPen.lineRadius);
    }

    //glBegin(GL_LINE_LOOP);

    //for (angle = 0; angle < 2*PI; angle += delta_theta )
    //  glVertex3f( this.mPos.x + (r*Math.cos(angle)), this.mPos.y + (r*Math.sin(angle)), 0 );

    //glEnd();
  }
}
