
import { logfile_message } from "./../core/logfile"
import { clip, isspace } from "./../core/util"
import { v2d_new } from "./../core/v2d"
//import { image_rgb } from "./../core/image"
import { lang_get } from "./../core/lang"
import { sprite_get_image, sprite_get_animation } from "./../core/sprite"
import { video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H, VIDEO_SCALE } from "./../core/video"

/* Constants */
const FONT_MAXVALUES      = 5;
const FONT_MAX            = 10; /* how many fonts do we have? */
const FONT_STACKCAPACITY  = 32;
const FONT_TEXTMAXLENGTH  = 20480;

/* private */
let fontdata = [];
let rgbksCache = {};
let tintImageCache = {};

export const font_init = () => {
  let i, j;
  let sheet;
  let p;
  const alphabet = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*.:!?",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*.:!?",
    "0123456789:",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ' !"#$%& ()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[ ]^_´abcdefghijklmnopqrstuvwxyz{|}~\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff',
    ' !"#$%& ()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[ ]^_´abcdefghijklmnopqrstuvwxyz{|}~'
  ];

  logfile_message("font_init()");
  for(i=0; i<alphabet.length; i++) {
    //for(j=0; j<256; j++) {
      fontdata[i] = { ch: [] };
    //  fontdata[i].ch[j] = null;
    //}

    sheet = "FT_FONT"+i;

    //sprintf(sheet, "FT_FONT%d", i);
    //console.log(sheet, "FT_FONT", i)
    for(j=0;j<alphabet[i].length;j++) {
      fontdata[i].ch[alphabet[i][j]] = sprite_get_image(sprite_get_animation(sheet, 0), j);
    }
  }
  //console.log(fontdata)
  logfile_message("font_init() ok");
}

export const font_create = (type) => {
  let i;
  let f = {};

  f.type = clip(type, 0, FONT_MAX-1);
  f.text = null;
  f.width = 0;
  f.visible = true;
  f.hspace = f.vspace = 1;
  f.value = [];
  f.position = v2d_new(0,0);
  for(i=0; i<FONT_MAXVALUES; i++)
    f.value[i] = 0;

  return f;
}

export const font_destroy = (f) => {}

export const font_set_text = (f,  msg, ...replace) => {
  if (!f) return false;

  let i;

  //console.log('FONT SET TEXT', f, msg, replace)

  //replace = Array.prototype.slice.call(arguments, 2);
  for(i=0;i<replace.length;i++) {
    replace[i] = ""+replace[i]+"";
  }
  //console.log(replace)

  msg = ""+msg;

  let textVariables = msg.match(/\$[A-Z_\d]\w+/g);
  if (textVariables) {
    for(i=0;i<textVariables.length;i++) {
      let t = textVariables[i].slice(1);
      //console.log(t)
      let t2 = lang_get(t);
      if (t2) {
        msg = msg.replace('$'+t, t2);
      }
    }
  }

  // replace string
  textVariables = msg.match(/\%[s]+/g);
  //console.log(textVariables, replace)
  if (textVariables) {
    for(i=0;i<textVariables.length;i++) {
      if (replace[i]) {
        let t = replace[i].match(/\$[A-Z_\d]\w+/g);
        if (t) {
          replace[i] = t[0].slice(1);
        }
        //console.log(replace[i])
        msg = msg.replace('%s', lang_get(replace[i]));
      }
    }
  }

  // replace digit // %d, %2d, % 7d
  // 0 does not work
  textVariables = msg.match(/\%[d]+/g);
  //console.log(textVariables)
  if (textVariables) {
    for(i=0;i<textVariables.length;i++) {
      if (replace[i]) {
        msg = msg.replace('%d', ""+replace[i]+"");
      }
    }
  }

  f.text = ""+msg;
  return f;
}

export const font_get_text = (f) => {
  return f.text ? f.text : "";
}

export const font_get_charsize = (f) => {
  return get_font_size(f);
}

export const font_get_charspacing = (f) => {
  return v2d_new(f.hspace, f.vspace);
}

