
import {
  ENTITY_TYPE_UNDEF,
  ENTITY_TYPE_BLACKHOLE,
  ENTITY_TYPE_WANDERER,
  ENTITY_TYPE_GRUNT,
  ENTITY_TYPE_SPINNER,
  ENTITY_TYPE_TINYSPINNER,
  ENTITY_TYPE_WEAVER,
  ENTITY_TYPE_SNAKE,
  ENTITY_TYPE_MAYFLY,
  ENTITY_TYPE_PROTON,
  ENTITY_TYPE_GEOM_SMALL,
  ENTITY_TYPE_GEOM_MEDIUM,
  ENTITY_TYPE_GEOM_LARGE,
  ENTITY_TYPE_LINE,
  ENTITY_STATE_INACTIVE,
  ENTITY_STATE_SPAWN_TRANSITION,
  ENTITY_STATE_SPAWNING,
  ENTITY_STATE_RUN_TRANSITION,
  ENTITY_STATE_RUNNING,
  ENTITY_STATE_DESTROY_TRANSITION,
  ENTITY_STATE_DESTROYED,
  ENTITY_STATE_INDICATE_TRANSITION,
  ENTITY_STATE_INDICATING
} from "./entity"
import { createEntity } from "./createEntity"
import { calculate2dAngle, rotate2dPoint, calculate2dDistance } from "./mathutils"
import { Point3d } from "./point3d"
import { linkedList } from "./linkedList"

//const NUM_ENEMIES  = 1100;
const NUM_ENEMIES  = 1092;
const NUM_LINES    = 250;

export class enemies {

