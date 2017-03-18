
import { 
  ENTITY_TYPE_UNDEF,
  ENTITY_TYPE_BLACKHOLE,
  ENTITY_TYPE_WANDERER,
  ENTITY_TYPE_GRUNT,
  ENTITY_TYPE_SPINNER,
  ENTITY_TYPE_WEAVER,
  ENTITY_TYPE_SNAKE,
  ENTITY_TYPE_MAYFLY,
  ENTITY_STATE_SPAWN_TRANSITION,
  ENTITY_STATE_INACTIVE
} from "./entity"
import { calculate2dDistance } from "./mathutils"
import { Point3d } from "./point3d"
import { GAMEMODE_GAMEOVER_TRANSITION } from "./game"

const NUM_WAVELIST        = 200;
const MIN_SPAWN_DISTANCE  = 30;
const MAX_SPAWNLIST_ITEMS = 50;

const WAVETYPE_UNUSED = 0;
const WAVETYPE_SWARM  = 1;
const WAVETYPE_RUSH   = 2;

class WaveListItem {
  constructor() {
    this.e = null;
    this.genId = -1;
  }
}

export class spawner {

  constructor(players, enemies, grid) {
    this.mNumPlayers = 1;
    this.mPlayers = players;    
    this.mEnemies = enemies;
    this.mGrid = grid;
    this.mWaveList = [];
    for (let i=0; i<NUM_WAVELIST; i++) {
      this.mWaveList.push(new WaveListItem())
    }
    this.clearWaveListEntities();
  }

  init() {    

    this.mSpawnIndex = 0;
    this.mLastSpawnIndex = 0;

    this.mSpawnCheckTimer = 100;

    this.mWaveIntervalTimer = 0;
    this.mWaveStartTimer = 0;
    this.mWaveEntityCounter = 0;
    this.mWaveEntity = ENTITY_TYPE_UNDEF;
    this.mWaveType = WAVETYPE_SWARM;

    this.clearWaveListEntities();
    this.transition();
  }  

  getSpawnIndex() {
    return Math.floor(this.mSpawnIndex);
  }

