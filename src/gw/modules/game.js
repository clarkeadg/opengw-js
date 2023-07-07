
import { glEnable, glDisable, GL_MULTISAMPLE, GL_LINE_SMOOTH, glTranslatef, glLineWidth, glPointSize } from "./webgl"
import { attractor } from "./attractor"
import { bomb } from "./bomb"
import { camera } from "./camera"
import { enemies } from "./enemies"
import { grid } from "./grid"
import { hyperspace } from "./hyperspace"
import { particle } from "./particle"
import { players } from "./players"
import { stars } from "./stars"
import { spawner } from "./spawner"
import { Point3d } from "./point3d"
import { PI } from "./defines"
import { pen } from "./vector"
import { entity, ENTITY_STATE_RUNNING, ENTITY_STATE_INACTIVE } from "./entity"
import { calculate2dAngle, calculate2dDistance, rotate2dPoint } from "./mathutils"
import { RENDERPASS_PRIMARY } from "./scene"
import { music_load, music_play, music_pause, music_stop, music_set_volume, music_get_volume, music_is_playing, sound_play } from "./../core/audio"

export const GAMEMODE_ATTRACT             = 0;
export const GAMEMODE_CREDITED            = 1;
export const GAMEMODE_PLAYING             = 2;
export const GAMEMODE_HIGHSCORES_CHECK    = 3;
export const GAMEMODE_HIGHSCORES          = 4;
export const GAMEMODE_GAMEOVER_TRANSITION = 5;
export const GAMEMODE_GAMEOVER            = 6;
export const GAMEOVER_LEVELCOMPLETE       = 7;
export const GAMEMODE_CHANGINGLEVELS      = 8;

let musicfile = "data/music/musicloop.wav";

export class game {  

  constructor() {

    this.music = music_load(musicfile);

    this.mFreeplay = true;
    this.mCredits = 0;
    this.mNumPlayers = 1;
    this.mLevel = 0;
    this.m2PlayerNumLives = 0;
    this.m2PlayerNumBombs = 0;

    this.mParticles = new particle();
    this.mAttractors = new attractor();
    this.mGrid = new grid(this.mAttractors);
    this.mPlayers = new players(this.mAttractors, this.mGrid);
    this.mEnemies = new enemies(this.mPlayers, this.mParticles);
    this.mCamera = new camera(this.mPlayers, this.mGrid);  
    this.mHyperspace = new hyperspace(this.mCamera);   
    this.mStars = new stars(this.mGrid);
    this.mSpawner = new spawner(this.mPlayers, this.mEnemies, this.mGrid);
    this.mBomb = new bomb(this.mAttractors, this.mParticles, this.mEnemies); 

    this.mCamera.center();

    // point displays

    // Tag 4 black holes for attract mode
    this.mAttractModeBlackHoles = [];
    for (let i=0; i<4; i++) {
      this.mAttractModeBlackHoles[i] = new entity();
      this.mAttractModeBlackHoles[i].setPos(new Point3d(Math.random() * this.mGrid.extentX(), Math.random() * this.mGrid.extentY(), 0));
      this.mAttractModeBlackHoles[i].setEdgeBounce(false);

      let heading = Math.random() * (2*PI);
      if ((Math.random() * 40) < 1){
        // Pick a random direction
        const variation = 1.5;
        heading + Math.random() * (2*PI);
      }

      let speedVector = new Point3d(1,0,0);
      speedVector = rotate2dPoint(speedVector, heading);
      this.mAttractModeBlackHoles[i].setDrift(speedVector);
    }

    this.mGameMode = GAMEMODE_ATTRACT;
    //this.mGameMode = GAMEMODE_CHANGINGLEVELS;

    //this.mSound.playTrack(SOUNDID_MENU_MUSICLOOP);

    this.mCameraLevelZoom = 1;
  }