  constructor(players, particles) {
    const z = this;

    let entity = 0;

    z.mPlayers = players;
    z.mParticles = particles;

    z.mEnemies = [];
    z.mLines = [];

    z.mActiveEnemies = new linkedList();

    // Wanders

    z.idxWandererStart = entity;

    let num = 100;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_WANDERER, z.mPlayers, z));
    }

    z.idxWandererEnd = entity-1;

    // Grunts
    
    z.idxGruntStart = entity;

    num = 100;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_GRUNT, z.mPlayers, z));
    }

    z.idxGruntEnd = entity-1;

    // Spinners

    z.idxSpinnerStart = entity;

    num = 25;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_SPINNER, z.mPlayers, z));
    }

    z.idxSpinnerEnd = entity-1;

    // Tiny Spinners

    z.idxTinySpinnerStart = entity;

    num = 50;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_TINYSPINNER, z.mPlayers, z));
    }

    z.idxTinySpinnerEnd = entity-1;

    // Weavers

    z.idxWeaverStart = entity;

    num = 100;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_WEAVER, z.mPlayers, z));
    }

    z.idxWeaverEnd = entity-1;

    // Snakes

    z.idxSnakeStart = entity;

    num = 50;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_SNAKE, z.mPlayers, z));
    }

    z.idxSnakeEnd = entity-1;

    // Black holes

    /*z.idxBlackHoleStart = entity;

    num = 8;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_BLACKHOLE, z.mPlayers, z));
    }

    z.idxBlackHoleEnd = entity-1;*/

    // Mayflies

    z.idxMayflyStart = entity;

    num = 200;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_MAYFLY, z.mPlayers, z));
    }

    z.idxMayflyEnd = entity-1;

    // Protons

    z.idxProtonStart = entity;

    num = 200;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_PROTON, z.mPlayers, z));
    }

    z.idxProtonEnd = entity-1;

    // Geoms

    z.idxGeomSmallStart = entity;

    num = 100;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_GEOM_SMALL, z.mPlayers, z));
    }

    z.idxGeomSmallEnd = entity-1;

    z.idxGeomMediumStart = entity;

    num = 100;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_GEOM_MEDIUM, z.mPlayers, z));
    }

    z.idxGeomMediumEnd = entity-1;

    z.idxGeomLargeStart = entity;

    num = 100;
    for (let i=0; i<num; i++) {
      entity++;
      z.mEnemies.push(createEntity(ENTITY_TYPE_GEOM_LARGE, z.mPlayers, z));
    }

    z.idxGeomLargeEnd = entity-1;

    // Fill the rest of the list with empty entries
    for (let i=entity; i<NUM_ENEMIES; i++) {
      z.mEnemies[i] = createEntity(ENTITY_TYPE_UNDEF);
    }

    for (let i=0; i<NUM_LINES; i++) {
      z.mLines[i] = createEntity(ENTITY_TYPE_LINE);
    }
  }

  run() {
    const z = this;

    // Run each enemy
    for (let i=0; i<NUM_ENEMIES; i++) {
      switch(z.mEnemies[i].getState()) {
        case ENTITY_STATE_SPAWN_TRANSITION:
          z.mActiveEnemies.add(z.mEnemies[i]);
          z.mEnemies[i].spawnTransition();
          break;
        case ENTITY_STATE_SPAWNING:
          z.mEnemies[i].spawn();
          break;
        case ENTITY_STATE_RUN_TRANSITION:
          z.mEnemies[i].runTransition();
          break;
        case ENTITY_STATE_RUNNING:
          z.mEnemies[i].run();
          break;
        case ENTITY_STATE_DESTROY_TRANSITION:
          z.mActiveEnemies.remove(z.mEnemies[i]);
          z.mEnemies[i].destroyTransition();
          break;
        case ENTITY_STATE_DESTROYED:
          z.mEnemies[i].destroy();
          break;
        case ENTITY_STATE_INDICATE_TRANSITION:
          z.mEnemies[i].indicateTransition();
          break;
        case ENTITY_STATE_INDICATING:
          z.mEnemies[i].indicating();
          break;
      }
    }

    // Run each line
    for (let i=0; i<NUM_LINES; i++) {
      switch(z.mLines[i].getState()) {
        case ENTITY_STATE_SPAWN_TRANSITION:
          z.mLines[i].spawnTransition();
          break;
        case ENTITY_STATE_SPAWNING:
          z.mLines[i].spawn();
          break;
        case ENTITY_STATE_RUN_TRANSITION:
          z.mLines[i].runTransition();
          break;
        case ENTITY_STATE_RUNNING:
          z.mLines[i].run();
          break;
        case ENTITY_STATE_DESTROY_TRANSITION:
          z.mLines[i].destroyTransition();
          break;
        case ENTITY_STATE_DESTROYED:
          z.mLines[i].destroy();
          break;
      }
    }

    // Keep the entities separated
    for (let i=0; i<NUM_ENEMIES; i++) {
      if ((z.mEnemies[i].getType() != ENTITY_TYPE_GEOM_SMALL)
        && (z.mEnemies[i].getType() != ENTITY_TYPE_GEOM_MEDIUM)
        && (z.mEnemies[i].getType() != ENTITY_TYPE_GEOM_LARGE))
      {
        if (z.mEnemies[i].getState() == ENTITY_STATE_RUNNING) {
          for (let j=0; j<NUM_ENEMIES; j++) {
            if (z.mEnemies[j].getState() == ENTITY_STATE_RUNNING) {
              if (j != i) {
                const e1 = z.mEnemies[i];
                const e2 = z.mEnemies[j];
                const distance = calculate2dDistance(e1.getPos(), e2.getPos());
                const totalRadius = e1.getRadius() + e2.getRadius();
                if (distance < totalRadius) {
                  // Nudge each away from each other
                  const angle = calculate2dAngle(e2.getPos(), e1.getPos());
                  let vector = new Point3d(1,0,0);
                  vector = rotate2dPoint(vector, angle);
                  if (e1.getType() == ENTITY_TYPE_BLACKHOLE) {
                    const blackHole = e1;
                    if (blackHole) {
                      if (blackHole.mActivated) {                        
                        e1.setSpeed(e1.getSpeed().add(vector).multiply(.2));
                      }
                    }
                  }
                  else {                 
                    e1.setPos(e1.getPos().add(vector).multiply(.02));
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  draw() {
    const z = this;

    for (let i=0; i<NUM_ENEMIES; i++) {
      if (z.mEnemies[i].getEnabled()) {
        z.mEnemies[i].draw();
      }
    }
    for (let i=0; i<NUM_LINES; i++) {
      if (z.mLines[i].getEnabled()) {
        z.mLines[i].draw();
      }
    }
  }

  // this function is extremely slow!!!!
  hitTestEnemiesAtPosition(point, radius, includeSpawning) {

    includeSpawning = false; // I don't like this anymore

    let current = this.mActiveEnemies.start;
    while (current !== null) {
      //console.log(current)
      if ((current.data.getState() === ENTITY_STATE_RUNNING)
        || (includeSpawning && (current.data.getState() == ENTITY_STATE_SPAWNING) && (current.data.getType() != ENTITY_TYPE_BLACKHOLE)))
      {
        const e = current.data.hitTest(point, radius);
        if (e) {
          return e;
        }
      }
      current = current.next;
    }

    return null;
  }  

  getNumActiveEnemiesOfType(type) {
    const z = this;

    let idxStart;
    let idxEnd;

    switch (type) {
      case ENTITY_TYPE_WANDERER:
        idxStart = z.idxWandererStart;
        idxEnd = z.idxWandererEnd;
        break;
      case ENTITY_TYPE_GRUNT:
        idxStart = z.idxGruntStart;
        idxEnd = z.idxGruntEnd;
        break;
      case ENTITY_TYPE_SPINNER:
        idxStart = z.idxSpinnerStart;
        idxEnd = z.idxSpinnerEnd;
        break;
      case ENTITY_TYPE_TINYSPINNER:
        idxStart = z.idxTinySpinnerStart;
        idxEnd = z.idxTinySpinnerEnd;
        break;
      case ENTITY_TYPE_WEAVER:
        idxStart = z.idxWeaverStart;
        idxEnd = z.idxWeaverEnd;
        break;
      case ENTITY_TYPE_SNAKE:
        idxStart = z.idxSnakeStart;
        idxEnd = z.idxSnakeEnd;
        break;
      case ENTITY_TYPE_BLACKHOLE:
        idxStart = z.idxBlackHoleStart;
        idxEnd = z.idxBlackHoleEnd;
        break;
      case ENTITY_TYPE_MAYFLY:
        idxStart = z.idxMayflyStart;
        idxEnd = z.idxMayflyEnd;
        break;
      case ENTITY_TYPE_PROTON:
        idxStart = idxProtonStart;
        idxEnd = idxProtonEnd;
        break;
      case ENTITY_TYPE_GEOM_SMALL:
        idxStart = z.idxGeomSmallStart;
        idxEnd = z.idxGeomSmallEnd;
        break;
      case ENTITY_TYPE_GEOM_MEDIUM:
        idxStart = z.idxGeomMediumStart;
        idxEnd = z.idxGeomMediumEnd;
        break;
      case ENTITY_TYPE_GEOM_LARGE:
        idxStart = z.idxGeomLargeStart;
        idxEnd = z.idxGeomLargeEnd;
        break;
    }

    let count = 0;
    for (let i=idxStart; i<=idxEnd; i++) {
      if (z.mEnemies[i].getState() !== ENTITY_STATE_INACTIVE) {
        ++count;
      }
    }

    return count;
  }

  getUnusedEnemyOfType(type) {
    const z = this;

    let idxStart;
    let idxEnd;

    switch (type) {
      case ENTITY_TYPE_WANDERER:
        idxStart = z.idxWandererStart;
        idxEnd = z.idxWandererEnd;
        break;
      case ENTITY_TYPE_GRUNT:
        idxStart = z.idxGruntStart;
        idxEnd = z.idxGruntEnd;
        break;
      case ENTITY_TYPE_SPINNER:
        idxStart = z.idxSpinnerStart;
        idxEnd = z.idxSpinnerEnd;
        break;
      case ENTITY_TYPE_TINYSPINNER:
        idxStart = z.idxTinySpinnerStart;
        idxEnd = z.idxTinySpinnerEnd;
        break;
      case ENTITY_TYPE_WEAVER:
        idxStart = z.idxWeaverStart;
        idxEnd = z.idxWeaverEnd;
        break;
      case ENTITY_TYPE_SNAKE:
        idxStart = z.idxSnakeStart;
        idxEnd = z.idxSnakeEnd;
        break;
      case ENTITY_TYPE_BLACKHOLE:
        idxStart = z.idxBlackHoleStart;
        idxEnd = z.idxBlackHoleEnd;
        break;
      case ENTITY_TYPE_MAYFLY:
        idxStart = z.idxMayflyStart;
        idxEnd = z.idxMayflyEnd;
        break;
      case ENTITY_TYPE_PROTON:
        idxStart = z.idxProtonStart;
        idxEnd = z.idxProtonEnd;
        break;
      case ENTITY_TYPE_GEOM_SMALL:
        idxStart = z.idxGeomSmallStart;
        idxEnd = z.idxGeomSmallEnd;
        break;
      case ENTITY_TYPE_GEOM_MEDIUM:
        idxStart = z.idxGeomMediumStart;
        idxEnd = z.idxGeomMediumEnd;
        break;
      case ENTITY_TYPE_GEOM_LARGE:
        idxStart = z.idxGeomLargeStart;
        idxEnd = z.idxGeomLargeEnd;
        break;
    }

    for (let i=idxStart; i<=idxEnd; i++) {
      if (z.mEnemies[i].getState() === ENTITY_STATE_INACTIVE) {
        return z.mEnemies[i];
      }
    }

    return null;
  }

  getUnusedLine() {
    const z = this;
    for (let i=0; i<NUM_LINES; i++) {
      if (z.mLines[i].getState() === ENTITY_STATE_INACTIVE) {
        return z.mLines[i];
      }
    }
    return null;
  }

  explodeEntity(e) {
    const z = this;

    const m = e.getModel();

    let objectPos1 = new Point3d(0,0,0);
    let objectPos = new Point3d(0,0,0);
    m.mMatrix.TransformVertex(objectPos1, objectPos);

    const numEdges = m.mNumEdges;
    for (let i=0; i<numEdges; i++) {
      const line = z.getUnusedLine();
      if (line) {
        const pen1 = e.getPen();
        //pen1.r *= 1.2;
        //pen1.g *= 1.2;
        //pen1.b *= 1.2;
        //pen1.a *= 1.2;
        line.setPen(pen1);

        const from = m.mVertexList[m.mEdgeList[i].from];
        const to = m.mVertexList[m.mEdgeList[i].to];
        const midpoint = new Point3d((from.x + to.x) / 2, (from.y + to.y) / 2, 0);

        line.addEndpoints(from, to);
        line.setPos(objectPos);
        line.setScale(e.getScale());
        line.setAngle(e.getAngle());

        let angle = calculate2dAngle(new Point3d(0,0,0), midpoint);

        const variation = (Math.random() * 2) - 1;

        let speedVector = new Point3d(0,.2,0);
        speedVector = rotate2dPoint(speedVector, angle + variation);

        speedVector.add(e.getDrift().multiply(.1));

        line.setSpeed(speedVector);
        line.setState(ENTITY_STATE_SPAWN_TRANSITION);
        return;
      }
    }
  }

  disableAllEnemies() {
    const z = this;
    for (let i=0; i<NUM_ENEMIES; i++) {
      z.mEnemies[i].setState(ENTITY_STATE_INACTIVE);
      z.mEnemies[i].incGenId();
    }
  }  
}
