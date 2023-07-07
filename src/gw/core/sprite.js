
import { DATA_ROOT } from "./global"
import { hashtable_sprites, hashtable_spriteinfo_t_create, hashtable_spriteinfo_t_add } from "./hashtable"
import { image_load, image_destroy } from "./image"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFiles } from "./resourcemanager"
import { isInArray } from "./util"
import { v2d_new } from "./v2d"
import { video_renderLoading } from "./video"

const SPRITE_MAX_ANIM = 1000;

let canvasCache = {};

let sprites = {};
let numSpritesLoaded = 0;
let numSprites = 0;

// test
const showSheets = false;

const spriteFiles = [

];

let numLoaded = 0;
let spriteData = [];

export const sprite_init = () => {
  return new Promise(function (fulfill, reject){

    let i;

    logfile_message("Loading sprites...");
    sprites = hashtable_spriteinfo_t_create();

    for(i=0;i<spriteFiles.length;i++) {
      spriteFiles[i] = "data/sprites/"+spriteFiles[i]+".json";
    }

    //video_renderLoading('Loading...',0);

    resourcemanager_getJsonFiles(spriteFiles)
    .then(function(data){

      console.log('GOT ALL SPRITE JSON FILES')

      // merge data
      for(i=0;i<data.length;i++) {
        for (let s in data[i]) {
          data[i][s].name = s;
          spriteData.push(data[i][s]);
        }
      }

      traverse(spriteData)
      .then(function(){
        logfile_message("All sprites have been loaded!");
        //console.log(hashtable.hash.sprites)
        sprites = hashtable_sprites();
        //cb();
        fulfill();
      });

    });
  });
}

export const sprite_get_animation = (sprite_name, anim_id) => {
  let info;

  /* find the corresponding spriteinfo_t* instance */
  //info = sprites[sprite_name];
  info = sprites[sprite_name];
  //console.log(info)
  //info = hashtable_spriteinfo_t_find(sprites, sprite_name);
  if(info != null) {
    //anim_id = Math.min(anim_id, 0, info.animation_count-1);
    return info.animation_data[anim_id];
  }
  else {
    //fatal_error("Can't find sprite '%s' (animation %d)", sprite_name, anim_id);
    return null;
  }
}

export const sprite_get_image = (anim, frame_id) => {
  //console.log(anim, frame_id)
  if (!anim) return 0;
  //frame_id = Math.min(frame_id, 0, anim.frame_count-1);
  return anim.frame_data[anim.data[frame_id]];
}

export const sprite_create = (tree) => {
  //console.log('CREATE SPRITE',tree)
  return new Promise(function (fulfill, reject){
    spriteinfo_create(tree)
    .then(fulfill);
  });
}

export const sprite_info_destroy = (info) => {
  let i;

  if(info.source_file != null)
    info.source_file = null

  if(info.frame_data != null) {
      for(i=0; i<info.frame_count; i++)
          image_destroy(info.frame_data[i]);
      info.frame_data = null;
  }

  if(info.animation_data != null) {
      for(i=0; i<info.animation_count; i++)
          info.animation_data[i] = animation_delete(info.animation_data[i]);
      info.animation_data = null;
  }

  info = null;
}

const createCanvas = (imgUrl, spr) => {
  let canvas = document.createElement("canvas");
  canvas.width = spr.rect_w;
  canvas.height = spr.rect_h;
  document.body.appendChild(canvas);
  return canvas.getContext("2d");
}

const animation_delete = (anim) => {
  if(anim != null) {
    if(anim.data != null)
      anim.data = null;
    anim = null;
  }
  return null;
}

const dirfill = () => {}

const validate_sprite = (spr) => {
  let i, j, n;

  //console.log(spr)

  if(spr.frame_w > spr.rect_w || spr.frame_h > spr.rect_h) {
      //logfile_message("Sprite error: frame_size (%d,%d) can't be larger than source_rect size (%d,%d)", spr.frame_w, spr.frame_h, spr.rect_w, spr.rect_h);
      spr.frame_w = Math.min(spr.frame_w, spr.rect_w);
      spr.frame_h = Math.min(spr.frame_h, spr.rect_h);
      //logfile_message("Adjusting frame_size to (%d,%d)", spr.frame_w, spr.frame_h);
  }

  if(spr.rect_w % spr.frame_w > 0 || spr.rect_h % spr.frame_h > 0) {
      //logfile_message("Sprite error: incompatible frame_size (%d,%d) x source_rect size (%d,%d). source_rect size should be a multiple of frame_size.", spr.frame_w, spr.frame_h, spr.rect_w, spr.rect_h);
      spr.rect_w = (spr.rect_w % spr.frame_w > 0) ? (spr.rect_w - spr.rect_w % spr.frame_w + spr.frame_w) : spr.rect_w;
      spr.rect_h = (spr.rect_h % spr.frame_h > 0) ? (spr.rect_h - spr.rect_h % spr.frame_h + spr.frame_h) : spr.rect_h;
      //logfile_message("Adjusting source_rect size to (%d,%d)", spr.rect_w, spr.rect_h);
  }

  //if(spr.animation_count < 1 || spr.animation_data == null)
  //    fatal_error("Sprite error: sprites must contain at least one animation");

  n = (spr.rect_w / spr.frame_w) * (spr.rect_h / spr.frame_h);
  for(i=0; i<spr.animation_count; i++) {
      for(j=0; j<spr.animation_data[i].frame_count; j++) {
          if(!(spr.animation_data[i].data[j] >= 0 && spr.animation_data[i].data[j] < n)) {
              //logfile_message("Sprite error: invalid frame '%d' of animation %d. Animation frames must be in range %d..%d", spr.animation_data[i].data[j], i, 0, n-1);
              spr.animation_data[i].data[j] = Math.min(spr.animation_data[i].data[j], 0, n-1);
              //logfile_message("Adjusting animation frame to %d", spr.animation_data[i].data[j]);
          }
      }
  }

  return spr;
}

