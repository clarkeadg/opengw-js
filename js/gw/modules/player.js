
import { GL_LINE_LOOP, glColor4f, glVertex3f, glBegin, glEnd } from "./webgl"
import { 
  entity,
  ENTITY_STATE_INACTIVE,
  ENTITY_STATE_SPAWN_TRANSITION,
  ENTITY_STATE_SPAWNING,
  ENTITY_STATE_RUN_TRANSITION,
  ENTITY_STATE_RUNNING,
  ENTITY_STATE_DESTROY_TRANSITION,
  ENTITY_STATE_DESTROYED
} from "./entity"
import { 
  input_create_user, 
  input_destroy, 
  input_ignore, 
  input_restore, 
  input_button_pressed, 
  input_button_down, 
  IB_UP, 
  IB_DOWN, 
  IB_LEFT, 
  IB_RIGHT, 
  IB_FIRE1, 
  IB_FIRE3, 
  IB_FIRE4 ,
  IB_AXES_LEFT,
  IB_AXES_RIGHT,
  IB_W, 
  IB_A, 
  IB_S, 
  IB_D,
} from "./../core/input"
import { Point3d } from "./point3d"
import { pen } from "./vector"
import { entityPlayerMissile} from "./entityPlayerMissile"
import { rotate2dPoint, DegreesToRads, calculate2dAngle, diffAngles, calculate2dDistance } from "./mathutils"
import { fmod } from "./util"
import { PI } from "./defines"
import { GAMEMODE_CHANGINGLEVELS } from "./game"

export const PLAYER_SHEILD_TIME = 250;

let logonce = false;

export class player extends entity {
  
  constructor(attractor, grid) {
    super();

    const z = this;

    this.mGrid = grid;

    this.mDrawSheild = false;

    this.mDestroyTime = 50;

    this.mMaxMissiles = 500;

    this.setState(ENTITY_STATE_INACTIVE);

    // Create our missiles
    this.missiles = [];        

    this.initPlayerForGame();
  }

  setGame(game) {
    this.mGame = game;
  }

  setBomb(bomb) {
    this.mBomb = bomb;
  }

  setEnemies(enemies) {
    this.mEnemies = enemies;
  }

  setParticles(particles) {
    this.mParticles = particles;
  }

  ///////////////////////////////////

  initPlayerForGame() {
    console.log('INIT PLAYER FOR GAME')

    this.mNumBombs = 5;
    this.mNumLives = 5;

    this.mBombCounter = 0;
    this.mLifeCounter = 0;
    this.mBombInterimTimer = 0;

    this.mGeoms = 0;

    this.mScore = 0;

    this.mMultiplier = 1;

    this.mFiringTimer = 0;

    this.mKillCounter = 0;
    this.mLevelAdvanceCounter = 0;

    this.mCurrentWeapon = 0;

    this.mAngle = 0;

    this.setState(ENTITY_STATE_SPAWN_TRANSITION);

    this.mInput = input_create_user();
  }

