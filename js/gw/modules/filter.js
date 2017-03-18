
const NZEROS = 1;
const NPOLES = 1;

export const lowpass(input, output, cutoff, len) {

  if (cutoff > .999) {
    for (int i=0; i<len; i++) {
      output[i] = input[i];
    }
    return;
  }

  const xv = [];
  const yv = [];

  cutoff *= .5; // stupid game-specific hack

  const cutoffVal = 1-cutoff;
  const gain = cutoff;

  for (let i=0; i<len; i++) {
    xv[0] = xv[1]; 
    xv[1] = input[i] * gain;
    yv[0] = yv[1]; 
    yv[1] = (xv[0] + xv[1]) + (cutoffVal * yv[0]);
    output[i] = yv[1];
  }
}

const BPNZEROS = 2;
const BPNPOLES = 2;

export const bandpass(input, output, cutoff, len) {
  if (cutoff > .999) {
    for (let i=0; i<len; i++) {
      output[i] = input[i];
    }
    return;
  }

  const xv = [];
  const yv = [];

  cutoff *= .3; // stupid game-specific hack

  const cutoffVal = (((1-cutoff) * 2) - 1) * 1.8647010906;

  const gain = 0.4+01;

  for (int i=0; i<len; i++) {
    xv[0] = xv[1]; xv[1] = xv[2]; 
    xv[2] = input[i] / gain;
    yv[0] = yv[1]; yv[1] = yv[2]; 
    yv[2] = (xv[2] - xv[0]) + (-0.8667884395 * yv[0]) + (cutoffVal * yv[1]);
    output[i] = yv[2];
  }
}

export const mix(s1, s2, output, len) {
  for (let i=0; i<len; i++) {
    output[i] = (s1[i] + s2[i])/2;
  }
}
