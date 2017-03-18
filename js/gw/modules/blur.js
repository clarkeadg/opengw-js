
const max = (a,b) => (((a) > (b)) ? (a) : (b))
const min = (a,b) => (((a) < (b)) ? (a) : (b))

export const superFastBlur(pix, w, h, radius) {
  if (radius<1) return;

  const wm = w-1;
  const hm = h-1;
  const wh = w*h;
  const div = radius+radius+1;
  const r = [];
  const g = [];
  const b = [];
  let rsum,gsum,bsum,x,y,i,p,p1,p2,yp,yi,yw;
  const vMIN = [];
  const vMAX = [];

  const dv = [];
  for (i=0;i<256*div;i++) dv[i] = (i/div);

  yw = yi = 0;

  for (y=0;y<h;y++) {
      
    rsum = gsum = bsum = 0;
    for(i=-radius;i<=radius;i++) {
      p = (yi + min(wm, max(i,0))) * 3;
      rsum += pix[p];
      gsum += pix[p+1];
      bsum += pix[p+2];
    }
    for (x=0;x<w;x++) {

      r[yi] = dv[rsum];
      g[yi] = dv[gsum];
      b[yi] = dv[bsum];

      if(y==0) {
        vMIN[x] = min(x+radius+1,wm);
        vMAX[x] = max(x-radius,0);
      }
      p1 = (yw+vMIN[x])*3;
      p2 = (yw+vMAX[x])*3;

      rsum+= pix[p1] - pix[p2];
      gsum+= pix[p1+1] - pix[p2+1];
      bsum+= pix[p1+2] - pix[p2+2];

      yi++;
    }
    yw+= w;
  }

  for (x=0;x<w;x++) {
    rsum = gsum = bsum = 0;
    yp = -radius*w;
    for(i=-radius;i<=radius;i++) {
      yi = max(0,yp)+x;
      rsum+= r[yi];
      gsum+= g[yi];
      bsum+= b[yi];
      yp+= w;
    }
    yi = x;
    for (y=0;y<h;y++) {
      pix[yi*3] = dv[rsum];
      pix[yi*3 + 1] = dv[gsum];
      pix[yi*3 + 2] = dv[bsum];
      if(x == 0) {
          vMIN[y] = min(y+radius+1,hm)*w;
          vMAX[y] = max(y-radius,0)*w;
      }
      p1 = x+vMIN[y];
      p2 = x+vMAX[y];

      rsum+= r[p1]-r[p2];
      gsum+= g[p1]-g[p2];
      bsum+= b[p1]-b[p2];

      yi+= w;
    }
  }

  r = null;
  g = null;
  b = null;

  vMIN = null;
  vMAX = null;
  dv = null;
}