export const font_set_width = (f, w) => {
  f.width = Math.max(0, w);
}

export const font_render = (f, camera_position) => {
  //console.log(f, camera_position)
  let offx = 0;
  let offy = 0;
  let w, h;
  let p;
  let ch;
  let color = [];
  let i = 0;
  let top = 0;
  let wordwrap;

  color[top++] = { r: false, g: 0, b: 0 };
  let fontSize = get_font_size(f);
  //console.log(fontSize)
  w = fontSize.x;
  h = fontSize.y;
  if(f && f.visible && f.text) {
    for(i=0; i<f.text.length; i++) {
      p = f.text[i];
      //console.log(f.text[p]);

      /* wordwrap */
      wordwrap = false;
      // if is first character in a word
      if(isspace((f.text[i-1]))) {
        //console.log('SPACE', f.text)
      //if(p == f.text || (p != f.text && isspace((p-1)))) {
        let q;
        let tag = false;
        let wordlen = 0;

        let wordSlice = f.text.slice(i);
        wordSlice = wordSlice.replace('(','');
        wordSlice = wordSlice.replace(')','');
        //console.log(wordSlice)
        let word = wordSlice.split(' ')[0];
        //console.log(word)
        //wordlen = word.length;
        for(q=0;q<word.length;q++) {
          if(word[q] == '<') tag = true;
          if(!tag) wordlen++;
          if(word[q] == '>') tag = false;
        }

        wordwrap = ((f.width > 0) && ((offx + (w + f.hspace)*wordlen - f.hspace) > f.width));
      }

      // tags
      if(p == '<') {

        //console.log('<')

        let tag = f.text.slice(i,i+7);
        //console.log(tag)

        if(tag == "<color=") {
          //var orig = p;
          let r, g, b;
          //var tc;
          //var valid = true;

          i += 7;
          let colorCode = f.text.slice(i,i+6);
          r = hex2dec(colorCode.slice(0,2));
          g = hex2dec(colorCode.slice(2,4));
          b = hex2dec(colorCode.slice(4,6));
          //console.log(colorCode, r, g, b)

          //color[top++] = image_rgb(r,g,b);
          color[top++] = {
            r: r,
            g: g,
            b: b
          }

          i += 7;
          p = f.text[i];
          /*for(i=0; i<6 && valid; i++) {
              tc = tolower( (p+i) );
              valid = ((tc >= '0' && tc <= '9') || (tc >= 'a' && tc <= 'f'));
          }
          valid = valid && ((p+6) == '>');

          if(valid) {
            r = (hex2dec((p+0)) << 4) | hex2dec((p+1));
            g = (hex2dec((p+2)) << 4) | hex2dec((p+3));
            b = (hex2dec((p+4)) << 4) | hex2dec((p+5));
            p += 7;
            if(top < FONT_STACKCAPACITY)
              color[top++] = image_rgb(r,g,b);
          }
          else
            p = orig;*/
        }

        if(tag == "</color") {
          i += 8;
          p = f.text[i];
          if(top >= 2) // we must not clear the color stack
            top--;
        }

        //if(!p)
        //  break;

      }


      /* printing text */
      if(wordwrap) { offx = 0; offy += h + f.vspace; }
      if(p != '\n') {
        //console.log(f.text[p])
        //ch = fontdata[f.type].ch[f.text[p]];
        //if (p) p = p.toUpperCase();
        ch = fontdata[f.type].ch[p];
        //console.log(f)
        if(ch) {
          offx+= ch.width;
          if(isspace((f.text[i-1])) && !wordwrap) {
            //offx+= ch.width/2;
          }
          render_char(
            video_get_backbuffer(),
            ch,
            parseInt((f.position.x+offx-(camera_position.x-VIDEO_SCREEN_W/2)),10),
            parseInt((f.position.y+offy-(camera_position.y-VIDEO_SCREEN_H/2)),10),
            color[top-1].r,
            color[top-1].g,
            color[top-1].b
          );
        } else {
          //console.log(w, f.hspace)
          offx += w + f.hspace;
        }
      }
      else {
        offx = 0;
        offy += h + f.vspace;
      }
    }
  }
}

