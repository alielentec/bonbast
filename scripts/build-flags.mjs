// Regenerate the flag SVGs at build time. Runs in two steps:
// 1. `react-flagpack` CLI copies its 750+ flags into public/flags/{S,M,L}.
//    Their CLI ships lowercase folder names, but the React component
//    requests uppercase paths — Linux is case-sensitive, so rename.
// 2. Add a custom EU flag (flagpack doesn't ship one).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const flagsDir = join(root, "public", "flags");

console.log("[flags] running react-flagpack CLI…");
// execFileSync avoids spawning a shell — no injection surface even though
// args here are static. npx is found via PATH.
execFileSync("npx", ["react-flagpack"], { stdio: "inherit", cwd: root });

// macOS APFS is case-insensitive, but Linux EXT4 (Vercel) is case-sensitive.
// flagpack writes lowercase but requests uppercase; rename to match.
for (const lower of ["s", "m", "l"]) {
  const lowerPath = join(flagsDir, lower);
  const upperPath = join(flagsDir, lower.toUpperCase());
  if (existsSync(lowerPath) && !existsSync(upperPath)) {
    renameSync(lowerPath, upperPath);
    console.log(`[flags] renamed ${lower}/ → ${lower.toUpperCase()}/`);
  }
}

// Generate the EU flag in all three size folders.
const sizes = [
  { name: "S", w: 16, h: 12 },
  { name: "M", w: 20, h: 15 },
  { name: "L", w: 32, h: 24 },
];

for (const { name, w, h } of sizes) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.4;
  const dotR = Math.min(w, h) * 0.045;
  const stars = [];
  for (let i = 0; i < 12; i++) {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const x = (cx + r * Math.cos(a)).toFixed(2);
    const y = (cy + r * Math.sin(a)).toFixed(2);
    stars.push(`  <circle cx="${x}" cy="${y}" r="${dotR.toFixed(2)}" fill="#FFCC00"/>`);
  }
  const svg = [
    `<svg width="${w}" height="${h}" fill="none" xmlns="http://www.w3.org/2000/svg">`,
    `  <rect width="${w}" height="${h}" fill="#003399"/>`,
    ...stars,
    `</svg>`,
  ].join("\n");
  const dir = join(flagsDir, name);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "EU.svg"), svg);
}
console.log("[flags] EU custom flag written for S/M/L.");
console.log("[flags] done.");
