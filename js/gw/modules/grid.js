
import { glPointSize, glLineWidth, glColor4f, glBegin, glVertex3d, glEnd, GL_LINES, GL_POINTS } from "./webgl"
import { pen } from "./vector"
import { Point3d } from "./point3d"
import { v2d_new } from "./../core/v2d"
import { closestPointOnLineSegment, pointLineDistance, pointInPolygon, isPointOnLine, DegreesToRads, calculate2dAngle, calculate2dDistance, rotate2dPoint } from "./mathutils"
import { MAXINT } from "./defines"

const FADESTATUS_IDLE    = 0;
const FADESTATUS_FADEOUT = 1;
const FADESTATUS_FADEIN  = 2;

const NEW_SHAPE = new Point3d(0,0,1)
const isNewShape = (p) => ((p).z != 0)

const gridxy = (x,y,z) => (z.mGridInfo.grid[(x)+(y)*z.mGridInfo.divsX])

let logonce = false;

class gridPoint {
  constructor(x, y) {
    this.pos = v2d_new(x, y);
    this.vel = 0;
    this.isAnchor = false;
    this.isVisible = false;
  }
}

export class grid {

  constructor(attractor) {
    this.mAttractors = attractor;
    this.mBrightness = 0;
    this.mFadeStatus = FADESTATUS_IDLE;
    this.mLevel = 0;
    this.q = 30;
    this.damping = 2.6;

    this.mGridInfo = {
      grid: null
    }

    //initGrid(game::mLevel);
    this.initGrid(0);
  }

  initGrid(level) {
    const z = this;

    // Delete the previous grid
    if (z.mGridInfo.grid) {
      z.mGridInfo.grid = null;
    }

    const wrap = level >= 14;
    level = level % 14;
    if (wrap && level == 0) level = 1; // wrap around but skip the first level

    const gridIndex = [     
      0,  // Starter grid
      1,  // Larger vertically-oriented rectangle grid
      12, // Lego grid
      13, // X shape
      2,  // Star shaped grid
      4,  // Grid with hole
      11, // Circle
      3,  // + shaped grid
      5,  // Blob with no holes
      8,  // Stamp
      15,  // Second grid with hole
      14, // face shape
      9,  // Starfish
      6,  // Crazy horizontal level with holes
    ];

    const index = gridIndex[level];

    if (index == 0) {
      //
      // Small square starter grid
      //

      const p1 = new Point3d(0, 0);
      const p2 = new Point3d(0, 8);
      const p3 = new Point3d(15, 8);
      const p4 = new Point3d(15, 0);

      const poly = [
        p1,
        p2,
        p3,
          p4,
          p1
      ];

      z.mGridInfo.poly = poly;
      z.mGridInfo.polyPoints = 5;

      // Master scale for the grid and the outline
      z.mGridInfo.scale = 9;
      //z.mGridInfo.scale = 60;

      // Number of grid divisions for this grid
      z.mGridInfo.divsX = 81;
      z.mGridInfo.divsY = 41;

      //z.mGridInfo.divsX = 41;
      //z.mGridInfo.divsY = 21;

      //z.mGridInfo.divsX = 21;
      //z.mGridInfo.divsY = 11;

      z.mGridInfo.brightGridColor = new pen(0.2, 0.2, 1.0, 0.4, 0); 
      z.mGridInfo.dimGridColor = new pen(0.2, 0.2, 1.0, 0.12, 0); 
    }

    z.mGridPointScaleX = 0;
    z.mGridPointScaleY = 0;

    let ex = 0;
    let ey = 0;

    let from = z.mGridInfo.poly[0].copy().multiply(z.mGridInfo.scale);
    for (let i=1; i<z.mGridInfo.polyPoints; i++) {
      const to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
      //console.log(to)

      if (isNewShape(to)) {
        i++;
        from = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
        continue;
      }

      if (from.x > ex) {
          ex = from.x;
      }
      if (to.x > ex) {
          ex = to.x;
      }
      if (from.y > ey) {
          ey = from.y;
      }
      if (to.y > ey) {
          ey = to.y;
      }
      from = to;
    }

    z.mGridExtentX = ex;
    z.mGridExtentY = ey;

    // Scale the grid points properly
    z.mGridPointScaleX = ex / (z.mGridInfo.divsX-1);
    z.mGridPointScaleY = ey / (z.mGridInfo.divsY-1);
    
    // Create the grid points
    z.mGridInfo.grid = [];
    for(let i=0,c=z.mGridInfo.divsX*z.mGridInfo.divsY;i<c;i++) {
      z.mGridInfo.grid.push(new gridPoint());
    }

    // Init the grid points
    for (let y=0; y<z.mGridInfo.divsY; ++y) {
      for (let x=0; x<z.mGridInfo.divsX; ++x) {
        gridxy(x,y,z).pos = new Point3d(x,y,0);
        gridxy(x,y,z).vel = new Point3d(0,0,0);
        gridxy(x,y,z).isAnchor = false;
      }
    }

    // Mark grid points as visible or non-visible
    // Check for being inside the grid poly
    for (let y=0; y<z.mGridInfo.divsY; ++y) {
      for (let x=0; x<z.mGridInfo.divsX; ++x) {
        const pos = new Point3d(x * z.mGridPointScaleX, y * z.mGridPointScaleX, 0);
        gridxy(x,y,z).isVisible = pointInPolygon(pos, z.mGridInfo.poly, z.mGridInfo.polyPoints, z.mGridInfo.scale);
      }
    }

    // Check for being on the grid poly line itself
    // Also determine anchor points
    for(let y=0; y<z.mGridInfo.divsY; ++y) {
      for(let x=0; x<z.mGridInfo.divsX; ++x) {
        const pos = new Point3d(x * z.mGridPointScaleX, y * z.mGridPointScaleX, 0);

        let from = z.mGridInfo.poly[0].copy().multiply(z.mGridInfo.scale);
        for (let i=1; i<z.mGridInfo.polyPoints; i++) {
          const to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);

          if (isNewShape(to)) {
            i++;
            from = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
            continue;
          }

          if (isPointOnLine(from, to, pos)) {
            gridxy(x,y,z).isVisible = true;
            gridxy(x,y,z).isAnchor = true;
          }

          from = to;
        }
      }
    }

