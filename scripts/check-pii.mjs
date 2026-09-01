#!/usr/bin/env node
// Guard against personal data leaking into a repo derived from a real immigration case.
//
// Generic patterns live here (safe to commit). Case-specific names, companies, and
// employers go in `.pii-denylist` — one term per line, gitignored, so the guard can
// check for them without the repo publishing the very list it is protecting.
//
// Run: node scripts/check-pii.mjs

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set([".git", "node_modules", ".source-repo-baseline"]);

const PATTERNS = [
  { name: "absolute home path", re: /\/(?:Users|home)\/[a-z0-9._-]+\//gi },
  { name: "email address", re: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
    allow: /@(?:example\.(?:com|org)|uscis\.gov)\b/i },
  { name: "USCIS receipt number", re: /\b(?:IOE|EAC|WAC|LIN|SRC|MSC)\d{10}\b/g },
  // Consular annexes legitimately carry public embassy appointment lines.
  { name: "US phone number", re: /\b(?:\+1[ -]?)?\(?\d{3}\)?[ -]\d{3}[ -]\d{4}\b/g,
    allowIn: /references\/consular\// },
  { name: "SSN-shaped number", re: /\b\d{3}-\d{2}-\d{4}\b/g },
];

const denyFile = join(root, ".pii-denylist");
const deny = existsSync(denyFile)
  ? readFileSync(denyFile, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  : [];

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(md|mjs|js|ts|yaml|yml|json|sh|html|txt)$/i.test(e)) out.push(p);
  }
  return out;
};

const hits = [];
for (const file of walk(root)) {
  const rel = relative(root, file);
  const text = readFileSync(file, "utf8");
  text.split("\n").forEach((line, i) => {
    for (const p of PATTERNS) {
      if (p.allowIn && p.allowIn.test(rel)) continue;
      for (const m of line.match(p.re) || []) {
        if (p.allow && p.allow.test(m)) continue;
        hits.push({ rel, line: i + 1, kind: p.name, match: m });
      }
    }
    for (const term of deny) {
      if (line.toLowerCase().includes(term.toLowerCase()))
        hits.push({ rel, line: i + 1, kind: "denylist term", match: term });
    }
  });
}

if (hits.length) {
  console.error(`check-pii: ${hits.length} potential leak(s)\n`);
  for (const h of hits) console.error(`  ${h.rel}:${h.line}  [${h.kind}]  ${h.match}`);
  console.error("\nScrub these, or add a deliberate exception to scripts/check-pii.mjs.");
  process.exit(1);
}
console.log("check-pii: clean");