const validate_animation = (anim) => {
  if(anim.frame_count == 0)
    logfile_message("Animation error: invalid 'data' field. You must specify the frames of the animations");
  //  fatal_error("Animation error: invalid 'data' field. You must specify the frames of the animations");
}

const spriteinfo_create = (tree) => {
  return new Promise(function (fulfill, reject){
    let s = spriteinfo_new();
    let sprite = traverse_sprite_attributes(s,tree);
    sprite = validate_sprite(sprite);
    //fulfill();
    load_sprite_images(sprite)
    .then(function(loadedSprite){
      //console.log('SPRITE LOADED',loadedSprite)
      sprite = fix_sprite_animations(loadedSprite);
      register_sprite(tree.name, sprite)
      numLoaded++;
      //video_renderLoading('Loading...',numLoaded/spriteData.length);
      fulfill(sprite);
    });
  });
}

const spriteinfo_new = () => {
  let info = {};

  info.source_file = null;
  info.rect_x = 0;
  info.rect_y = 0;
  info.rect_w = 0;
  info.rect_h = 0;
  info.frame_w = info.frame_h = 0;
  info.hot_spot = v2d_new(0,0);
  info.frame_count = 0;
  info.frame_data = [];
  info.animation_count = 0;
  info.animation_data = [];

  return info;
}

/* this function needs to be highly optimzed, it gets run many many times */
const load_sprite_images = (spr) => {
  //console.log('load_sprite_images')
  return new Promise(function (fulfill, reject){
    let i = 0;
    let cur_x = 0;
    let cur_y = 0;
    // need to put event listener inside of image.load and return promise
    image_load(spr.source_file)
    .then(function(sheet){

      //console.log('image loaded',spr.source_file)

      //console.log(sheet)
      spr.frame_count = parseInt((spr.rect_w / spr.frame_w) * (spr.rect_h / spr.frame_h),10);
      spr.frame_data = [];

      spr = setupCanvasSprite(spr,sheet);
      //console.log(spr)
      fulfill(spr);
    })

    /*
    var sheet = image.load(spr.source_file);
    console.log(sheet)
    spr.frame_count = parseInt((spr.rect_w / spr.frame_w) * (spr.rect_h / spr.frame_h),10);
    spr.frame_data = [];
    sheet.addEventListener("load",function(){
      spr = setupCanvasSprite(spr,sheet);
      console.log(spr)
      fulfill(spr);
    });
    */
  });
}

const setupCanvasSprite = (spr, sheet) => {
  let cur_x = 0;
  let cur_y = 0;

  //console.log('setupCanvasSprite',spr.frame_count);

  for(let i=0; i<parseInt(spr.frame_count,10); i++) {

    spr.frame_data[i] = {
      data: sheet,
      sx: cur_x + spr.rect_x,
      sy: cur_y + spr.rect_y,
      swidth: spr.frame_w,
      sheight: spr.frame_h,
      x: 0,
      y: 0,
      width: spr.frame_w,
      height: spr.frame_h
    };

    cur_x += spr.frame_w;

    if(cur_x >=spr.rect_w) {
      cur_x = 0;
      cur_y += spr.frame_h;
    }
  }

  return spr;
}

const fix_sprite_animations = (spr) => {
  for(let i=0; i<spr.animation_count; i++) {
    spr.animation_data[i].frame_data = spr.frame_data;
    spr.animation_data[i].hot_spot = spr.hot_spot;
  }
  return spr;
}

const traverse = (data) => {
  return Promise.all(data.map(spriteinfo_create));
}

const traverse_sprite_attributes = (sprite, s) => {

  /* source_file */
  sprite.source_file = DATA_ROOT + s.source_file;

  /* source_rect */
  sprite.rect_x = s.source_rect.xpos;
  sprite.rect_y = s.source_rect.ypos;
  sprite.rect_w = s.source_rect.width;
  sprite.rect_h = s.source_rect.height;

  /* frame_size */
  sprite.frame_w = s.frame_size.width;
  sprite.frame_h = s.frame_size.height;

  /* hot_spot */
  if(s.hot_spot) {
    sprite.hot_spot.x = s.hot_spot.xpos;
    sprite.hot_spot.y = s.hot_spot.ypos;
  }

  /* animations */
  if(s.animations) {
    sprite.animation_count = s.animations.length;
    for(var i=0;i<sprite.animation_count;i++) {
      sprite.animation_data[i] = traverse_animation_attributes(animation_new(), s.animations[i]);
      validate_animation(sprite.animation_data[i]);
    }
  }

  return sprite;
}

const traverse_animation_attributes = (anim, animation) => {
  //console.log(anim, animation);

  anim.repeat = animation.repeat;
  anim.fps = animation.fps;
  anim.data = animation.data;
  anim.frame_count = animation.data.length;

  return anim;
}

const register_sprite = (sprite_name, spr) => {
  //logfile_message("Registering sprite '%s'...", sprite_name);
  hashtable_spriteinfo_t_add(hashtable_sprites(), sprite_name, spr);
}

const animation_new = () => {
  let anim = {};

  anim.repeat = false;
  anim.fps = 8;
  anim.frame_count = 0;
  anim.data = null; /* this will be malloc'd later */
  anim.hot_spot = v2d_new(0,0);
  anim.frame_data = null;

  return anim;
}
