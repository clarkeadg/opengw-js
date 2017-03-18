
import { PI, RADIAN } from "./defines"
import { Point3d, p3d_dot } from "./point3d"
import { fmod } from "./util"

export const calculate2dDistance = (p1, p2) => {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;

  const dy = x1 - x2;
  const dz = y1 - y2;
  const distance = Math.sqrt((dz*dz) + (dy*dy));

  return distance;
}

export const calculate2dAngle = (from, to) => {
  let angle = 0;

  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx == 0) {
    if (dy == 0)
      angle = 0;
    else if (dy > 0)
      angle = PI/2;
    else
      angle = PI * 3.0 / 2.0;
  } else if (dy == 0) {
    if (dx > 0)
      angle = 0;
    else
      angle = PI;
  } else {
    if (dx < 0)
      angle = Math.atan(dy/dx) + PI;
    else if (dy < 0)
      angle = Math.atan(dy/dx) + (2*PI);
    else
      angle = Math.atan(dy/dx);
  }

  if (angle >= RADIAN) angle-=RADIAN;

  return angle;
}

export const rotate2dPoint = (point, angle) => {
  const normalx = point.x;
  const normaly = point.y;
  const pt = new Point3d (normalx * Math.cos(angle) - normaly *  Math.sin(angle), normalx *  Math.sin(angle) + normaly *  Math.cos(angle));
  return pt;
}

export const randFromTo = (from, to) => {
  const range = to-from;
  return parseInt(((frandFrom0To1()*(range+1))+from), 10);
}

export const frandFrom0To1 = () => {
  return Math.random();
}

export const pointInPolygon = (testPoint, poly, numPoints, scale) => {

  let oddNodes = false;

  let from = poly[0].copy().multiply(scale);
  for (let i=1; i<numPoints; i++) {
    const to = poly[i].copy().multiply(scale);

    if (to.z != 0) {
      i++;
      from = poly[i].copy().multiply(scale);
      continue;
    }

    if ((from.y < testPoint.y && to.y >= testPoint.y || to.y < testPoint.y && from.y >= testPoint.y) && (from.x <= testPoint.x || to.x <= testPoint.x)) {
      oddNodes ^= (from.x + (testPoint.y-from.y) / (to.y - from.y) * (to.x - from.x) < testPoint.x);
    }

    from = to;
  }

  return oddNodes;
}

export const pointLineDistance = (lineFrom, lineTo, testPoint) => {
  const lineDiffVect = lineTo.copy().subtract(lineFrom);
  const length = calculate2dDistance(new Point3d(0,0,0), lineDiffVect);

  const lineToPointVect = testPoint.copy().subtract(lineFrom);
  const dotProduct = p3d_dot(lineDiffVect, lineToPointVect);
  const percAlongLine = dotProduct / (length*length);

  // If point is outside of the line segment, clamp it to one end or another
  if (percAlongLine < 0.0) {
    return Math.abs(calculate2dDistance(lineFrom, testPoint));
  } else if (percAlongLine > 1.0) {
    return Math.abs(calculate2dDistance(lineTo, testPoint));
  }

  const intersectPoint = lineFrom.copy().add(new Point3d(lineDiffVect.x * percAlongLine, lineDiffVect.y * percAlongLine, 0));
  return Math.abs(calculate2dDistance(intersectPoint, testPoint));
}

export const isPointOnLine = (lineFrom, lineTo, testPoint) => {
  const distance = pointLineDistance(lineFrom, lineTo, testPoint);
  return distance < 1 ? true : false;
}

export const DegreesToRads = (degrees) => {
  return degrees * 0.0174532925;
}

export const clamp2dVector = (vector, max) => {
  const clamped = vector;
  const distance = calculate2dDistance(new Point3d(0,0,0), clamped);
  if (distance > max) {
    const r = max / distance;
    clamped.x *= r;
    clamped.y *= r;
  }
  return clamped;
}

export const diffAngles = (angle1, angle2) => {
  angle1 = fmod(angle1, DegreesToRads(360));
  angle2 = fmod(angle2, DegreesToRads(360));

  let angle = angle1-angle2;

  if (angle >= DegreesToRads(180))
    angle -= DegreesToRads(360);
  else if (angle <= -DegreesToRads(180))
    angle += DegreesToRads(360);

  return angle;
}

export const closestPointOnLineSegment = (lineFrom, lineTo, testPoint) => {
  const lineDiffVect = lineTo.copy().subtract(lineFrom);
  const length = calculate2dDistance(new Point3d(0,0,0), lineDiffVect);

  const lineToPointVect = testPoint.copy().subtract(lineFrom);
  const dotProduct = p3d_dot(lineDiffVect, lineToPointVect);
  const percAlongLine = dotProduct / (length*length);

  // If point is outside of the line segment, clamp it to one end or another
  if (percAlongLine < 0.0) {
    return lineFrom;
  }
  else if (percAlongLine > 1.0) {
    return lineTo;
  }

  return lineFrom.copy().add(new Point3d(lineDiffVect.x * percAlongLine, lineDiffVect.y * percAlongLine, 0));
}
