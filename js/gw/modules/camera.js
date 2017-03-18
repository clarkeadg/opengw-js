
import { Point3d } from "./point3d"
import { calculate2dDistance } from "./mathutils"

const zoomedIn = 50;
const zoomedOut = 66;

export class camera {

  constructor(players, grid) {
    this.mPlayers = players;
    this.mGrid = grid;
    this.mCurrentPos = new Point3d();
    this.mTargetPos = new Point3d();
  }

  center() {
    this.mCurrentZoom = zoomedIn;
    this.mTargetZoom = zoomedIn;
    this.mZoomOverride = 0;
    this.mTargetPos = new Point3d(this.mGrid.extentX()-1/2, this.mGrid.extentY()-1/2, this.mTargetZoom);
  }

  followPlayer() {

    const z = this;
    
    // If there is an active player or players, follow it
    let playerPos;

    //if (z.mNumPlayers == 1) {
      
      // One player game
      playerPos = z.mPlayers.mPlayer1.getPos();

    //}  else {
      
      // Two player game

      // Get the midpoint and distance between the players
      /*playerPos = Point3d((z.mPlayers.mPlayer1.getPos().x + z.mPlayers.mPlayer2.getPos().x) / 2, (z.mPlayers.mPlayer1.getPos().y + z.mPlayers.mPlayer2.getPos().y) / 2, 0);
      float distance = calculate2dDistance(z.mPlayers.mPlayer1.getPos(), z.mPlayers.mPlayer2.getPos()) * 4;

      const hypotenuse = Math.sqrt((theGame.mGrid.extentX()*theGame.mGrid.extentX()) + (theGame.mGrid.extentY()*theGame.mGrid.extentY()));

      z.mTargetZoom = (zoomedIn + (zoomedOut-zoomedIn)) * (distance / hypotenuse);

      if (z.mTargetZoom < zoomedIn)
        z.mTargetZoom = zoomedIn;
      else if (z.mTargetZoom > zoomedOut)
        z.mTargetZoom = zoomedOut;*/
    //}

    const ax = (playerPos.x / this.mGrid.extentX());
    const ay = (playerPos.y / this.mGrid.extentY());

    const border = -20;

    this.mTargetPos.x = (ax * (this.mGrid.extentX() + (border*2))) - border;
    this.mTargetPos.y = (ay * (this.mGrid.extentY() + (border*2))) - border;
  }

  run() {
    this.mCurrentZoom += (this.mTargetZoom - this.mCurrentZoom) / 20.0;

    this.mCurrentPos.x += (this.mTargetPos.x - this.mCurrentPos.x) / 16.0;
    this.mCurrentPos.y += (this.mTargetPos.y - this.mCurrentPos.y) / 16.0;

    this.mCurrentPos.z = this.mCurrentZoom + this.mZoomOverride;

    //console.log(this.mCurrentPos) 67, 35, 50
  }
}