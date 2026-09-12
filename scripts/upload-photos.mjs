// Upload shoot masters to the sp-archives-photos R2 bucket.
//
// Keys are content-addressed: <slug>/<NN>-<hash8>.jpg
//
// The hash is not decoration. Browsers cache the *transformed* URL, and the
// transformation URL embeds the source URL. With a stable key like 01.jpg a
// replaced photo would keep its URL and never reach anyone who had already
// loaded it. Content-addressing means a changed file is a changed key is a
// changed transformation URL, which is what makes immutable caching safe.
// The NN prefix keeps display order human-readable alongside it.
//
// Usage:
//   node scripts/upload-photos.mjs <manifest-out.json> [--limit N] [--dry]
//
// Writes a manifest the site can consume, so data.ts never hand-lists keys.

import { createHash } from "crypto";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const BUCKET = "sp-archives-photos";
const ROOT = "C:/Users/austi/Documents_HD/InnovateAndAmplify-Related/SP-Archives-Photos";

const SHOOTS = [
  { slug: "red-thread", dir: `${ROOT}/Sp-Archives-Maternity/Highlights` },
  { slug: "last-summer", dir: `${ROOT}/SP-Archives-Senior-or-portrait/Highlights` },
  { slug: "first-frost", dir: `${ROOT}/SP-Archives-Engagment/Highlights` },
];

const outPath = process.argv[2];
const limitArg = process.argv.indexOf("--limit");
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const dry = process.argv.includes("--dry");

if (!outPath) {
  console.error("usage: node scripts/upload-photos.mjs <manifest-out.json> [--limit N] [--dry]");
  process.exit(1);
}

// JPEG SOF parse - dimensions travel with the manifest so the site can set
// width/height and reserve layout space without reading the files again.
function dimensions(buf) {
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    if (m === 0xda) break;
    const len = buf.readUInt16BE(i + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc9, 0xca, 0xcb].includes(m)) {
      const s = buf.subarray(i + 4, i + 2 + len);
      return { h: s.readUInt16BE(1), w: s.readUInt16BE(3) };
    }
    i += 2 + len;
  }
  return { w: 0, h: 0 };
}

const manifest = {};
const failures = [];
let uploaded = 0, skipped = 0, bytes = 0;

for (const { slug, dir } of SHOOTS) {
  const files = readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).sort();
  manifest[slug] = [];
  console.log(`\n=== ${slug} (${files.length} files) ===`);

  for (const [idx, file] of files.entries()) {
    if (uploaded >= limit) { skipped += files.length - idx; break; }
    const abs = join(dir, file);
    const buf = readFileSync(abs);
    const hash = createHash("sha256").update(buf).digest("hex").slice(0, 8);
    const { w, h } = dimensions(buf);
    const key = `${slug}/${String(idx + 1).padStart(2, "0")}-${hash}.jpg`;

    manifest[slug].push({ key, w, h, bytes: buf.length, source: file });

    if (dry) {
      console.log(`  [dry] ${key}  ${w}x${h}  ${(buf.length / 1024 / 1024).toFixed(1)}MB`);
      continue;
    }

    // Paths MUST stay double-quoted. Several source files are named like
    // "MaterneB&W-1.jpg", and cmd.exe treats a bare & as a command
    // separator -- unquoted, it truncated the path at "MaterneB" and the
    // whole run died on the first file.
    const cmd =
      `npx wrangler r2 object put "${BUCKET}/${key}"` +
      ` --file "${abs}" --content-type "image/jpeg" --remote`;

    try {
      execSync(cmd, { stdio: ["ignore", "ignore", "pipe"] });
      uploaded++; bytes += buf.length;
      console.log(`  ${key}  ${w}x${h}  ${(buf.length / 1024 / 1024).toFixed(1)}MB  (${uploaded})`);
    } catch (e) {
      failures.push({ key, source: file, err: String(e.stderr || e).slice(0, 200) });
      console.log(`  FAILED ${key}  <- ${file}`);
    }
  }
}

writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nmanifest -> ${outPath}`);
console.log(`uploaded ${uploaded} objects, ${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB${skipped ? `, skipped ${skipped}` : ""}`);
if (failures.length) {
  console.log(`
${failures.length} FAILURE(S):`);
  for (const f of failures) console.log(`  ${f.source} -> ${f.key}
    ${f.err.replace(/\s+/g, " ").slice(0, 160)}`);
  process.exitCode = 1;
}
