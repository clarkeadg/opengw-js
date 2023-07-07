
import { calculate2dAngle, calculate2dDistance, rotate2dPoint, DegreesToRads } from "./mathutils"
import { Point3d } from "./point3d"

export class pen {
  constructor(r, g, b, a, radius) {
    this.r = r || 1;
    this.g = g || 1;
    this.b = b || 1;
    this.a = a || 1;
    this.radius = radius || 1;
    //this.r = parseInt(this.r * 255, 10);
    //this.g = parseInt(this.g * 255, 10);
    //this.b = parseInt(this.b * 255, 10);
  }
}

export const drawVector = (from, to, penStyle) => {}

export const extendVector = (from, to, amount) => {
  const angle = calculate2dAngle(from, to) - DegreesToRads(90);
  const distance = calculate2dDistance(from, to) * amount;
  const midPoint = new Point3d((from.x + to.x) / 2, (from.y + to.y) / 2, 0);

  let vector1 = new Point3d(0,distance/2,0);
  let vector2 = new Point3d(0,-distance/2,0);

  vector1 = rotate2dPoint(vector1, angle);
  vector2 = rotate2dPoint(vector2, angle);

  vector1 += new Point3d(vector1.x + midPoint.x, vector1.y + midPoint.y, vector1.z + midPoint.z);
  vector2 += new Point3d(vector2.x + midPoint.x, vector2.y + midPoint.y, vector2.z + midPoint.z);

  from.x = vector1.x;
  from.y = vector1.y;

  to.x = vector2.x;
  to.y = vector2.y;
}
