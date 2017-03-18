
export class Point3d {  
  
  constructor(x, y, z) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
  }

  copy() { 
    return new Point3d(this.x,this.y,this.z) 
  }
  
  add(b) {
    this.x+= b.x;
    this.y+= b.y;
    this.z+= b.z;
    return this;
  }

  subtract(b) {
    this.x-= b.x;
    this.y-= b.y;
    this.z-= b.z;
    return this;
  }

  multiply(b) {
    this.x*= b;
    this.y*= b;
    this.z*= b;
    return this;
  }
}

export const p3d_dot = (a, b) => {
  return a.x * b.x + a.y * b.y + a.z * b.z;    
}

export const p3d_add = (a, b) => {
  return new Point3d(a.x + b.x, a.y + b.y, a.z + b.z)   
}
 
export const p3d_subtract = (a, b) => {
  return new Point3d(a.x - b.x, a.y - b.y, a.z - b.z)   
}
 
export const p3d_multiply = (a, b) => {
  return new Point3d(a.x * b, a.y * b, a.z * b)   
}
 