const get_font_size = (f) => {
  var i;
  var ch;
  if (f) {
    for(i=0; i<256; i++) {
      if (fontdata[f.type]) {
        if(null != (ch=fontdata[f.type].ch[i])) {
          return v2d_new(ch.width,ch.height);
        }
      }
    }
  }
  return v2d_new(16,16);
}

const render_char = (dest, img, x, y, r, g, b) => {
  //console.log('render_char', r)

  let rgbks;
  let tintImg = img.data;

  if (r !== false) {
    rgbks = generateRGBKs( img.data );
    tintImg = generateTintImage( img.data, rgbks, r, g, b );
  }

  dest.drawImage(
    tintImg,
    img.sx, // The x coordinate where to start clipping
    img.sy, //  The y coordinate where to start clipping
    img.swidth, // The width of the clipped image
    img.sheight, // The height of the clipped image
    x, // The x coordinate where to place the image on the canvas
    y-2, // The y coordinate where to place the image on the canvas
    img.width*VIDEO_SCALE, // The width of the image to use (stretch or reduce the image)
    img.height*VIDEO_SCALE // The height of the image to use (stretch or reduce the image)
  );
}

const hex2dec = (digit) => {
  digit = digit.toLowerCase();
  if(digit >= '0' && digit <= '9')
    return digit-'0';
  else if(digit >= 'a' && digit <= 'f')
    return (digit-'a')+10;
  else
    return 255; /* error */
}

const generateRGBKs = (img) => {
    if (rgbksCache[img.src]) return rgbksCache[img.src];

    let w = img.width;
    let h = img.height;
    let rgbks = [];

    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    let ctx = canvas.getContext("2d");
    ctx.drawImage( img, 0, 0 );

    let pixels = ctx.getImageData( 0, 0, w, h ).data;

    // 4 is used to ask for 3 images: red, green, blue and
    // black in that order.
    for ( let rgbI = 0; rgbI < 4; rgbI++ ) {
        let canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;

        let ctx = canvas.getContext('2d');
        ctx.drawImage( img, 0, 0 );
        let to = ctx.getImageData( 0, 0, w, h );
        let toData = to.data;

        for (
                let i = 0, len = pixels.length;
                i < len;
                i += 4
        ) {
            toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
            toData[i+1] = (rgbI === 1) ? pixels[i+1] : 0;
            toData[i+2] = (rgbI === 2) ? pixels[i+2] : 0;
            toData[i+3] =                pixels[i+3]    ;
        }

        ctx.putImageData( to, 0, 0 );

        // image is _slightly_ faster then canvas for this, so convert
        let imgComp = new Image();
        imgComp.src = canvas.toDataURL();

        rgbks.push( imgComp );
    }

    rgbksCache[img.src] = rgbks;

    return rgbks;
}

const generateTintImage = ( img, rgbks, red, green, blue ) => {
  if (tintImageCache[img.src+"_"+red+"_"+green+"_"+blue]) return tintImageCache[img.src+"_"+red+"_"+green+"_"+blue];

  let buff = document.createElement( "canvas" );
  buff.width  = img.width;
  buff.height = img.height;

  let ctx  = buff.getContext("2d");

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage( rgbks[3], 0, 0 );

  ctx.globalCompositeOperation = 'lighter';
  if ( red > 0 ) {
      ctx.globalAlpha = red   / 255.0;
      ctx.drawImage( rgbks[0], 0, 0 );
  }
  if ( green > 0 ) {
      ctx.globalAlpha = green / 255.0;
      ctx.drawImage( rgbks[1], 0, 0 );
  }
  if ( blue > 0 ) {
      ctx.globalAlpha = blue  / 255.0;
      ctx.drawImage( rgbks[2], 0, 0 );
  }

  tintImageCache[img.src+"_"+red+"_"+green+"_"+blue] = buff;

  return buff;
}