  run() {

    if (this.getEnabled()) {

      // Read the trigger
      if (this.mGameMode != GAMEMODE_CHANGINGLEVELS) {
        //if (this.mNumPlayers == 1) {
          //const trigger = game::mControls.getTriggerButton(this.mPlayerAssignment);
          const trigger = input_button_pressed(this.mInput, IB_FIRE1);
          if (trigger) {
            if (this.getNumBombs() > 0 && this.mBombInterimTimer <= 0) {
              // Fire off a bomb
              this.takeBomb();
              this.mBombInterimTimer = 50;

              this.mBomb.startBomb(new Point3d(this.mPos.x, this.mPos.y, this.mPos.z), 1, 6, 2, 1000, new pen(1,1,1,.3,4));
              //this.mSound.playTrack(SOUNDID_BOMB);
            }
          }
          if (this.mBombInterimTimer>0) {
            --this.mBombInterimTimer;
          }
        //}
      }

      let playerSpeed = new Point3d(0,0,0);
      
      // Move the player
      let leftStick = this.mInput.state[IB_AXES_LEFT];
      let distance = 0;
      if (leftStick) { 
        distance = calculate2dDistance(new Point3d(0,0,0), leftStick);
      } else {
        
        leftStick = new Point3d(0,0,0);

        if(input_button_down(this.mInput, IB_W)) {
          leftStick.x = 1;
          distance = 1;
        }
        if(input_button_down(this.mInput, IB_S)) {
          leftStick.x = -1;
          distance = 1;
        }
        if(input_button_down(this.mInput, IB_A)) {
          leftStick.y = 1;
          distance = 1;
        }
        if(input_button_down(this.mInput, IB_D)) {
          leftStick.y = -1;
          distance = 1;
        }
      }
      
      if (distance > .1) {

        // The movement stick is being used

        if (distance > .6) {
          distance = 1;
        } else {
          distance = .5;
        }

        let angle = calculate2dAngle(new Point3d(0,0,0), leftStick) + DegreesToRads(90);
        let thrust = new Point3d(distance*0.9, 0, 0);
        thrust = rotate2dPoint(thrust, angle);

        angle -= DegreesToRads(90);
        
        // Rotate to the correct angle
        angle = fmod(angle, 2*PI);
        let currentAngle = fmod(this.getAngle(), 2*PI);
        const diff = diffAngles(angle, currentAngle);
        currentAngle += diff * .2;
        this.setAngle(currentAngle);
        //console.log(angle)

        if (!logonce) {
          logonce = true;
          //console.log('22222', leftStick, angle)
        }

        // Move
        playerSpeed = thrust;
        this.setPos(this.getPos().add(thrust));

        // Emit exhaust particles
        /*const exhaustAngle = currentAngle + DegreesToRads(180);
        let exhaustOffset = new Point3d();

        const speed = .5;
        let num = 1;
        const timeToLive = 200;
        const myPen = (this.mPlayerAssignment==0) ? new pen(1, .5, .2, 0.2, 5) : new pen(.5, .5, 1, 0.2, 5);

        // Main stream    
        let spread = .9;
        exhaustOffset = rotate2dPoint(new Point3d(0, -2, 0), angle);
        exhaustOffset.add(this.getPos());
        this.mParticles.emitter(exhaustOffset, exhaustAngle, speed, spread, num, myPen, timeToLive, true, true, .93, false);

        let spreadIndex = 0;
        
        // First swirl    
        exhaustOffset = rotate2dPoint(new Point3d(0, -3, 0), angle + (Math.sin(spreadIndex) * .3));
        exhaustOffset.add(this.getPos());
        spread = .1;
        this.mParticles.emitter(exhaustOffset, exhaustAngle, speed, spread, num, myPen, timeToLive, true, true, .93, false);

        // Second swirl    
        exhaustOffset = rotate2dPoint(new Point3d(0, -3, 0), angle + (Math.sin(-spreadIndex) * .3));
        exhaustOffset.add(this.getPos());
        spread = .1;
        this.mParticles.emitter(exhaustOffset, exhaustAngle, speed, spread, num, myPen, timeToLive, true, true, .93, false);

        spreadIndex += .24;*/

      } else {
        //this.mSound.stopTrack(SOUNDID_PLAYERTHRUST);
      }

      // Firing
      let rightStick = this.mInput.state[IB_AXES_RIGHT];
      distance = 0;
      if (rightStick) {
        distance = calculate2dDistance(new Point3d(0,0,0), rightStick);
      } else {
        rightStick = new Point3d(0,0,0);

        if(input_button_down(this.mInput, IB_UP)) {
          rightStick.x = 1;
          distance = 1;
        }
        if(input_button_down(this.mInput, IB_DOWN)) {
          rightStick.x = -1;
          distance = 1;
        }
        if(input_button_down(this.mInput, IB_LEFT)) {
          rightStick.y = 1;
          distance = 1;
        }
        if(input_button_down(this.mInput, IB_RIGHT)) {
          rightStick.y = -1;
          distance = 1;
        }
      } 
      
      if (distance > .1) {

        //this.firePattern1(rightStick, playerSpeed);
        //this.firePattern2(rightStick, playerSpeed);
        this.firePattern3(rightStick, playerSpeed);

      } else {
        //this.mSound.stopTrack(SOUNDID_PLAYERFIRE1A);
        //this.mSound.stopTrack(SOUNDID_PLAYERFIRE2A);
        //this.mSound.stopTrack(SOUNDID_PLAYERFIRE3A);
      }

    }

    this.runMissiles();

    this.mDrawSheild = false;

    if (this.mSheildTimer > 0)
      --this.mSheildTimer;

    if (this.mSheildTimer < 60) {
      this.mDrawSheild = (this.mSheildTimer/6) & 1;
    } else {
      this.mDrawSheild = true;
    }

    if (this.mSheildTimer == 60) {
      //this.mSound.playTrack(SOUNDID_SHIELDSLOST);
    }

    //if (this.mDrawSheild) {
      const att = this.mAttractors.getAttractor();
      if (att) {
        //att.strength = 20;
        att.strength = 40;
        att.zStrength = 0;
        att.radius = 4;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = false;
      }
    //}

    super.run();
  }