  run() {
    const z = this;

    //console.log('RUN GAME')

    if (this.mFreeplay) {
      this.mCredits = 2;
    }

    this.mAttractors.clearAll();

    // Run the camera
    this.mCamera.run();

    //this.mHyperspace.run();

    switch(this.mGameMode) {
      case GAMEMODE_ATTRACT:
      {
        if (this.mCredits > 0) {
          this.mGameMode = GAMEMODE_CREDITED;
        }
      }
      break;
      case GAMEMODE_CREDITED:
      {
        //if (this.mControls.getStart1Button())
        //{
            this.startGame(1);
        //}
        /*else if (this.mControls.getStart2Button())
        {
            this.startGame(2);
        }*/
      }
      case GAMEMODE_PLAYING:
      {
        // Zoom in
        this.mCamera.mZoomOverride = 900 * (this.mCameraLevelZoom);
        this.mCameraLevelZoom *= .97; 

        if (this.mLevelStartWaitTimer > 0) {
          --this.mLevelStartWaitTimer;
        }

        this.mCamera.followPlayer();
        this.mStars.run();
        this.mPlayers.run();
        this.mBomb.run();
        if (this.mLevelStartWaitTimer <= 0) {
          this.mSpawner.run();
        }
        //this.mBlackHoles.run();
        this.mEnemies.run();
        //this.runPointDisplays();

      }
      break;
      default:
      break;
    }

    this.mGrid.run();

    if ((this.mGameMode == GAMEMODE_HIGHSCORES_CHECK) || (this.mGameMode == GAMEMODE_HIGHSCORES)) {
    } else if (this.mGameMode == GAMEMODE_ATTRACT || this.mGameMode == GAMEMODE_CREDITED) {

      this.mCameraLevelZoom = 1;
      this.mCamera.mZoomOverride = 0;
      this.mCamera.center();

      // Attractors to wander around the fireworks display

      const sizex = this.mGrid.extentX();
      const sizey = this.mGrid.extentY();

      for (let i=0; i<4; i++) {
        z.mAttractModeBlackHoles[i].setState(ENTITY_STATE_RUNNING);
        z.mAttractModeBlackHoles[i].run();

        //console.log(z.mAttractModeBlackHoles[i])
        
        const pos = z.mAttractModeBlackHoles[i].getPos();

        const att = z.mAttractors.getAttractor();
        if (att) {
          att.strength = -40;
          att.zStrength = 0;
          att.radius = 20;
          att.pos = pos;
          att.enabled = true;
          att.attractsParticles = true;
        }

        for (let j=0; j<4; j++) {
          if (i == j) continue;

          const angle = calculate2dAngle(z.mAttractModeBlackHoles[j].getPos(), z.mAttractModeBlackHoles[i].getPos());
          let distance = calculate2dDistance(z.mAttractModeBlackHoles[j].getPos(), z.mAttractModeBlackHoles[i].getPos());

          const strength = 8;
          if (distance < z.mAttractModeBlackHoles[i].getRadius()) {
            distance = z.mAttractModeBlackHoles[i].getRadius();
          }

          const r = 1.0/(distance*distance);

          // Add a slight curving vector to the gravity
          const gravityVector = new Point3d(r * strength, 0, 0);
          const g = rotate2dPoint(gravityVector, angle+.4);

          const speed = z.mAttractModeBlackHoles[j].getDrift();
          speed.x += g.x;
          speed.y += g.y;
          z.mAttractModeBlackHoles[j].setDrift(speed);
        }

        let heading;
        if ((Math.random() * 40) < 1) {
          // Pick a random direction
          const variation = 1.5;
          heading + Math.random() * (2*PI);
        }

        // Change direction when we hit the grid edges

        const mSpeed = z.mAttractModeBlackHoles[i].getDrift();
        const mPos = z.mAttractModeBlackHoles[i].getPos();

        const leftEdge = 2;
        const bottomEdge = 2;
        const rightEdge = (sizex - 2)-1;
        const topEdge = (sizey - 2)-1;

        let hitEdge = false;
        if (mPos.x <= leftEdge) {
          mSpeed.x = -mSpeed.x;
          mPos.x = leftEdge;
        } else if (mPos.x >= rightEdge) {
          mSpeed.x = -mSpeed.x;
          mPos.x = rightEdge;
        }
        if (mPos.y <= bottomEdge) {
          mSpeed.y = -mSpeed.y;
          mPos.y = bottomEdge;
        } else if (mPos.y >= topEdge) {
          mSpeed.y = -mSpeed.y;
          mPos.y = topEdge;
        }

        z.mAttractModeBlackHoles[i].setDrift(mSpeed);
        z.mAttractModeBlackHoles[i].setPos(mPos);
      }

      // Fireworks display
      //let fw = 0;
      let colorTimer = 0;
      for(let fw=0;fw<4;fw++) {
        
        colorTimer += .08;

        const pos = new Point3d(Math.random() * sizex, Math.random() * sizey);

        const angle = new Point3d(0, 0, 0);
        //const speed = -.0200;//(mathutils::frandFrom0To1() * 5);
        const speed = 2;//(mathutils::frandFrom0To1() * 5);
        const spread = (2*PI);
        const num = 50;//(mathutils::frandFrom0To1() * 50);
        const timeToLive = 1000;        
        const r = Math.sin(colorTimer+((2*PI)/1)) + .1;
        const g = Math.sin(colorTimer+((2*PI)/2)) + .1;
        const b = Math.sin(colorTimer+((2*PI)/3)) + .1;
        const pen1 = new pen(r, g, b, 1, 4);
        this.mParticles.emitter(pos, angle, speed, spread, num, pen1, timeToLive, true, false, .95, true);
      }

    }

    this.mParticles.run();
  }

