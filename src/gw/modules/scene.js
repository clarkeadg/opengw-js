
import { GL_DEPTH_TEST, GL_BLEND, GL_SRC_ALPHA, GL_ONE, glEnable, glDisable, glBlendFunc, glClearColor, glClear } from "./webgl"
import { game } from "./game"
import { Point3d } from "./point3d"
import { Edge } from "./model"
import { v2d_new, v2d_add } from "./../core/v2d"
//import { actor_image, actor_animation_finished, actor_change_animation, actor_render, actor_destroy, actor_create } from "./../entities/actor"
//import { sprite_get_animation } from "./../core/sprite"
//import { font_create, font_destroy, font_set_width, font_set_text, font_get_text, font_render } from "./../entities/font"
import { timer_get_ticks, timer_get_delta } from "./../core/timer"

export const RENDERPASS_PRIMARY = 0;
export const RENDERPASS_BLUR    = 1;

export const VIRTUAL_SCREEN_WIDTH  = 800;
export const VIRTUAL_SCREEN_HEIGHT = 600;

let theGame;

export class scene {

  constructor() {
    this.mAttractModeTimer = 0;
    this.mShowHighScores = false;

    // Create the model for the shield symbol

    let i = 0;

    this.mShieldSymbol = {};
    this.mShieldSymbol.mNumVertex = 12;
    this.mShieldSymbol.mVertexList = [];
    this.mShieldSymbol.mVertexList[i++] = new Point3d(8.1, 8.1);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(11.5, 0);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(8.1, -8.1);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(0, -11.5);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(-8.1, -8.1);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(-11.5, 0);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(-8.1, 8.1);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(0, 4);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(0, -4);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(-4, 0);
    this.mShieldSymbol.mVertexList[i++] = new Point3d(4, 0);    

    this.mShieldSymbol.mNumEdges = 10;
    this.mShieldSymbol.mEdgeList = [];
    for(i=0;i<this.mShieldSymbol.mNumEdges;i++) {
      this.mShieldSymbol.mEdgeList.push(new Edge())
    }
    i = 0;
    this.mShieldSymbol.mEdgeList[i].from = 0; this.mShieldSymbol.mEdgeList[i++].to = 1;
    this.mShieldSymbol.mEdgeList[i].from = 1; this.mShieldSymbol.mEdgeList[i++].to = 2;
    this.mShieldSymbol.mEdgeList[i].from = 2; this.mShieldSymbol.mEdgeList[i++].to = 3;
    this.mShieldSymbol.mEdgeList[i].from = 3; this.mShieldSymbol.mEdgeList[i++].to = 4;
    this.mShieldSymbol.mEdgeList[i].from = 4; this.mShieldSymbol.mEdgeList[i++].to = 5;
    this.mShieldSymbol.mEdgeList[i].from = 5; this.mShieldSymbol.mEdgeList[i++].to = 6;
    this.mShieldSymbol.mEdgeList[i].from = 6; this.mShieldSymbol.mEdgeList[i++].to = 7;
    this.mShieldSymbol.mEdgeList[i].from = 7; this.mShieldSymbol.mEdgeList[i++].to = 0;
    this.mShieldSymbol.mEdgeList[i].from = 8; this.mShieldSymbol.mEdgeList[i++].to = 9;
    this.mShieldSymbol.mEdgeList[i].from = 10; this.mShieldSymbol.mEdgeList[i++].to = 11;    
  }

  init() {
    this.level_timer = 0;

    theGame = new game();
    console.log(theGame)

    //this.maingui = actor_create();
    //this.maingui.position = v2d_new(16, 7);
    //this.maingui = actor_change_animation(this.maingui, sprite_get_animation("SD_MAINGUI", 0));
    //console.log(this.maingui )
    
    //this.mainfnt = [];
    //for(let i=0; i<4; i++) {
    //  this.mainfnt[i] = font_create(2);
    //  this.mainfnt[i].position = v2d_add(this.maingui.position, v2d_new(42, i*16+2));
    //}

    //this.fixedcam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);
  }

  run() {
    theGame.run();

    this.level_timer+= timer_get_delta();

    //font_set_text(this.mainfnt[0], "%d", theGame.mPlayers.mPlayer1.mScore);
    //let s = parseInt(this.level_timer%60,10);
    //if (s < 10) s = "0"+s;
    //font_set_text(this.mainfnt[1], "%s", parseInt(this.level_timer/60,10) +":"+ s );
    //font_set_text(this.mainfnt[2], "%d", theGame.mPlayers.mPlayer1.mNumLives);
    //font_set_text(this.mainfnt[3], "%d", theGame.mPlayers.mPlayer1.mNumBombs);
  }

  draw(pass) {

    glClearColor(0,0,0,1);
    glClear();

    //glMatrixMode(GL_PROJECTION);
    //glPushMatrix();
    //glLoadIdentity();
    //gluPerspective(70, mWidth / mHeight, 0.01, 1000);

    //glMatrixMode(GL_MODELVIEW);
    //glPushMatrix();
    //glLoadIdentity();

    // Glowy blending effect
    glDisable(GL_DEPTH_TEST);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE);

    theGame.draw(pass);

    //glDisable(GL_BLEND);

    //glPopMatrix();

    //glMatrixMode(GL_PROJECTION);
    //glPopMatrix();

    /*actor_render(this.maingui, this.fixedcam);
    for(let i=0;i<4;i++)
     font_render(this.mainfnt[i], this.fixedcam);*/
  }  
}
