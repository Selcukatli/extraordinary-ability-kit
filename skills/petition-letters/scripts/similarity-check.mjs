#!/usr/bin/env node
// Flag cross-letter homogeneity before letters go out for signature.
//
// USCIS treats identical phrasing across recommendation letters as a credibility
// signal: it undercuts the independence the letters exist to demonstrate. An LLM
// drafting a set will converge on one skeleton and one vocabulary unless checked.
//
// Usage: node similarity-check.mjs <dir-of-letters> [--json]

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const dir = process.argv[2];
const asJson = process.argv.includes("--json");
if (!dir) {
  console.error("usage: similarity-check.mjs <dir-of-letters> [--json]");
  process.exit(2);
}

const SHINGLE = 6;        // words per shingle
const PAIR_WARN = 0.12;   // Jaccard over shingles
const PAIR_FAIL = 0.22;
const OPENING_WORDS = 4;

const files = readdirSync(dir)
  .filter((f) => /\.(md|txt)$/i.test(f))
  .map((f) => join(dir, f))
  .filter((f) => statSync(f).isFile());

if (files.length < 2) {
  console.error(`need at least 2 letters in ${dir}, found ${files.length}`);
  process.exit(2);
}

const norm = (s) =>
  s
    .replace(/^---\n[\s\S]*?\n---\n/, "")   // frontmatter
    .replace(/<!--[\s\S]*?-->/g, "")        // comments
    .replace(/[*_`#>|\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

const words = (s) => norm(s).split(" ").filter(Boolean);

const shingles = (ws) => {
  const out = new Set();
  for (let i = 0; i + SHINGLE <= ws.length; i++) out.add(ws.slice(i, i + SHINGLE).join(" "));
  return out;
};

const sentences = (raw) =>
  norm(raw)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(" ").length >= 5);

const docs = files.map((f) => {
  const raw = readFileSync(f, "utf8");
  const ws = words(raw);
  return { file: basename(f), ws, sh: shingles(ws), sents: sentences(raw) };
});

// --- pairwise overlap ---------------------------------------------------------
const pairs = [];
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const a = docs[i], b = docs[j];
    const shared = [...a.sh].filter((s) => b.sh.has(s));
    const union = new Set([...a.sh, ...b.sh]).size || 1;
    pairs.push({
      a: a.file, b: b.file,
      jaccard: shared.length / union,
      examples: shared.sort((x, y) => y.length - x.length).slice(0, 5),
    });
  }
}
pairs.sort((x, y) => y.jaccard - x.jaccard);

// --- repeated sentence openings across DIFFERENT letters ----------------------
const openings = new Map();
for (const d of docs) {
  for (const s of d.sents) {
    const key = s.split(" ").slice(0, OPENING_WORDS).join(" ");
    if (!openings.has(key)) openings.set(key, new Set());
    openings.get(key).add(d.file);
  }
}
const sharedOpenings = [...openings.entries()]
  .filter(([, set]) => set.size > 1)
  .map(([k, set]) => ({ opening: k, letters: [...set] }))
  .sort((a, b) => b.letters.length - a.letters.length);

// --- length spread (identical structure often shows up as identical length) ---
const lens = docs.map((d) => d.ws.length);
const spread = (Math.max(...lens) - Math.min(...lens)) / (Math.max(...lens) || 1);

const failures = pairs.filter((p) => p.jaccard >= PAIR_FAIL);
const warnings = pairs.filter((p) => p.jaccard >= PAIR_WARN && p.jaccard < PAIR_FAIL);

if (asJson) {
  console.log(JSON.stringify({ pairs, sharedOpenings, lengths: Object.fromEntries(docs.map((d, i) => [d.file, lens[i]])), spread, failures: failures.length }, null, 2));
} else {
  console.log(`Checked ${docs.length} letters in ${dir}\n`);
  console.log("Pairwise phrase overlap (6-word shingles, Jaccard):");
  for (const p of pairs.slice(0, 10)) {
    const flag = p.jaccard >= PAIR_FAIL ? "FAIL" : p.jaccard >= PAIR_WARN ? "WARN" : "ok  ";
    console.log(`  [${flag}] ${(p.jaccard * 100).toFixed(1).padStart(5)}%  ${p.a} <-> ${p.b}`);
    if (p.jaccard >= PAIR_WARN) for (const e of p.examples) console.log(`           shared: "${e}"`);
  }
  if (sharedOpenings.length) {
    console.log(`\nSentence openings reused across letters (${sharedOpenings.length}):`);
    for (const o of sharedOpenings.slice(0, 10))
      console.log(`  "${o.opening}…"  in ${o.letters.join(", ")}`);
  } else {
    console.log("\nNo sentence openings reused across letters.");
  }
  console.log(`\nLength spread: ${(spread * 100).toFixed(0)}% (want >25% — letters of near-identical length read as one template)`);
  console.log(spread < 0.25 ? "  [WARN] letters are suspiciously uniform in length" : "  ok");
  console.log(`\n${failures.length} failing pair(s), ${warnings.length} warning(s).`);
}

process.exit(failures.length ? 1 : 0);