    // Create a copy of the polygon but inset
    // This is used for collision detection with the edge of the grid

    const pp = [];
    for(let i=0; i<300; ++i) {
        pp.push(v2d_new())
    }
    z.mGridInfo.polyInner = pp;

    // Figure out the number of shapes we are dealing with
    const numShapes = z.getNumShapes();

    for (let s=0; s<numShapes; s++) {
      // Get the start and end indexes for the current shape
      let start,end;
      const shapeIndexes = z.getShapeIndexes(s, start, end);
      start = shapeIndexes.start;
      end = shapeIndexes.end;

      //char str[256];
      //sprintf(str, "num shapes = %d\nshape[%d] start=%d, end=%d\n", numShapes, s, start, end);
      //OutputDebugStringA(str);

      let i;
      for (i=start; i<=end; i++) {
        const p1 = new Point3d(z.mGridInfo.poly[i<=0 ? end : i-1]);
        const p2 = new Point3d(z.mGridInfo.poly[i]);
        const p3 = new Point3d(z.mGridInfo.poly[(i >= end) ? start : i+1]);

        // Create an imaginary line from point1 to point 3, then take the normal of that
        const normal = calculate2dAngle(p1, p3) + DegreesToRads(90);

        // Offset this vertex by a certain amount in the direction of the normal,
        // thus offseting each point of the polygon
        let vector = new Point3d(-.2, 0, 0);
        vector = rotate2dPoint(vector, normal);

        //const newPoint = p2 + vector;
        const newPoint = new Point3d(p2.x + vector.x, p2.y+vector.y, p2.z);

        z.mGridInfo.polyInner[i] = newPoint;
      }

      // Make sure the start and end points are exactly the same
      // We average them and set them both to that value to be sure
      const p1 = z.mGridInfo.polyInner[start];
      const p2 = z.mGridInfo.polyInner[end];
      const avg = new Point3d((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 0);
      z.mGridInfo.polyInner[start] = avg;
      z.mGridInfo.polyInner[end] = avg;
    }

    // Make sure the new shape markers are preserved into the inner outline list
    for (let i=0; i<z.mGridInfo.polyPoints; i++) {
      const to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
      if (isNewShape(to)) {
        z.mGridInfo.polyInner[i] = NEW_SHAPE;
      }
    }
  }

  getNumShapes() {
    const z = this;

    let numShapes = 1;
    for (let i=0; i<z.mGridInfo.polyPoints; i++) {
      const to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
      if (isNewShape(to)) {
        ++numShapes;
      }
    }
    return numShapes;
  }

