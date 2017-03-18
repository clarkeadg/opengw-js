
import { v2d_new } from "./../core/v2d"
import { video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { PI } from "./defines"

let hfov = 100 * PI / 180;
let vfov = 80 * PI / 180;

// Set up the view distance based on the field-of-view (with pythagoras)
let hViewDistance = ( VIDEO_SCREEN_W / 2 ) / Math.tan( hfov / 2 );
let vViewDistance = ( VIDEO_SCREEN_H / 2 ) / Math.tan( vfov / 2 );

export const fmod = (a,b) => { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

export const Point2Vector = (x, y, z) => {
  
  // Project to 2D space
  const v2d = v2d_new( (x * hViewDistance) / z, (y * vViewDistance) / z );

  // Transform from screen cordinates to X/Y
  v2d.x += VIDEO_SCREEN_W / 2;
  v2d.y = ( VIDEO_SCREEN_H / 2 ) - v2d.y;

  return v2d;
}

export const drawLine = (startPos, endPos, color) => {
  const ctx = video_get_backbuffer();
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y); 
  //ctx.strokeStyle = 'rgba(255,0,0,0.5)';  
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.2;
  ctx.stroke(); 
}

export const drawRect = (pos, radius, color) => {
  const ctx = video_get_backbuffer();
  //ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillStyle = color;
  ctx.fillRect( pos.x, pos.y, radius*3, radius*3 );
}
