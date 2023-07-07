/*
libvmath javascript port (original C version: http://gfxtools.sourceforge.net)
Copyright (C) 2011  John Tsiombikas <nuclear@member.fsf.org>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

export const v3_cons = (res, x, y, z) => {
	res[0] = x;
	res[1] = y;
	res[2] = z;
}

export const v3_add = (res, a, b) => {
	res[0] = a[0] + b[0];
	res[1] = a[1] + b[1];
	res[2] = a[2] + b[2];
}

export const v3_sub = (res, a, b) => {
	res[0] = a[0] - b[0];
	res[1] = a[1] - b[1];
	res[2] = a[2] - b[2];
}

export const v3_mul = (res, a, b) => {
	res[0] = a[0] * b[0];
	res[1] = a[1] * b[1];
	res[2] = a[2] * b[2];
}

export const v3_div = (res, a, b) => {
	res[0] = a[0] / b[0];
	res[1] = a[1] / b[1];
	res[2] = a[2] / b[2];
}

export const v3_dot = (a, b) => {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export const v3_cross = (res, a, b) => {
	res[0] = a[1] * b[2] - a[2] * b[1];
	res[1] = a[2] * b[0] - a[0] * b[2];
	res[2] = a[0] * b[1] - a[1] * b[0];
}

export const v3_length = (v) => {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export const v3_length_sq = (v) => {
	return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

export const v3_normalize = (v) => {
	var len = v3_length(v);
	v[0] /= len;
	v[1] /= len;
	v[2] /= len;
}

export const v3_transform = (res, v, m) => {
	res[0] = v[0] * m[0] + v[1] * m[1] + v[2] * m[2] + m[3];
	res[1] = v[0] * m[4] + v[1] * m[5] + v[2] * m[6] + m[7];
	res[3] = v[0] * m[8] + v[1] * m[9] + v[2] * m[10] + m[11];
}

/* --- matrix 4x4 --- */

export const m4_cons = (res, m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, ma, mb, mc, md, me, mf) => {
	res[0] = m0;
	res[1] = m1;
	res[2] = m2;
	res[3] = m3;
	res[4] = m4;
	res[5] = m5;
	res[6] = m6;
	res[7] = m7;
	res[8] = m8;
	res[9] = m9;
	res[10] = ma;
	res[11] = mb;
	res[12] = mc;
	res[13] = md;
	res[14] = me;
	res[15] = mf;
}

export const m4_identity = (res) => {
	res[0] = res[5] = res[10] = res[15] = 1.0;
	res[1] = res[2] = res[3] = res[4] = res[6] = res[7] = 0.0;
	res[8] = res[9] = res[11] = res[12] = res[13] = res[14] = 0.0;
}

export const m4_copy = (res, m) => {
	res[0] = m[0]; res[1] = m[1]; res[2] = m[2]; res[3] = m[3];
	res[4] = m[4]; res[5] = m[5]; res[6] = m[6]; res[7] = m[7];
	res[8] = m[8]; res[9] = m[9]; res[10] = m[10]; res[11] = m[11];
	res[12] = m[12]; res[13] = m[13]; res[14] = m[14]; res[15] = m[15];
}

export const m4_mul = (res, a, b) => {
	var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
	var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
	var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
	var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	var b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
	var b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
	var b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
	var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

	res[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
	res[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
	res[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
	res[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
	res[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
	res[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
	res[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
	res[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
	res[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
	res[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
	res[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
	res[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
	res[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
	res[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
	res[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
	res[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
}

export const m4_translation = (res, x, y, z) => {
	res[0] = res[5] = res[10] = res[15] = 1.0;
	res[1] = res[2] = res[3] = res[4] = res[6] = res[7] = res[8] = res[9] = res[11] = 0.0;
	res[12] = x;
	res[13] = y;
	res[14] = z;
}

export const m4_rotation = (res, angle, x, y, z) => {
	var sina = Math.sin(angle);
	var cosa = Math.cos(angle);
	var one_minus_cosa = 1.0 - cosa;
	var nxsq = x * x;
	var nysq = y * y;
	var nzsq = z * z;

	res[0] = nxsq + (1.0 - nxsq) * cosa;
	res[4] = x * y * one_minus_cosa - z * sina;
	res[8] = x * z * one_minus_cosa + y * sina;
	res[1] = x * y * one_minus_cosa + z * sina;
	res[5] = nysq + (1.0 - nysq) * cosa;
	res[9] = y * z * one_minus_cosa - x * sina;
	res[2] = x * z * one_minus_cosa - y * sina;
	res[6] = y * z * one_minus_cosa + x * sina;
	res[10] = nzsq + (1.0 - nzsq) * cosa;

	res[3] = res[7] = res[11] = res[12] = res[13] = res[14] = 0.0;
	res[15] = 1.0;
}

export const m4_scale = (res, x, y, z) => {
	res[0] = x;
	res[5] = y;
	res[10] = z;
	res[15] = 1.0;
	res[1] = res[2] = res[3] = res[4] = res[6] = res[7] = 0.0;
	res[8] = res[9] = res[11] = res[12] = res[13] = res[14] = 0.0;
}

export const m4_string = (mat) => {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + ']\n' +
		'['+ mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] + ']\n' +
		'['+ mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] + ']\n' +
		'['+ mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']\n';

}