  draw(pass) {

    glTranslatef(-this.mCamera.mCurrentPos.x, -this.mCamera.mCurrentPos.y, -this.mCamera.mCurrentPos.z);

    glDisable(GL_MULTISAMPLE);
    glDisable(GL_LINE_SMOOTH);

    // Grid
    this.mGrid.draw();

    glDisable(GL_MULTISAMPLE);
    glDisable(GL_LINE_SMOOTH);

    // Particles
    if (pass === RENDERPASS_PRIMARY) {
      glLineWidth(4);
      this.mParticles.draw();
    } else {
      glLineWidth(8);
      this.mParticles.draw();
    }

    // Enemies
    if (this.mGameMode == GAMEMODE_PLAYING) {
      glLineWidth(4);
      this.mEnemies.draw();
    } 

    // Players
    if (this.mGameMode == GAMEMODE_PLAYING 
      || this.mGameMode == GAMEMODE_CHANGINGLEVELS 
      || this.mGameMode == GAMEOVER_LEVELCOMPLETE
    ) {
      glLineWidth(4);
      glPointSize(2);
      this.mPlayers.draw();        
    }

    if ((this.mGameMode == GAMEMODE_CHANGINGLEVELS) && (pass === RENDERPASS_PRIMARY)) {
      this.mHyperspace.draw();
    }

    glDisable(GL_LINE_SMOOTH);
    glDisable(GL_MULTISAMPLE);

    // Stars
    if (pass === RENDERPASS_PRIMARY) {
      this.mStars.draw();
    }

    // Bombs
    glLineWidth(4);
    this.mBomb.draw();

    //glEnable(GL_MULTISAMPLE);
    //glEnable(GL_LINE_SMOOTH);

    // Point displays
    //glLineWidth(4);
    //this.drawPointDisplays();

    //glDisable(GL_MULTISAMPLE);
    //glDisable(GL_LINE_SMOOTH);
  }

