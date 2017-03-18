
import { 
  entity,
  ENTITY_TYPE_PLAYER1,
  ENTITY_TYPE_PLAYER2,
  ENTITY_TYPE_PLAYER_MISSILE,
  ENTITY_TYPE_GRUNT,
  ENTITY_TYPE_WANDERER,
  ENTITY_TYPE_WEAVER,
  ENTITY_TYPE_SPINNER,
  ENTITY_TYPE_TINYSPINNER,
  ENTITY_TYPE_MAYFLY,
  ENTITY_TYPE_SNAKE,
  ENTITY_TYPE_BLACKHOLE,
  ENTITY_TYPE_PROTON,
  ENTITY_TYPE_GEOM_SMALL,
  ENTITY_TYPE_GEOM_MEDIUM,
  ENTITY_TYPE_GEOM_LARGE,
  ENTITY_TYPE_LINE
} from "./entity"

import { entityPlayer1 } from "./entityPlayer1"
import { entityPlayer2 } from "./entityPlayer2"
import { entityPlayerMissile } from "./entityPlayerMissile"
import { entityGrunt } from "./entityGrunt"
import { entityWanderer } from "./entityWanderer"
import { entityWeaver } from "./entityWeaver"
import { entitySpinner } from "./entitySpinner"
import { entityTinySpinner } from "./entityTinySpinner"
import { entityMayfly } from "./entityMayfly"
import { entitySnake } from "./entitySnake"
import { entityBlackHole } from "./entityBlackHole"
import { entityProton } from "./entityProton"
import { entityGeomSmall } from "./entityGeomSmall"
import { entityGeomMedium } from "./entityGeomMedium"
import { entityGeomLarge } from "./entityGeomLarge"
import { entityLine } from "./entityLine"

export const createEntity = (_entity, players, enemies) => {

  switch(_entity) {
    case ENTITY_TYPE_PLAYER1:
      return new entityPlayer1();
    case ENTITY_TYPE_PLAYER2:
      return new entityPlayer2();
    case ENTITY_TYPE_PLAYER_MISSILE:
      return new entityPlayerMissile();
    case ENTITY_TYPE_GRUNT:
      return new entityGrunt(players, enemies);
    case ENTITY_TYPE_WANDERER:
      return new entityWanderer(players, enemies);
    case ENTITY_TYPE_WEAVER:
      return new entityWeaver(players, enemies);
    case ENTITY_TYPE_SPINNER:
      return new entitySpinner(players, enemies);
    case ENTITY_TYPE_TINYSPINNER:
      return new entityTinySpinner(players, enemies);
    case ENTITY_TYPE_MAYFLY:
      return new entityMayfly(players, enemies);
    case ENTITY_TYPE_SNAKE:
      return new entitySnake(players, enemies);
    case ENTITY_TYPE_BLACKHOLE:
      return new entityBlackHole(players, enemies);
    case ENTITY_TYPE_PROTON:
      return new entityProton(players, enemies);
    case ENTITY_TYPE_GEOM_SMALL:
      return new entityGeomSmall(players, enemies);
    case ENTITY_TYPE_GEOM_MEDIUM:
      return new entityGeomMedium(players, enemies);
    case ENTITY_TYPE_GEOM_LARGE:
      return new entityGeomLarge(players, enemies);
    case ENTITY_TYPE_LINE:
      return new entityLine();
    default:
      return new entity();
  }

  return 0;
}
