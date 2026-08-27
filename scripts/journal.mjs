// Journal on/off switch.
//
//   npm run journal:off   hide it
//   npm run journal:on    bring it back
//
// Two things have to move together, which is why this is a script and not a
// boolean you edit by hand:
//
//   1. The route folder. Next's App Router ignores folders starting with "_",
//      so src/app/_journal generates no routes at all. A flag alone is not
//      enough: notFound() still writes every journal HTML file into out/, and
//      a static host serves those with a 200.
//   2. JOURNAL_ENABLED in src/lib/config.ts, which drives the nav and footer
//      links.
//
// Leave them out of sync and you either ship reachable pages with no links to
// them, or links pointing at 404s.

import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const routed = join(root, "src", "app", "journal");
const hidden = join(root, "src", "app", "_journal");
const config = join(root, "src", "lib", "config.ts");

const mode = process.argv[2];
if (mode !== "on" && mode !== "off") {
  console.error("usage: node scripts/journal.mjs <on|off>");
  process.exit(1);
}

const wantOn = mode === "on";
const from = wantOn ? hidden : routed;
const to = wantOn ? routed : hidden;

if (!existsSync(from) && existsSync(to)) {
  console.log(`Journal is already ${mode}. Nothing to do.`);
  process.exit(0);
}
if (!existsSync(from)) {
  console.error(`Cannot find ${from}. Journal folder is missing entirely.`);
  process.exit(1);
}

renameSync(from, to);

const src = readFileSync(config, "utf8");
const next = src.replace(
  /export const JOURNAL_ENABLED = (true|false);/,
  `export const JOURNAL_ENABLED = ${wantOn};`,
);
if (next === src) {
  console.error(`Could not find JOURNAL_ENABLED in ${config}. Folder was moved; fix the flag by hand.`);
  process.exit(1);
}
writeFileSync(config, next);

console.log(`Journal is now ${mode.toUpperCase()}.`);
console.log(`  routes  ${wantOn ? "src/app/journal (live)" : "src/app/_journal (not routed)"}`);
console.log(`  flag    JOURNAL_ENABLED = ${wantOn}`);
console.log(`\nRun \`npm run build\` to apply.`);