  getShapeIndexes(shape, start, end) {
    const z = this;

    // In case there is only one shape
    start = 0;
    end = z.mGridInfo.polyPoints-1;

    const numShapes = z.getNumShapes();
    if (numShapes == 1) {
      return {
        start: start,
        end: end
      }
    } else {
      // Find the start index
      let shapeIndex = 0;
      for (let i=0; i<z.mGridInfo.polyPoints; i++) {
        const to = new Point3d(z.mGridInfo.poly[i]);
        if (isNewShape(to)) {
          ++shapeIndex;
          ++i;
        }

        if (shapeIndex == shape) {
          start = i;
          break;
        }
      }

      for (let i=start; i<z.mGridInfo.polyPoints; i++) {
        const to = new Point3d(z.mGridInfo.poly[i]);
        if (isNewShape(to)) {
          ++shapeIndex;
          ++i;
        }

        if (shapeIndex == shape+1) {
          end = i-2;
          break;
        }
      }
    }

    return {
      start: start,
      end: end
    }
  }

  hitTest(pos, radius, hitPos, deflectionAngle) {
    const z = this;

    if (hitPos) hitPos = pos; //  dont make a new point here
    if (deflectionAngle) deflectionAngle = 0;

    if (radius == 0) {

      if (pointInPolygon(pos, z.mGridInfo.poly, z.mGridInfo.polyPoints, z.mGridInfo.scale)) {
        return false;
      } else {
        // Point is outside the grid
        // Calculate the hit position and deflection angle
        if (hitPos) hitPos = z.getHitPoint(pos, radius);
        if (deflectionAngle) deflectionAngle = z.getHitAngle(pos);
        //console.log(hitPos) // [object]
        //return true;
        return {
          hitPoint: hitPos,
          angle: deflectionAngle
        }
      }

    } else {

      if (pointInPolygon(pos, z.mGridInfo.polyInner, z.mGridInfo.polyPoints, z.mGridInfo.scale)) {
        return false;
      }  else {
        // Point is outside the grid
        // Calculate the hit position and deflection angle
        if (hitPos) hitPos = z.getHitPoint(pos, radius);
        if (deflectionAngle) deflectionAngle = z.getHitAngle(pos);
        //console.log(hitPos)
        return {
          hitPoint: hitPos,
          angle: deflectionAngle
        }
        //return true;
      }

    }
  }

  getHitPoint(pos, radius) {
    const z = this;

    if (radius == 0) {
      // Find the closest line segment
      let edgeFrom = new Point3d();
      let edgeTo = new Point3d();
      let minDistance = MAXINT;
      let from = z.mGridInfo.poly[0].copy().multiply(z.mGridInfo.scale);
      for (let i=1; i<z.mGridInfo.polyPoints; i++) {
        let to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);

        let distance = pointLineDistance(from, to, pos);
        //console.log(distance, from, to, pos)
        if (distance < minDistance) {
          minDistance = distance;
          edgeFrom = new Point3d(from.x, from.y, from.z);
          edgeTo = new Point3d(to.x, to.y, to.z);
        }

        from = new Point3d(to.x,to.y,to.z);
      }

      const hitPoint = closestPointOnLineSegment(edgeFrom, edgeTo, pos);
      //console.log(hitPoint, edgeFrom, edgeTo, pos)
      return hitPoint;
    
    } else {
      
      // Find the closest line segment
      let edgeFrom = new Point3d();
      let edgeTo = new Point3d();
      let minDistance = MAXINT;
      let from = z.mGridInfo.poly[0].copy().multiply(z.mGridInfo.scale);
      for (let i=1; i<z.mGridInfo.polyPoints; i++) {
        let to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);

        if (isNewShape(to)) {
          i++;
          from = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
          continue;
        }

        let distance = pointLineDistance(from, to, pos);
        if (distance < minDistance) {
          minDistance = distance;
          edgeFrom = from;
          edgeTo = to;
        }

        from = to;
      }

