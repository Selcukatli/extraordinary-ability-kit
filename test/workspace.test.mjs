// Tests for the petition-workspace scripts: scaffold-case.sh and add-evidence.mjs.
// Each test runs the real script against a fresh temp directory.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAFFOLD = join(ROOT, "skills/petition-workspace/scripts/scaffold-case.sh");
const ADD = join(ROOT, "skills/petition-workspace/scripts/add-evidence.mjs");

const tmp = (t) => {
  const dir = mkdtempSync(join(tmpdir(), "eak-ws-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};
const scaffold = (...args) => spawnSync("bash", [SCAFFOLD, ...args], { encoding: "utf8" });
const add = (...args) => spawnSync(process.execPath, [ADD, ...args], { encoding: "utf8" });
const evidenceList = (caseDir, p) => readFileSync(join(caseDir, p, "evidence-list.md"), "utf8");
const criterionHeadings = (md) => md.match(/^### Criterion .*$/gm) ?? [];
// Rows of the table under "### Criterion N:", header and separator excluded.
const rowsUnder = (md, n) => {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^### Criterion ${n}:`).test(l));
  const rows = [];
  for (let i = start + 1; i < lines.length && !/^#{1,3}\s/.test(lines[i]); i++) {
    if (lines[i].startsWith("|") && !/^\|\s*(Exhibit #|-)/.test(lines[i])) rows.push(lines[i]);
  }
  return rows;
};
const newCase = (t, type = "o1a") => {
  const caseDir = join(tmp(t), "case");
  const r = scaffold(caseDir, type);
  assert.equal(r.status, 0, r.stderr);
  return caseDir;
};
const file = (t, name, body = "x") => {
  const p = join(tmp(t), name);
  writeFileSync(p, body);
  return p;
};

// ---- scaffold-case.sh -------------------------------------------------------

test("scaffold: O-1A gets 8 criteria and EB-1A gets 10, with diverging names", (t) => {
  const caseDir = newCase(t, "both");
  const o1a = criterionHeadings(evidenceList(caseDir, "o1a"));
  const eb1a = criterionHeadings(evidenceList(caseDir, "eb1a"));
  assert.equal(o1a.length, 8);
  assert.equal(eb1a.length, 10);
  assert.equal(o1a[6], "### Criterion 7: Critical Role");
  assert.equal(eb1a[6], "### Criterion 7: Exhibitions");
  assert.equal(eb1a[9], "### Criterion 10: Commercial Success");
});

test("scaffold: creates per-criterion argument files and shared folders", (t) => {
  const caseDir = newCase(t, "eb1a");
  const args = readdirSync(join(caseDir, "eb1a/evidence-by-criterion")).sort();
  assert.equal(args.length, 10);
  assert.equal(args[0], "01-awards.md");
  assert.equal(args[7], "08-leading-or-critical-role.md");
  for (const p of ["case-overview.md", "README.md", ".gitignore", "eb1a/overview.md",
                   "eb1a/petition-narrative.md", "resources/speaking", "communications/attorneys"]) {
    assert.ok(existsSync(join(caseDir, p)), `missing ${p}`);
  }
  assert.ok(!existsSync(join(caseDir, "o1a")), "eb1a-only case must not scaffold o1a");
});

test("scaffold: fills template placeholders in the evidence list frontmatter", (t) => {
  const md = evidenceList(newCase(t, "o1a"), "o1a");
  assert.match(md, /^petition_type: o1a$/m);
  assert.match(md, /^updated: \d{4}-\d{2}-\d{2}$/m);
  assert.doesNotMatch(md, /PETITION_TYPE|TODAY/);
});

test("scaffold: defaults to o1a", (t) => {
  const caseDir = join(tmp(t), "case");
  assert.equal(scaffold(caseDir).status, 0);
  assert.ok(existsSync(join(caseDir, "o1a/evidence-list.md")));
  assert.ok(!existsSync(join(caseDir, "eb1a")));
});

test("scaffold: rejects an unknown petition type", (t) => {
  const r = scaffold(join(tmp(t), "case"), "h1b");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /type must be/);
});

test("scaffold: refuses a non-empty target directory", (t) => {
  const dir = tmp(t);
  writeFileSync(join(dir, "keep.txt"), "mine");
  const r = scaffold(dir, "o1a");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /non-empty/);
  assert.deepEqual(readdirSync(dir), ["keep.txt"]);
});

// ---- add-evidence.mjs -------------------------------------------------------

test("add-evidence: files a copy and appends a collected row under the right criterion", (t) => {
  const caseDir = newCase(t);
  const src = file(t, "Screenshot 2026-01-05 at 10.00.00.png");
  const r = add(caseDir, "-c", "1", "-d", "Best Paper Award 2025", src);
  assert.equal(r.status, 0, r.stderr);

  const dest = join(caseDir, "resources/awards/best-paper-award-2025/best-paper-award-2025.png");
  assert.ok(existsSync(dest), "renamed screenshot should be filed under the slug");
  assert.ok(existsSync(src), "default is copy, not move");
  assert.deepEqual(rowsUnder(evidenceList(caseDir, "o1a"), 1), [
    "| | Best Paper Award 2025 | [x] collected | `resources/awards/best-paper-award-2025/best-paper-award-2025.png` |",
  ]);
  assert.deepEqual(rowsUnder(evidenceList(caseDir, "o1a"), 2), [], "other criteria untouched");
});

test("add-evidence: criterion 7 routes differently for O-1A and EB-1A", (t) => {
  const caseDir = newCase(t, "both");
  const src = file(t, "f.png");
  assert.equal(add(caseDir, "-p", "o1a", "-c", "7", "-d", "Org chart", src).status, 0);
  assert.equal(add(caseDir, "-p", "eb1a", "-c", "7", "-d", "Showcase demo", src).status, 0);
  assert.ok(existsSync(join(caseDir, "resources/company-docs/org-chart/f.png")));
  assert.ok(existsSync(join(caseDir, "resources/speaking/showcase-demo/f.png")));
});

test("add-evidence: last criterion in the file still gets its row", (t) => {
  const caseDir = newCase(t, "eb1a");
  const r = add(caseDir, "-c", "10", "-d", "Sales figures", file(t, "sales.pdf"));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(rowsUnder(evidenceList(caseDir, "eb1a"), 10).length, 1);
});

test("add-evidence: a URL records a pending row and copies nothing", (t) => {
  const caseDir = newCase(t);
  const r = add(caseDir, "-c", "3", "-d", "TechCrunch profile", "-u", "https://example.com/a");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(rowsUnder(evidenceList(caseDir, "o1a"), 3), [
    "| | TechCrunch profile | [ ] pending | https://example.com/a |",
  ]);
  assert.deepEqual(readdirSync(join(caseDir, "resources/press")), []);
});

test("add-evidence: multiple files get numbered names and one combined row", (t) => {
  const caseDir = newCase(t);
  const a = file(t, "IMG_0001.jpg");
  const b = join(dirname(a), "IMG_0002.jpg");
  writeFileSync(b, "y");
  const r = add(caseDir, "-c", "4", "-d", "Reviewer invite", "-S", "~", a, b);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(rowsUnder(evidenceList(caseDir, "o1a"), 4), [
    "| | Reviewer invite | [~] partial | `resources/judging/reviewer-invite/reviewer-invite-1.jpg` + `resources/judging/reviewer-invite/reviewer-invite-2.jpg` |",
  ]);
});

test("add-evidence: --move removes the source", (t) => {
  const caseDir = newCase(t);
  const src = file(t, "cert.pdf");
  assert.equal(add(caseDir, "-c", "2", "-d", "IEEE Senior Member", "--move", src).status, 0);
  assert.ok(!existsSync(src));
  assert.ok(existsSync(join(caseDir, "resources/membership/ieee-senior-member/cert.pdf")));
});

test("add-evidence: --dry-run changes nothing", (t) => {
  const caseDir = newCase(t);
  const before = evidenceList(caseDir, "o1a");
  const r = add(caseDir, "-c", "1", "-d", "Award", "--dry-run", file(t, "a.png"));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /would append/);
  assert.equal(evidenceList(caseDir, "o1a"), before);
  assert.deepEqual(readdirSync(join(caseDir, "resources/awards")), []);
});

test("add-evidence: rejects a criterion that does not exist for the petition", (t) => {
  const caseDir = newCase(t);
  const r = add(caseDir, "-c", "9", "-d", "x", file(t, "a.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /criterion 9 is not valid for o1a \(valid: 1-8\)/);
});

test("add-evidence: requires -p when the case has several petitions", (t) => {
  const r = add(newCase(t, "both"), "-c", "1", "-d", "x", file(t, "a.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /several petitions .* pass -p/);
});

test("add-evidence: refuses a formatter-corrupted evidence list", (t) => {
  const caseDir = newCase(t);
  const listPath = join(caseDir, "o1a/evidence-list.md");
  writeFileSync(listPath, readFileSync(listPath, "utf8") + "| | old | \\[x\\] collected | a |\n");
  const r = add(caseDir, "-c", "1", "-d", "x", file(t, "a.png"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /escaped status markers/);
});

test("add-evidence: a name clash aborts before filing anything", (t) => {
  const caseDir = newCase(t);
  const dir = join(tmp(t), "src");
  mkdirSync(dir);
  writeFileSync(join(dir, "first.pdf"), "1");
  writeFileSync(join(dir, "second.pdf"), "2");
  const dest = join(caseDir, "resources/awards/award");
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, "second.pdf"), "already here");
  const before = evidenceList(caseDir, "o1a");

  const r = add(caseDir, "-c", "1", "-d", "Award", join(dir, "first.pdf"), join(dir, "second.pdf"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /refusing to overwrite/);
  assert.deepEqual(readdirSync(dest), ["second.pdf"], "first.pdf must not be filed without a row");
  assert.equal(readFileSync(join(dest, "second.pdf"), "utf8"), "already here");
  assert.equal(evidenceList(caseDir, "o1a"), before);
});