  startGame(numPlayers) {

    music_play(this.music, true);

    this.mPlayers.setEnemies(this.mEnemies);
    this.mPlayers.mPlayer1.setGame(this);
    this.mPlayers.mPlayer1.setEnemies(this.mEnemies);
    this.mPlayers.mPlayer1.setBomb(this.mBomb);
    this.mPlayers.mPlayer1.setParticles(this.mParticles);

    this.mNumPlayers = numPlayers;

    this.mCamera.center();

    this.mLevel = 0;

    this.mGrid.startLevel(this.mLevel);

    this.mSkillLevel = 0;

    this.mSpawner.init();

    if (this.mNumPlayers == 1) {
        // Fire up player 1
        this.mPlayers.mPlayer1.initPlayerForGame();
    }
    /*else
    {
        // Fire up both players
        this.mPlayers.mPlayer1.initPlayerForGame();
        this.mPlayers.mPlayer2.initPlayerForGame();

        // Shared lives and bombs
        this.m2PlayerNumLives = 5;
        this.m2PlayerNumBombs = 0;
    }*/

    this.mGameMode = GAMEMODE_PLAYING;

    this.mMusicSpeed = 1;
    this.mMusicSpeedTarget = 1;

    this.mCameraLevelZoom = 1;

    this.mLevelStartWaitTimer = 200;

    this.mWeaponChangeTimer = 0;

    this.mLevelAdvanceCounter = 0;
    this.mLevelComplete = false;

    this.mParticles.killAll();

    console.log('START GAME', this)
  }

  endGame() {

    console.log('END GAME')
    // Doesn't actually end the game, just does some work that happens after the last player life is used

    //this.mSound.stopAllTracks();

    //this.mSound.playTrack(SOUNDID_PLAYERDEAD);
    //this.mSound.playTrack(SOUNDID_MENU_MUSICLOOP);

    this.mCamera.center();

    // Kill all players
    this.mPlayers.mPlayer1.setState(ENTITY_STATE_INACTIVE);
    this.mPlayers.mPlayer2.setState(ENTITY_STATE_INACTIVE);

    // Kill all enemies
    this.mEnemies.disableAllEnemies();

    // Fade out the grid
    this.mGrid.endLevel();
  }

  showMessageAtLocation(message, pos, pen) {}

  runPointDisplays() {
    for (let i=0; i<NUM_POINT_DISPLAYS; i++) {
      if (this.mPointDisplays[i].enabled) {
        this.mPointDisplays[i].timer--;
        if (this.mPointDisplays[i].timer <= 0) {
          this.mPointDisplays[i].enabled = false;
        }
      }
    }
  }

  drawPointDisplays() {}

  clearPointDisplays() {
    for (let i=0; i<NUM_POINT_DISPLAYS; i++) {
      this.mPointDisplays[i].enabled = false;
    }
  }

  incrementLevelComplete() {
    const threshold = 100 * this.mNumPlayers;

    ++this.mLevelAdvanceCounter;
    if (this.mLevelAdvanceCounter >= threshold) {
      //this.mLevelComplete = true;
      this.doLevelComplete();
    }
  }

  doLevelComplete() {
    this.mLevelComplete = false;
    this.mLevelAdvanceCounter = 0;

    this.mLevelChangeTimer = 0;
    this.mGameMode = GAMEOVER_LEVELCOMPLETE;
    //this.mSound.stopAllTracksBut(SOUNDID_MUSICLOOP);

    //this.mSound.playTrack(SOUNDID_LEVELCHANGE);

    // Add the bonus
    this.mPlayers.mPlayer1.addPointsNoMultiplier(this.mPlayers.mPlayer1.getGeoms() * 10);
    this.mPlayers.mPlayer2.addPointsNoMultiplier(this.mPlayers.mPlayer2.getGeoms() * 10);

    this.mWeaponChangeTimer = 0;
    this.mPlayers.mPlayer1.switchWeapons();
    this.mPlayers.mPlayer2.switchWeapons();

    this.mSpawner.clearWaveListEntities();

    this.mHyperspace.mTargetBrightness = 1;
  }

  advanceLevel() {
    ++this.mLevel;
    this.clearPointDisplays();
    this.mGrid.endLevel();
    this.mLevelChangeTimer = 0;
    this.mLevelStartWaitTimer = 400;
    this.mGameMode = GAMEMODE_CHANGINGLEVELS;
  }
}