  spawnTransition() {
    this.mSheildTimer = PLAYER_SHEILD_TIME;

    const angle = this.getAngle();
    super.spawnTransition();
    this.setAngle(angle);

    this.mDrawSheild = true;

    //game::mSound.playTrack(SOUNDID_PLAYERSPAWN);
  }

  spawn() {
    super.spawn();

    //console.log('PLAYER SPAWN')

    this.mDrawSheild = true;

    // Rez-up grid distortion

    //let att = getAttractor();
    //console.log('ATTRACTOR', att)

    const att = this.mAttractors.getAttractor();
    if (att) {
      if (this.mStateTimer > (this.mSpawnTime-25)) {
        att.strength = -20;
        att.zStrength = 0;
        att.radius = 10;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = true;
      } else if (this.mStateTimer > (this.mSpawnTime-50) && this.mStateTimer <= (this.mSpawnTime-25)) {
        att.strength = 10;
        att.zStrength = 0;
        att.radius = 10;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = true;
      }
    }
  }

  destroyTransition() {
    super.destroyTransition();

    this.mStateTimer = this.mDestroyTime;

    // Reset the multipler
    this.mMultiplier = 1;

    const att = this.mAttractors.getAttractor();
    if (att) {
      if (this.mStateTimer > 20) {
        att.strength = 10;
        att.radius = 20;
        att.pos = this.mPos;
        att.enabled = true;
        att.attractsParticles = false;
      }
    }

    // Throw out some particles
    const pos = new Point3d(this.mPos.x, this.mPos.y, this.mPos.z);
    const angle = new Point3d(0,0,0);
    const speed = 2;
    const spread = 2*PI;
    const num = 200;
    const timeToLive = 300;
    const pen1 = new pen(this.mPen.r, this.mPen.g, this.mPen.b, this.mPen.a);
    pen1.r *= 1.2;
    pen1.g *= 1.2;
    pen1.b *= 1.2;
    pen1.a = .8;
    pen1.lineRadius=5;
    this.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive, true, true, .98, true);

    this.setState(ENTITY_STATE_DESTROYED);

    //this.mSound.stopTrack(SOUNDID_PLAYERFIRE1A);
    //this.mSound.stopTrack(SOUNDID_PLAYERFIRE2A);
    //this.mSound.stopTrack(SOUNDID_PLAYERFIRE3A);