      const hitPoint = closestPointOnLineSegment(edgeFrom, edgeTo, pos);
      return hitPoint;
    }
  }

  getHitAngle(pos) {
    const z = this;
    // Find the closest line segment
    let edgeFrom, edgeTo;
    let minDistance = MAXINT;
    let from = z.mGridInfo.poly[0].copy().multiply(z.mGridInfo.scale);
    for (let i=1; i<z.mGridInfo.polyPoints; i++) {
      let to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);

      let distance = pointLineDistance(from, to, pos);
      if (distance < minDistance)  {
        minDistance = distance;
        edgeFrom = from;
        edgeTo = to;
      }
      from = to;
    }

    // We want the line segment normal, not the angle of the segment, so subtract 90 (assumes clockwise winding)
    return calculate2dAngle(edgeFrom, edgeTo) - DegreesToRads(90);
  }

  run() {
    const dt = 0.1;

    //let x,y;
    const z = this;

    // Apply attractors
    for (let a=0; a<this.mAttractors.mNumAttractors; a++) {
      const att = z.mAttractors.mAttractors[a];
      if (att.enabled) {
        
        //console.log('ATTRACT')
        // find all the grid points within the radius of this attractor

        const posx = att.pos.x / z.mGridPointScaleX;
        const posy = att.pos.y / z.mGridPointScaleY;
        const radius = att.radius / z.mGridPointScaleX; // TODO!

        let xstart = posx-(radius*2);
        let xend = posx+(radius*2);
        if (xstart>xend) {
          let temp = xend;
          xend = xstart;
          xstart = temp;
        }
        if (xstart < 1) {
          xstart = 1;
        } else if (xstart > z.mGridInfo.divsX-2) {
          xstart = z.mGridInfo.divsX-2;
        }
        if (xend < 1) {
          xend = 1;
        } else if (xend > z.mGridInfo.divsX-2) {
          xend = z.mGridInfo.divsX-2;
        }

        let ystart = posy-(radius*2);
        let yend = posy+(radius*2);
        if (ystart>yend) {
          let temp = yend;
          yend = ystart;
          ystart = temp;
        }
        if (ystart < 1) {
          ystart = 1;
        } else if (ystart > z.mGridInfo.divsY-2) {
          ystart = z.mGridInfo.divsY-2;
        }
        if (yend < 1) {
          yend = 1;
        } else if (yend > z.mGridInfo.divsY-2) {
          yend = z.mGridInfo.divsY-2;
        }

        xstart = parseInt(xstart, 10)
        xend = parseInt(xend, 10)
        ystart = parseInt(ystart, 10)
        yend = parseInt(yend, 10)

        for(let y=ystart; y<yend; ++y) {
          for(let x=xstart; x<xend; ++x) {
            const gpoint = gridxy(x,y,z).pos;
            const apoint = new Point3d(att.pos.x / z.mGridPointScaleX, att.pos.y / z.mGridPointScaleY);

            const angle = calculate2dAngle(gpoint, apoint);
            const distance = calculate2dDistance(gpoint, apoint);
            const strength = att.strength;
            const zStrength = att.zStrength;

            let r = distance;            
            if (r < (att.radius / z.mGridPointScaleX)) { // TODO!!!
              r = (r*r);
              if (r < 1) r += .1;

              const gravityVector = new Point3d(-r * strength, 0, 0);
              const g = rotate2dPoint(gravityVector, angle);

              gridxy(x,y,z).vel.x += g.x * .008;
              gridxy(x,y,z).vel.y += g.y * .008;
              gridxy(x,y,z).vel.z += zStrength;
            }
          }
        }
      }
    }

    // Run brightness
    switch (z.mFadeStatus) {
      case FADESTATUS_IDLE:
        break;
      case FADESTATUS_FADEOUT:
        if (z.mBrightness > 0) {
          z.mBrightness *= .98;
        }
        break;
      case FADESTATUS_FADEIN:
        if (z.mBrightness < 1) {
          z.mBrightness += .005;
        }
        break;
    }

    // Run the grid
    const accel_c = -z.q * dt;
    const damping_multiplier = Math.exp(-dt * z.damping);
    for(let y=1; y<z.mGridInfo.divsY-1; ++y) {
      for(let x=1; x<z.mGridInfo.divsX-1; ++x) {
        // Weigh against neighbors
        const p1 = gridxy(x-1,y,z).pos;
        const p2 = gridxy(x+1,y,z).pos;
        const p3 = gridxy(x,y-1,z).pos;
        const p4 = gridxy(x,y+1,z).pos;

        // Average the point
        const avg_pos = new Point3d().add(p1).add(p2).add(p3).add(p4).multiply(.25);

        if (!gridxy(x,y,z).isAnchor) {
          gridxy(x,y,z).vel.add(gridxy(x,y,z).pos.copy().subtract(avg_pos).multiply(accel_c));
          gridxy(x,y,z).vel.multiply(damping_multiplier);
          gridxy(x,y,z).pos.add(gridxy(x,y,z).vel.copy().multiply(dt));
        }
      }
    }
  }

  draw() {
    
    const z = this;
    
    if (z.mBrightness <= .01)
      return;

    //let brightness = z.mBrightness;
    //if (scene::mPass != scene::RENDERPASS_PRIMARY)
    //  brightness *= .3;
    //else
      //z.mBrightness *= .6; 

    z.mBrightness = 1;     

    let brightness = z.mBrightness;

    //console.log(brightness) // .0075

    glLineWidth(5);
    glPointSize(3);

    // Horizontal lines
    for (let y=0; y<z.mGridInfo.divsY; ++y) {

      if (y%5==0) glColor4f(z.mGridInfo.brightGridColor.r, z.mGridInfo.brightGridColor.g, z.mGridInfo.brightGridColor.b, z.mGridInfo.brightGridColor.a * brightness);
      else glColor4f(z.mGridInfo.dimGridColor.r, z.mGridInfo.dimGridColor.g, z.mGridInfo.dimGridColor.b, z.mGridInfo.dimGridColor.a * brightness);

      glBegin(GL_LINES);
      //glBegin(GL_POINTS);
      for (let x=0; x<z.mGridInfo.divsX-1; ++x) {
        
        if (gridxy(x,y,z).isVisible && gridxy(x+1,y,z).isVisible) {

          let p1 = gridxy(x,y,z).pos;
          let p2 = gridxy(x+1,y,z).pos;

          glVertex3d(p1.x * z.mGridPointScaleX, p1.y * z.mGridPointScaleY, 0);
          glVertex3d(p2.x * z.mGridPointScaleX, p2.y * z.mGridPointScaleY, 0);
        }
      }
      glEnd();
    }

    // Vertical lines
    for (let x=0; x<z.mGridInfo.divsX; ++x) {

      if (x%5==0) glColor4f(z.mGridInfo.brightGridColor.r, z.mGridInfo.brightGridColor.g, z.mGridInfo.brightGridColor.b, z.mGridInfo.brightGridColor.a * brightness);
      else glColor4f(z.mGridInfo.dimGridColor.r, z.mGridInfo.dimGridColor.g, z.mGridInfo.dimGridColor.b, z.mGridInfo.dimGridColor.a * brightness);

      glBegin(GL_LINES);
      //glBegin(GL_POINTS);
      for (let y=0; y<z.mGridInfo.divsY-1; ++y) {
        if (gridxy(x,y,z).isVisible && gridxy(x,y+1,z).isVisible) {

          let p1 = gridxy(x,y,z).pos;
          let p2 = gridxy(x,y+1,z).pos;

          glVertex3d(p1.x * z.mGridPointScaleX, p1.y * z.mGridPointScaleY, 0);
          glVertex3d(p2.x * z.mGridPointScaleX, p2.y * z.mGridPointScaleY, 0);
        }
      }
      glEnd();
    }

    // Grid outline 

    //glEnable(GL_MULTISAMPLE);
    //glEnable(GL_LINE_SMOOTH);

    glColor4f(1.0, 1.0, 1.0, 1.0 * brightness); // RGBA
    
    glLineWidth(5);

    glBegin(GL_LINES);

    let from = z.mGridInfo.poly[0].copy().multiply(z.mGridInfo.scale);
    for (let i=1; i<z.mGridInfo.polyPoints; i++) {
      let to = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);

      if (isNewShape(to)) {
        i++;
        from = z.mGridInfo.poly[i].copy().multiply(z.mGridInfo.scale);
        continue;
      }

      glVertex3d(from.x, from.y, 0);
      glVertex3d(to.x, to.y, 0);

      from = to;
    }

    glEnd();     
  }

  startLevel(level) {
    this.mLevel = level;
    this.initGrid(this.mLevel);
    this.mBrightness = 0;
    this.mFadeStatus = FADESTATUS_FADEIN;
  }

  endLevel() {
    this.mFadeStatus = FADESTATUS_FADEOUT;
  }

  extentX() { return this.mGridExtentX; }
  extentY() { return this.mGridExtentY; }

  brightness() { return this.mBrightness; }
}
