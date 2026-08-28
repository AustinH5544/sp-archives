import { writeFileSync } from "fs";
import { encodePNG, raster } from "./icon-raster.mjs";
const app = process.argv[2];

const mk = s => encodePNG(raster(s), s, s);

// apple-icon at 192 (12x) rather than the conventional 180: 180 is not a
// whole multiple of the 16 grid, so it would soften every edge.
const apple = mk(192);
writeFileSync(`${app}/apple-icon.png`, apple);
console.log(`apple-icon.png  ${apple.length}b  192x192`);

const sizes = [16, 32, 48];
const pngs = sizes.map(mk);
const header = Buffer.alloc(6);
header.writeUInt16LE(0,0); header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
let offset = 6 + 16*sizes.length;
const entries = sizes.map((s,i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s,0); e.writeUInt8(s,1); e.writeUInt8(0,2); e.writeUInt8(0,3);
  e.writeUInt16LE(1,4); e.writeUInt16LE(32,6);
  e.writeUInt32LE(pngs[i].length,8); e.writeUInt32LE(offset,12);
  offset += pngs[i].length; return e;
});
const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync(`${app}/favicon.ico`, ico);
console.log(`favicon.ico     ${ico.length}b  ${sizes.join("/")}`);