    if (this.getNumLives() <= 1) {
      //theGame.endGame();
    } else {
      //this.mSound.playTrack(SOUNDID_PLAYERHIT);
    }
  }

  indicating() {
    if (--this.mStateTimer <= 0) {
      this.setState(ENTITY_STATE_INACTIVE);
    }
  }

  draw() {
    const z = this;  

    // Draw the missiles
    for (let i=0; i<z.mMaxMissiles; i++) {
      let missile = z.missiles[i];
      if (missile.getEnabled()) {
        missile.draw();
      }
    }

    //glEnable(GL_MULTISAMPLE);
    //glEnable(GL_LINE_SMOOTH);

    if (this.getEnabled()) {
      // Draw the shields
      if (this.mDrawSheild) {
        const delta_theta = 0.05;
        const r = 2.5;

        glColor4f(this.mPen.r, this.mPen.g, this.mPen.b, this.mPen.a);

        glBegin(GL_LINE_LOOP);

        for (let angle = 0; angle < 2*PI; angle += delta_theta ) {
          glVertex3f( this.mPos.x + (r*Math.cos(angle)), this.mPos.y + (r*Math.sin(angle)), 0 );
        }

        glEnd();
      }
    }

    super.draw();
  }

  addKillAtLocation(points, pos) {
    const pointsEarned = points * this.mMultiplier;
    this.mScore += pointsEarned;
    this.mBombCounter += pointsEarned;
    this.mLifeCounter += pointsEarned;

    if (this.mBombCounter >= 100000) {
      this.mBombCounter = 0;
      this.addBomb();
      //this.mSound.playTrack(SOUNDID_EXTRABOMB);
    }
    if (this.mLifeCounter >= 75000) {
      this.mLifeCounter = 0;
      this.addLife();
      //this.mSound.playTrack(SOUNDID_EXTRALIFE);
    }

    let showMultiplier = false;

    ++this.mKillCounter;
    if (this.mKillCounter >= 25) {
      // Increment the multiplier and display a message
      this.mKillCounter = 0;
      ++this.mMultiplier;
      showMultiplier = true;
    }

    /*theGame.incrementLevelComplete();

    vector::pen pen = (mPlayerAssignment==0) ? vector::pen(1, .5, .2, .9, 5) : vector::pen(.5, .5, 1, .9, 5);

    if (showMultiplier) {
      // Show the multiplier message
      char message[256];
      sprintf(message, "Multiplier x%d", mMultiplier);
      game::showMessageAtLocation(message, pos, pen);
      game::mSound.playTrack(SOUNDID_MULTIPLIERADVANCE);
    } else {
      // Just display the point value
      char message[128];
      sprintf(message, "%d", pointsEarned);
      game::showMessageAtLocation(message, pos, pen);
    }*/
  }

  runMissiles() {
    const z = this;

    for (let i=0; i<z.mMaxMissiles; i++) {
      let missile = z.missiles[i];
      if (missile.getEnabled()) {
        switch(missile.getState()) {
          case ENTITY_STATE_SPAWN_TRANSITION:
            missile.spawnTransition();
            break;
          case ENTITY_STATE_SPAWNING:
            missile.spawn();
            break;
          case ENTITY_STATE_RUN_TRANSITION:
            missile.runTransition();
            break;
          case ENTITY_STATE_RUNNING:
            missile.run(z.mEnemies, z.mGrid, z.mParticles);
            break;
          case ENTITY_STATE_DESTROY_TRANSITION:
            missile.destroyTransition();
            break;
          case ENTITY_STATE_DESTROYED:
            missile.destroy();
            break;
        }
      }
    }
  }

  shields() { return true; /*return this.mSheildTimer > 0;*/ }

  getNumLives() {
    if (this.mGame.mNumPlayers == 1)
      return this.mNumLives;
    else return this.mGame.m2PlayerNumLives;
  }

  getNumBombs() {
    if (this.mGame.mNumPlayers == 1)
      return this.mNumBombs;
    else return this.mGame.m2PlayerNumBombs;
  }

  getGeoms() { return this.mGeoms; }

  addLife() {
    if (this.mGame.mNumPlayers == 1)
      ++this.mNumLives;
    else ++this.mGame.m2PlayerNumLives;
  }

  takeLife() {
    if (this.mGame.mNumPlayers == 1)
      --this.mNumLives;
    else --this.mGame.m2PlayerNumLives;
  }

  addBomb() {
    if (this.mGame.mNumPlayers == 1)
      ++this.mNumBombs;
    // No bombs on 2 player game
  }

  takeBomb() {
    if (this.mGame.mNumPlayers == 1)
      --this.mNumBombs;
    // No bombs on 2 player game
  }

  addGeom(value) {
    this.mGeoms += value;
  }

  clearGeoms() {
    this.mGeoms = 0;
  }

  addPointsNoMultiplier(points) {
    const pointsEarned = parseInt(points,10);
    this.mScore += pointsEarned;
    this.mBombCounter += pointsEarned;
    this.mLifeCounter += pointsEarned;
  }

  switchWeapons() {
    if (this.mCurrentWeapon == 0) {
      this.mCurrentWeapon = 1;
    } else {
      this.mCurrentWeapon = (Math.random() * 100) < 50 ? 1 : 2;
    }
  }

  firePattern1(fireAngle, playerSpeed) {
    const z = this;

    if (--z.mFiringTimer <= 0) {
      z.mFiringTimer = 6;

      //console.log('FIRE MISSILE')

      // Find an unused missile
      let missile1 = null;
      for (let i=0; i<z.mMaxMissiles; i++) {
        //console.log(z.missiles[i])
        if (!z.missiles[i].getEnabled()) {
          missile1 = z.missiles[i];
          missile1.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile1.mType = 0;
          missile1.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }
      let missile2 = null;
      for (let i=0; i<z.mMaxMissiles; i++) {
        if (!z.missiles[i].getEnabled()) {
          missile2 = z.missiles[i];
          missile2.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile2.mType = 0;
          missile2.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }

      //console.log(missile1, missile2) 

      if (missile1 && missile2) {
        const angle = calculate2dAngle(new Point3d(0,0,0), fireAngle) + DegreesToRads(90);

        const speed = 1.4;
        const spread = .4;
        const missileAngle1 = (angle + spread);
        const missileAngle2 = (angle - spread);

        // ***************************************
        
        let missileSpeedVector = new Point3d(speed, 0, 0);
        let missileOffsetVector = new Point3d(2, 0, 0);

        let missilePos = this.getPos().copy().add(rotate2dPoint(missileOffsetVector, missileAngle1));
        missileSpeedVector = rotate2dPoint(missileSpeedVector, angle);

        missile1.setPos(missilePos);
        missile1.setAngle(angle - DegreesToRads(90));
        missile1.setSpeed(missileSpeedVector);
        missile1.mVelocity = speed;      

        // ***************************************
        
        missileSpeedVector = new Point3d(speed, 0, 0);
        missileOffsetVector = new Point3d(2, 0, 0);

        missilePos = this.getPos().copy().add(rotate2dPoint(missileOffsetVector, missileAngle2));
        missileSpeedVector = rotate2dPoint(missileSpeedVector, angle);

        missile2.setPos(missilePos);
        missile2.setAngle(angle - DegreesToRads(90));
        missile2.setSpeed(missileSpeedVector);
        missile2.mVelocity = speed;        
      }
    }
  }

  firePattern2(fireAngle, playerSpeed) {
    const z = this;

    if (--z.mFiringTimer <= 0) {
      let alternate = true;
      alternate = !alternate;
      if (alternate)
        z.mFiringTimer = 4;
      else
        z.mFiringTimer = 1;

      let missile1 = null;
      let missile2 = null;
      let missile3 = null;

      if (alternate) {
        for (let i=0; i<z.mMaxMissiles; i++) {
          if (!z.missiles[i].getEnabled()) {
            missile1 = z.missiles[i];
            missile1.setState(ENTITY_STATE_SPAWN_TRANSITION);
            missile1.mType = 1;
            missile1.mPlayerSource = z.mPlayerAssignment;
            break;
          }
        }
        for (let i=0; i<z.mMaxMissiles; i++) {
          if (!z.missiles[i].getEnabled()) {
            missile2 = z.missiles[i];
            missile2.setState(ENTITY_STATE_SPAWN_TRANSITION);
            missile2.mType = 1;
            missile2.mPlayerSource = z.mPlayerAssignment;
            break;
          }
        }
      } else {
        for (let i=0; i<z.mMaxMissiles; i++) {
          if (!z.missiles[i].getEnabled()) {
            missile3 = z.missiles[i];
            missile3.setState(ENTITY_STATE_SPAWN_TRANSITION);
            missile3.mType = 1;
            missile3.mPlayerSource = z.mPlayerAssignment;
            break;
          }
        }
      }

      const angle = calculate2dAngle(new Point3d(0,0,0), fireAngle) + DegreesToRads(90);
      const speed = 1.6;

      if (missile3) {
        let missilePos = new Point3d();
        let missileSpeedVector = new Point3d(speed, 0, 0);
        const missileOffsetVector = new Point3d(.5, 0, 0);

        missilePos = this.getPos().copy().add(rotate2dPoint(missileOffsetVector, angle));
        missileSpeedVector = rotate2dPoint(missileSpeedVector, angle);

        missile3.setPos(missilePos);
        missile3.setAngle(angle - DegreesToRads(90));
        missile3.setSpeed(missileSpeedVector);
        missile3.mVelocity = speed;
      }
    }
  }

  firePattern3(fireAngle, playerSpeed) {
    const z = this;

    if (--z.mFiringTimer <= 0) {
      z.mFiringTimer = 7;

      // Find 5 unused missiles
      let missile0 = null;
      let missile1 = null;
      let missile2 = null;
      let missile3 = null;
      let missile4 = null;

      for (let i=0; i<z.mMaxMissiles; i++) {
        if (!z.missiles[i].getEnabled()) {
          missile0 = z.missiles[i];
          missile0.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile0.mType = 2;
          missile0.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }
      for (let i=0; i<z.mMaxMissiles; i++) {
        if (!z.missiles[i].getEnabled()) {
          missile1 = z.missiles[i];
          missile1.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile1.mType = 2;
          missile1.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }
      for (let i=0; i<z.mMaxMissiles; i++) {
        if (!z.missiles[i].getEnabled()) {
          missile2 = z.missiles[i];
          missile2.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile2.mType = 2;
          missile2.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }
      for (let i=0; i<z.mMaxMissiles; i++) {
        if (!z.missiles[i].getEnabled()) {
          missile3 = z.missiles[i];
          missile3.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile3.mType = 2;
          missile3.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }
      for (let i=0; i<z.mMaxMissiles; i++) {
        if (!z.missiles[i].getEnabled()) {
          missile4 = z.missiles[i];
          missile4.setState(ENTITY_STATE_SPAWN_TRANSITION);
          missile4.mType = 2;
          missile4.mPlayerSource = z.mPlayerAssignment;
          break;
        }
      }

      if (missile0 && missile1 && missile2 && missile3 && missile4) {
        const angle = calculate2dAngle(new Point3d(0,0,0), fireAngle) + DegreesToRads(90);

        const speed = 1.2;
        const start1 = .1;
        const start2 = .15;
        const spread1 = .05;
        const spread2 = .09;
        const missileStart1 = (angle + start1);
        const missileStart2 = (angle - start1);
        const missileStart3 = (angle + start2);
        const missileStart4 = (angle - start2);
        const missileSpread1 = (angle + spread1);
        const missileSpread2 = (angle - spread1);
        const missileSpread3 = (angle + spread2);
        const missileSpread4 = (angle - spread2);

        // Missile 0 just fires out straight
        let missilePos = new Point3d();
        let missileSpeedVector = new Point3d(speed, 0, 0);
        let missileOffsetVector = new Point3d(2, 0, 0);

        missilePos = this.getPos().copy().add(rotate2dPoint(missileOffsetVector, angle));
        missileSpeedVector = rotate2dPoint(missileSpeedVector, angle);

        missile0.setPos(missilePos);
        missile0.setAngle(angle - DegreesToRads(90));
        missile0.setSpeed(missileSpeedVector);
        missile0.mVelocity = speed;

        // Missile 1 and 2 fire at a medium spread but aimed not far off from center
        missilePos = new Point3d();
        missileSpeedVector = new Point3d(speed, 0, 0);
        missileOffsetVector = new Point3d(2, 0, 0);

        missilePos = this.getPos().copy().add(rotate2dPoint(missileOffsetVector, missileStart1));
        missileSpeedVector = rotate2dPoint(missileSpeedVector, missileSpread1);

        missile1.setPos(missilePos);
        missile1.setAngle(angle - DegreesToRads(90));
        missile1.setSpeed(missileSpeedVector);
        missile1.mVelocity = speed;

        // Missile 3 and 4 fire at a far spread
        missilePos = new Point3d();
        missileSpeedVector = new Point3d(speed, 0, 0);
        missileOffsetVector = new Point3d(2, 0, 0);

        missilePos = this.getPos().copy().add(rotate2dPoint(missileOffsetVector, missileStart2));
        missileSpeedVector = rotate2dPoint(missileSpeedVector, missileSpread2);

        missile2.setPos(missilePos);
        missile2.setAngle(angle - DegreesToRads(90));
        missile2.setSpeed(missileSpeedVector);
        missile2.mVelocity = speed;
      }
    }
  }

}
