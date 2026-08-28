import { deflateSync } from "zlib";

const T = (() => { const t = new Int32Array(256);
  for (let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c = c&1 ? 0xEDB88320 ^ (c>>>1) : c>>>1; t[n]=c; }
  return t; })();
const crc32 = b => { let c = 0xFFFFFFFF;
  for (const x of b) c = T[(c ^ x) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0; };

const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

// rgba: Uint8Array of w*h*4
export function encodePNG(rgba, w, h) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                       // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4)
      .copy(raw, y * (w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type 6 = RGBA  <- what the ICO decoder requires
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// The mark, on the same 16-unit grid as icon.svg. Keep in sync.
const BONE = [0xec,0xe7,0xdd], INK = [0x0b,0x0b,0x0d], RUST = [0xb4,0x45,0x2f];
const INK_RECTS = [
  [1,2,6,2],[1,2,2,6],[1,6,6,2],[5,6,2,6],[1,10,6,2],           // S
  [9,2,2,10],[9,2,6,2],[13,2,2,6],[9,6,6,2],                     // P
];
const RUST_RECTS = [[0,14,16,2]];

export function raster(size) {
  if (size % 16) throw new Error(`size ${size} is not a whole multiple of the 16 grid`);
  const s = size / 16;
  const px = new Uint8Array(size * size * 4);
  const put = (x,y,c) => { const i = (y*size+x)*4; px[i]=c[0]; px[i+1]=c[1]; px[i+2]=c[2]; px[i+3]=255; };
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) put(x,y,BONE);
  const fill = (rects, c) => { for (const [rx,ry,rw,rh] of rects)
    for (let y=ry*s; y<(ry+rh)*s; y++) for (let x=rx*s; x<(rx+rw)*s; x++) put(x,y,c); };
  fill(INK_RECTS, INK); fill(RUST_RECTS, RUST);
  return px;
}
