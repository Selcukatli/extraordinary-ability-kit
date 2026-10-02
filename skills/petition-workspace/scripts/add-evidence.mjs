#!/usr/bin/env node
// File evidence into a case workspace and record it in evidence-list.md, atomically.
//
// The convention is easy to describe and tedious to follow by hand: make the right
// folder, name the files, and append a row to the right criterion table. Doing it by
// hand is where tracking discipline dies — files land in Downloads, rows never get
// written, and by month six nobody knows what has been collected.
//
// Usage:
//   add-evidence.mjs <case-dir> -c <criterion#> -d "description" [options] <file...>
//
// Options:
//   -p, --petition <slug>   petition dir (default: the only one, or required if several)
//   -s, --slug <slug>       folder name under the category (default: from description)
//   -S, --status <marker>   x | ~ | ' ' | ! | -   (default: x collected)
//   -u, --url <url>         record a URL instead of files (implies status pending)
//       --move              move files instead of copying
//       --dry-run           show what would happen

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";

// Criterion -> resources category. Numbering differs between petition types:
// O-1A criterion 7 is critical role; EB-1A criterion 7 is artistic exhibitions.
const CATEGORY = {
  o1a:  { 1:"awards", 2:"membership", 3:"press", 4:"judging", 5:"patents",
          6:"publications", 7:"company-docs", 8:"compensation" },
  eb1a: { 1:"awards", 2:"membership", 3:"press", 4:"judging", 5:"patents",
          6:"publications", 7:"speaking", 8:"company-docs", 9:"compensation", 10:"company-docs" },
};

const STATUS_LABEL = { "x":"collected", "~":"partial", " ":"pending", "!":"blocked", "-":"removed" };

// ---- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = (long, short) => {
  const i = argv.findIndex((a) => a === long || a === short);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  argv.splice(i, 2);
  return v;
};
const flag = (name) => { const i = argv.indexOf(name); if (i === -1) return false; argv.splice(i, 1); return true; };

const dryRun = flag("--dry-run");
const move   = flag("--move");
const criterion = opt("--criterion", "-c");
const desc      = opt("--description", "-d");
const petArg    = opt("--petition", "-p");
let   slug      = opt("--slug", "-s");
let   status    = opt("--status", "-S");
const url       = opt("--url", "-u");
const caseDir = argv.shift();
const files = argv;

const die = (m) => { console.error(m); process.exit(2); };
if (!caseDir || !existsSync(caseDir)) die("usage: add-evidence.mjs <case-dir> -c <criterion#> -d \"description\" <file...>");
if (!criterion || !/^\d+$/.test(criterion)) die("-c/--criterion is required and must be a number");
if (!desc) die('-d/--description is required');
if (!url && !files.length) die("provide at least one file, or -u <url>");
if (url && files.length) die("use files or --url, not both");

// ---- resolve petition -------------------------------------------------------
const petitions = readdirSync(caseDir)
  .filter((d) => { try { return statSync(join(caseDir, d)).isDirectory(); } catch { return false; } })
  .filter((d) => existsSync(join(caseDir, d, "evidence-list.md")));
if (!petitions.length) die(`no <petition>/evidence-list.md under ${caseDir}`);
const petition = petArg || (petitions.length === 1 ? petitions[0] : die(`several petitions (${petitions.join(", ")}) — pass -p`));
if (!petitions.includes(petition)) die(`no such petition '${petition}' (have: ${petitions.join(", ")})`);

const map = CATEGORY[petition];
if (!map) die(`unknown petition type '${petition}' — expected one of: ${Object.keys(CATEGORY).join(", ")}`);
const category = map[Number(criterion)];
if (!category) die(`criterion ${criterion} is not valid for ${petition} (valid: 1-${Object.keys(map).length})`);

// ---- slug + status ----------------------------------------------------------
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").slice(0, 6).join("-");
slug = slug || slugify(desc);
status = status === undefined ? (url ? " " : "x") : status;
if (!(status in STATUS_LABEL)) die(`--status must be one of: ${Object.keys(STATUS_LABEL).map((s) => `'${s}'`).join(", ")}`);

const destDir = join(caseDir, "resources", category, slug);
const relDir = `resources/${category}/${slug}/`;

// ---- plan -------------------------------------------------------------------
const planned = files.map((f) => {
  if (!existsSync(f)) die(`no such file: ${f}`);
  const ext = extname(f).toLowerCase();
  const base = basename(f, extname(f));
  const clean = /^(screenshot|image|img|download|untitled|scan)/i.test(base) || /\d{4}-\d{2}-\d{2} at /i.test(base)
    ? `${slug}${files.length > 1 ? "-" + (files.indexOf(f) + 1) : ""}${ext}`
    : `${slugify(base)}${ext}`;
  return { from: f, to: join(destDir, clean), name: clean };
});

const source = url ? url : planned.map((p) => `\`${relDir}${p.name}\``).join(" + ");
const row = `| | ${desc} | [${status}] ${STATUS_LABEL[status]} | ${source} |`;

// ---- insert the row into the right criterion table --------------------------
const listPath = join(caseDir, petition, "evidence-list.md");
const md = readFileSync(listPath, "utf8");

// Check the body only — the template's own warning comment contains a literal \[x\].
const mdBody = md.replace(/<!--[\s\S]*?-->/g, "");
if (/\\\[[x~ !-]\\\]/.test(mdBody)) {
  die(`${listPath} has escaped status markers (\\[x\\]) — a markdown formatter has\n` +
      `corrupted it. Restore it before adding evidence, and exclude the case workspace\n` +
      `from your editor's format-on-save.`);
}

const lines = md.split("\n");
const headRe = new RegExp(`^###\\s+Criterion\\s+${criterion}\\s*:`, "i");
let start = lines.findIndex((l) => headRe.test(l));
if (start === -1) die(`no "### Criterion ${criterion}:" heading in ${listPath}`);

let end = lines.findIndex((l, i) => i > start && /^#{1,3}\s/.test(l));
if (end === -1) end = lines.length;
let lastRow = -1;
for (let i = start; i < end; i++) if (lines[i].trim().startsWith("|")) lastRow = i;
if (lastRow === -1) die(`criterion ${criterion} has no table in ${listPath}`);

lines.splice(lastRow + 1, 0, row);
const updated = lines.join("\n").replace(/^(updated:\s*).*$/m, `$1${new Date().toISOString().slice(0, 10)}`);

// ---- execute ----------------------------------------------------------------
if (dryRun) {
  console.log(`would file into ${relDir}`);
  for (const p of planned) console.log(`  ${move ? "move" : "copy"} ${p.from} -> ${relDir}${p.name}`);
  console.log(`would append to ${petition}/evidence-list.md under Criterion ${criterion}:`);
  console.log(`  ${row}`);
  process.exit(0);
}

// Check every destination before touching any, so a clash can't leave files filed without a row.
for (const p of planned) if (existsSync(p.to)) die(`refusing to overwrite ${p.to}`);
if (planned.length) {
  mkdirSync(destDir, { recursive: true });
  for (const p of planned) {
    if (move) renameSync(p.from, p.to); else copyFileSync(p.from, p.to);
  }
}
writeFileSync(listPath, updated);

console.log(`filed under criterion ${criterion} (${category}) of ${petition}`);
for (const p of planned) console.log(`  ${relDir}${p.name}`);
if (url) console.log(`  url: ${url}`);
console.log(`recorded in ${petition}/evidence-list.md as [${status}] ${STATUS_LABEL[status]}`);