  run() {
    const z = this;

    // Update our spawn index    
    z.mSpawnIndex += .002;
    if (z.mSpawnIndex > 15) z.mSpawnIndex = 15;
    if (z.getSpawnIndex() > z.mLastSpawnIndex) {
      z.mLastSpawnIndex = z.getSpawnIndex();
      z.transition();
    }

    // Keep things simple for the first level
    if (z.mLevel == 0) {
      if (mSpawnIndex > 1) {
        mSpawnIndex = 1;
      }
    }

    // Update player 1 and player 2
    let player1SpawnTimer = 0;
    let player2SpawnTimer = 0;
    let numPlayersActive = 0;

    // Monitor Player1 and respawn as needed
    if (z.mPlayers.mPlayer1.getState() === ENTITY_STATE_INACTIVE) {
      //console.log('SPAWNER PLAYER INACTIVE')
      //if (++player1SpawnTimer >= 50) {
        player1SpawnTimer = 0;

        if (z.mPlayers.mPlayer1.getNumLives() > 0) {
          z.mPlayers.mPlayer1.takeLife();
          if (z.mPlayers.mPlayer1.getNumLives() > 0) {
            //console.log('SPAWN TRANSITION')
            z.mPlayers.mPlayer1.setState(ENTITY_STATE_SPAWN_TRANSITION);
          } else {
            //console.log('GAME OVER')
            // else game over
            z.mGameMode = GAMEMODE_GAMEOVER_TRANSITION;
          }
        } else  {
          //console.log('GAME OVER')
          // else game over
          z.mGameMode = GAMEMODE_GAMEOVER_TRANSITION;
        }
      //}
    } else {
      ++numPlayersActive;
    }

    //console.log(numPlayersActive, z.mNumPlayers)

    if (numPlayersActive == z.mNumPlayers) {

      // Randomly spawn enemies here and there
      let index = z.getSpawnIndex();

      if (++z.mSpawnCheckTimer > 100) {

        //console.log('SPAWN ENEMIES')

        z.mSpawnCheckTimer = 0;

        //z.spawnEntities(ENTITY_TYPE_MAYFLY, 2);  
        //z.spawnEntities(ENTITY_TYPE_WANDERER, 2);
        //z.spawnEntities(ENTITY_TYPE_GRUNT, 2); // works
        //z.spawnEntities(ENTITY_TYPE_SPINNER, 2);  // works 
        //z.spawnEntities(ENTITY_TYPE_WEAVER, 2); // works
        //z.spawnEntities(ENTITY_TYPE_BLACKHOLE, 2);

                

        // Wanderers
        if (index <= 1)
          z.spawnEntities(ENTITY_TYPE_WANDERER, 2);
        else if (index > 1 && index < 3)
          z.spawnEntities(ENTITY_TYPE_WANDERER, 4);

        // Grunts
        if (index <= 1) {
          z.spawnEntities(ENTITY_TYPE_GRUNT, 2);
        } else if (index > 1) {
          z.spawnEntities(ENTITY_TYPE_GRUNT, 4);
        }

        // Spinners
        if (index >= 1) {
          z.spawnEntities(ENTITY_TYPE_SPINNER, 2);
        }

        // Weavers
        if (index >= 1) {
          z.spawnEntities(ENTITY_TYPE_WEAVER, 2);
        }

        // Black holes
        /*if (index >= 4) {
          if (Math.random() * 100 < 10) {
            z.spawnEntities(ENTITY_TYPE_BLACKHOLE, 1);
          }
        }*/

      }

      z.runWaveListEntities();
      let numWaveEntities = z.numWaveListEntities();

      // Start a wave
      if (numWaveEntities <= 0) {

        if (index >= 2) {

          --z.mWaveStartTimer;
          if (z.mWaveStartTimer < 0) z.mWaveStartTimer = 0;
          if ((z.mWaveStartTimer == 0) && (z.mWaveEntity === ENTITY_TYPE_UNDEF)) {
            z.mWaveStartTimer = 100;

            switch (parseInt(Math.random() * 16), 10) {
              default:
              case 0:
              case 1:
              case 11:
                z.mWaveEntity = ENTITY_TYPE_GRUNT;
                z.mWaveType = WAVETYPE_SWARM;
                z.mWaveEntityCounter = (index >= 10) ? 60 : 40;
                break;
              case 2:
              case 12:
                z.mWaveEntity = ENTITY_TYPE_WEAVER;
                z.mWaveType = WAVETYPE_SWARM;
                z.mWaveEntityCounter = (index >= 10) ? 24 : 12;
                break;
              case 3:
              case 13:
                z.mWaveEntity = ENTITY_TYPE_SNAKE;
                z.mWaveType = WAVETYPE_SWARM;
                z.mWaveEntityCounter = (index >= 10) ? 16 : 8;
                break;
              case 4:
              case 14:
                z.mWaveEntity = ENTITY_TYPE_SPINNER;
                z.mWaveType = WAVETYPE_SWARM;
                z.mWaveEntityCounter = (index >= 10) ? 16 : 8;
                break;
              case 10:
              case 15:
                z.mWaveEntity = ENTITY_TYPE_BLACKHOLE;
                z.mWaveType = WAVETYPE_SWARM;
                z.mWaveEntityCounter = Math.random() * 4;
                break;

              case 5:
                z.mWaveEntity = ENTITY_TYPE_GRUNT;
                z.mWaveType = WAVETYPE_RUSH;
                z.mWaveEntityCounter = 8;
                break;
              case 6:
                z.mWaveEntity = ENTITY_TYPE_WEAVER;
                z.mWaveType = WAVETYPE_RUSH;
                z.mWaveEntityCounter = 8;
                break;
              case 7:
                z.mWaveEntity = ENTITY_TYPE_SNAKE;
                z.mWaveType = WAVETYPE_RUSH;
                z.mWaveEntityCounter = (index >= 10) ? 8 : 4;
                break;
              case 8:
                z.mWaveEntity = ENTITY_TYPE_SPINNER;
                z.mWaveType = WAVETYPE_RUSH;
                z.mWaveEntityCounter = (index >= 10) ? 8 : 4;
                break;

              case 9:
                if (index >= 8) {
                  z.mWaveEntity = ENTITY_TYPE_MAYFLY;
                  z.mWaveType = WAVETYPE_SWARM;
                  z.mWaveEntityCounter = 50;
                }
                break;
            }
          }
        }
      }

      // Run waves
      if (z.mWaveEntity !== ENTITY_TYPE_UNDEF) {
        if (++z.mWaveIntervalTimer > 10) {
          z.mWaveIntervalTimer = 0;
          z.runWaves();
        }
      }

    } else {

      z.mSpawnCheckTimer = 0;

    }

    // Run the mayfly sound loop
    /*if (z.mEnemies.getNumActiveEnemiesOfType(ENTITY_TYPE_MAYFLY) > 0) {
      if (!game::mSound.isTrackPlaying(SOUNDID_MAYFLIES))
        game::mSound.playTrack(SOUNDID_MAYFLIES);
    } else {
      if (game::mSound.isTrackPlaying(SOUNDID_MAYFLIES))
        game::mSound.stopTrack(SOUNDID_MAYFLIES);
    }*/    
  }

  transition() {}

