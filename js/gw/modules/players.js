
import { 
  ENTITY_STATE_INACTIVE,
  ENTITY_STATE_INDICATING,
  ENTITY_STATE_INDICATE_TRANSITION,
  ENTITY_STATE_SPAWN_TRANSITION,
  ENTITY_STATE_SPAWNING,
  ENTITY_STATE_RUN_TRANSITION,
  ENTITY_STATE_RUNNING,
  ENTITY_STATE_DESTROY_TRANSITION,
  ENTITY_STATE_DESTROYED
} from "./entity"
import { entityPlayer1 } from "./entityPlayer1"
import { entityPlayer2 } from "./entityPlayer2"
import { calculate2dDistance } from "./mathutils"
import { NUM_ENEMIES } from "./enemies"

export class players {

  constructor(attractor, grid) {    

    this.mPlayer1 = new entityPlayer1(attractor, grid);
    this.mPlayer1.setState(ENTITY_STATE_INACTIVE);

    this.mNumPlayers = 1;
    this.mGrid = grid;

    //this.mPlayer2 = new entityPlayer2();
    //this.mPlayer2.setState(ENTITY_STATE_INACTIVE);
  }

  setEnemies(enemies) {
    this.mEnemies = enemies;
  }

  run() {

    let z = this;

    let currentPlayer = this.mPlayer1;

    currentPlayer.runMissiles();

    switch(currentPlayer.getState()) {
      case ENTITY_STATE_INACTIVE || ENTITY_STATE_SPAWN_TRANSITION:
        currentPlayer.spawnTransition();
        break;
      case ENTITY_STATE_SPAWNING:
        currentPlayer.spawn();
        break;
      case ENTITY_STATE_RUN_TRANSITION:
        currentPlayer.runTransition();
        break;
      case ENTITY_STATE_RUNNING:
        currentPlayer.run();

        // Hit test the players against the enemies
        let enemy = z.mEnemies.hitTestEnemiesAtPosition(currentPlayer.getPos(), currentPlayer.getRadius()*.75);
        if (enemy) {
          enemy = enemy.getParent();

          if (currentPlayer.shields()) {
            // We hit an enemy with shields still on
            enemy.hit(currentPlayer);
          } else {
            // We hit an enemy

            // Destroy the player
            currentPlayer.setState(ENTITY_STATE_DESTROY_TRANSITION);

            // Set the enemy we hit to "indicate"
            enemy.setState(ENTITY_STATE_INDICATE_TRANSITION);
            enemy.incGenId();

            // Destroy all the other enemies
            if ((z.mNumPlayers == 1) || (z.mNumPlayers == 2 && z.m2PlayerNumLives <= 1)) {
              for (let i=0; i<NUM_ENEMIES; i++) {
                if ((z.mEnemies.mEnemies[i].getState() !== ENTITY_STATE_INACTIVE)
                  && (z.mEnemies.mEnemies[i].getState() !== ENTITY_STATE_INDICATING)
                  && (z.mEnemies.mEnemies[i].getState() !== ENTITY_STATE_INDICATE_TRANSITION))
                {
                  z.mEnemies.mEnemies[i].hit(null);
                  z.mEnemies.mEnemies[i].incGenId();
                }
              }
            }
          }
        }

        break;
      case ENTITY_STATE_DESTROY_TRANSITION:
        currentPlayer.destroyTransition();
        break;
      case ENTITY_STATE_DESTROYED:
        currentPlayer.destroy();
        break;
    }
  }

  draw() {
    this.mPlayer1.draw();
    //this.mPlayer2.draw();
  }

  getPlayerClosestToPosition()  {
    const z = this;
    if (z.mNumPlayers == 1) {
      return z.mPlayer1;
    } else {
      if (z.mPlayer1.getEnabled() && z.mPlayer2.getEnabled()) {
        const distance1 = calculate2dDistance(point, z.mPlayers.mPlayer1.getPos());
        const distance2 = calculate2dDistance(point, z.mPlayers.mPlayer2.getPos());
        return (distance1 < distance2) ? mPlayer1 : mPlayer2;
      } else if (z.mPlayer2.getEnabled()) {
        return z.mPlayer2;
      } else {
        return z.mPlayer1;
      }
    }
  }
}