  spawnEntities(type, numWanted) {

    //console.log('SPAWN', type, numWanted)

    const z = this;
    const margin = 15;
    const leftEdge = margin;
    const bottomEdge = margin;
    const rightEdge = (z.mGrid.extentX()-1)-margin;
    const topEdge = (z.mGrid.extentY()-1)-margin;

    let numHave = z.mEnemies.getNumActiveEnemiesOfType(type);
    //console.log(numHave, numWanted)
    if (numHave < numWanted) {
      const enemy = z.mEnemies.getUnusedEnemyOfType(type);
      //console.log(enemy)
      if (enemy) {
        //console.log('*******', enemy)

        // Spawn somewhere random but not too close to the player
        let distance;
        const x = (Math.random() * (rightEdge-leftEdge))+leftEdge;
        const y = (Math.random() * (topEdge-bottomEdge))+bottomEdge;
        const spawnPoint = new Point3d(x,y, 0);

        /*let hitPoint = new Point3d();
        if (z.mGrid.hitTest(spawnPoint, 1, hitPoint))  {
          spawnPoint = hitPoint;
        }*/

        enemy.setPos(spawnPoint);

        // TODO - FIX THIS SO ENEMIES ARE SPAWNED OFF A RADIAL AT A MIN DISTANCE RATHER THAN
        // JUST USING RANDOM XY COORDS ON THE GRID?
        distance = calculate2dDistance(spawnPoint, z.mPlayers.mPlayer1.getPos());

        enemy.setState(ENTITY_STATE_SPAWN_TRANSITION);
      }
    }
  }

  runWaves() {
    const z = this;

    if (z.mWaveEntity !== ENTITY_TYPE_UNDEF) {

      const margin = 2;
      let leftEdge = margin;
      const bottomEdge = margin;
      const rightEdge = (z.mGrid.extentX()-1)-margin;
      const topEdge = (z.mGrid.extentY()-1)-margin;

      if (z.mWaveType == WAVETYPE_RUSH) {

      } else {

        let corner = 0;

        for (let i=0; i<4; i++) {
          
          if (z.mWaveEntityCounter > 0) {

            const enemy = z.mEnemies.getUnusedEnemyOfType(z.mWaveEntity);
            if (enemy) {

              z.addToWaveList(enemy);

              let rx = (Math.random() * 10)-5;
              let ry = (Math.random() * 10)-5;

              let spawnPoint = new Point3d();
              spawnPoint.x = 50;
              spawnPoint.y = 50;              

              /*switch (corner%4) {
                case 0:
                  spawnPoint = new Point3d(leftEdge+rx, topEdge+ry);
                  break;
                case 1:
                  spawnPoint = new Point3d(rightEdge+rx, topEdge+ry);
                  break;
                case 2:
                  spawnPoint = new Point3d(rightEdge+rx, bottomEdge+ry);
                  break;
                case 3:
                  spawnPoint = new Point3d(leftEdge+rx, bottomEdge+ry);
                  break;
              }*/

              let radius = enemy.getRadius();

              if (z.mWaveEntity == ENTITY_TYPE_BLACKHOLE) {
                radius = 20;
              }

              const leftEdge = radius;
              const bottomEdge = radius;
              const rightEdge = (z.mGrid.extentX() - radius)-1;
              const topEdge = (z.mGrid.extentY()- radius)-1;

              if (spawnPoint.x < leftEdge) {
                spawnPoint.x = leftEdge;
              } else if (spawnPoint.x > rightEdge) {
                spawnPoint.x = rightEdge;
              }
              if (spawnPoint.y < bottomEdge) {
                spawnPoint.y = bottomEdge;
              } else if (spawnPoint.y > topEdge) {
                spawnPoint.y = topEdge;
              }

              // Keep it on the grid
              let hitPoint = new Point3d();
              if (z.mGrid.hitTest(spawnPoint, 1, hitPoint)) {
                spawnPoint = hitPoint;
              }

              enemy.setPos(spawnPoint);
              enemy.setState(ENTITY_STATE_SPAWN_TRANSITION);
            }

            // Decrease the counter even if we didn't find an available entity
            --z.mWaveEntityCounter;
            if (z.mWaveEntityCounter <= 0) {
              // End the wave
              z.mWaveEntity = ENTITY_TYPE_UNDEF;
            }
          }

          ++corner;
        }
      }
    }
  }

  addToWaveList(e) {
    const z = this;
    for (let i=0; i<NUM_WAVELIST; i++) {
      if (z.mWaveList[i].e == null) {
        z.mWaveList[i].e = e;
        z.mWaveList[i].genId = e.getGenId();
        return;
      }
    }
  }

  numWaveListEntities() {
    const z = this;
    let count = 0;
    for (let i=0; i<NUM_WAVELIST; i++) {
      if (z.mWaveList[i].e && (z.mWaveList[i].e.getGenId() == z.mWaveList[i].genId)) {
        ++count;
      }
    }
    return count;
  }

  runWaveListEntities() {
    const z = this;
    for (let i=0; i<NUM_WAVELIST; i++) {
      if (z.mWaveList[i].e && (z.mWaveList[i].e.getGenId() != z.mWaveList[i].genId)) {
        z.mWaveList[i].e = null;
        z.mWaveList[i].genId = -1;
      }
    }
  }

  clearWaveListEntities() {
    const z = this;
    for (let i=0; i<NUM_WAVELIST; i++) {
      z.mWaveList[i].e = null;
      z.mWaveList[i].genId = -1;
    }
  }  
}
