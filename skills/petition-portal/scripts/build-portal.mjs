#!/usr/bin/env node
// Build a self-contained HTML review packet from a case workspace.
//
// One file, no server, no database, no auth service, no deploy. Open it locally,
// email it, or drop it on any static host. Because it is a plain file, a case's
// tax returns and passport scans never land on someone else's infrastructure.
//
// Usage: node build-portal.mjs <case-dir> [-o out.html]

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const caseDir = args[0];
const outIdx = args.indexOf("-o");
const outFile = outIdx !== -1 ? args[outIdx + 1] : join(caseDir || ".", "review-packet.html");
if (!caseDir) { console.error("usage: build-portal.mjs <case-dir> [-o out.html]"); process.exit(2); }

const STATUS = {
  "[x]": { key: "collected", label: "Collected" },
  "[~]": { key: "partial",   label: "Partial" },
  "[ ]": { key: "pending",   label: "Pending" },
  "[!]": { key: "blocked",   label: "Blocked" },
  "[-]": { key: "removed",   label: "Removed" },
};

function parseEvidenceList(md) {
  const criteria = [];
  let cur = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^###\s+Criterion\s+(\d+)\s*:\s*(.+?)\s*$/i);
    if (h) {
      cur = { number: Number(h[1]), name: h[2].replace(/\[\[.*?\|(.*?)\]\]/g, "$1").replace(/[\[\]]/g, ""), rows: [] };
      criteria.push(cur);
      continue;
    }
    if (!cur || !line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    if (/^-+$/.test(cells[0].replace(/[\s:]/g, "")) || /^Exhibit/i.test(cells[0])) continue;
    const marker = (cells[2].match(/\[[x~ !-]\]/) || [])[0];
    if (!marker) continue;
    cur.rows.push({ exhibit: cells[0], description: cells[1], status: STATUS[marker] || { key: "unknown", label: cells[2] }, source: cells[3] });
  }
  return criteria;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/~~([^~]+)~~/g, "<del>$1</del>");

const petitions = readdirSync(caseDir)
  .filter((d) => statSync(join(caseDir, d)).isDirectory())
  .filter((d) => existsSync(join(caseDir, d, "evidence-list.md")))
  .map((d) => ({ slug: d, criteria: parseEvidenceList(readFileSync(join(caseDir, d, "evidence-list.md"), "utf8")) }));

if (!petitions.length) { console.error(`no <petition>/evidence-list.md found under ${caseDir}`); process.exit(1); }

const overview = existsSync(join(caseDir, "case-overview.md")) ? readFileSync(join(caseDir, "case-overview.md"), "utf8") : "";
const applicant = (overview.match(/^-\s*Name:\s*(.+)$/m) || [])[1]?.trim() || "";
const field = (overview.match(/^-\s*\*\*Field of endeavor\*\*[^:]*:\s*(.+)$/m) || [])[1]?.trim() || "";
const tally = (rows, k) => rows.filter((r) => r.status.key === k).length;

const sections = petitions.map((p) => {
  const all = p.criteria.flatMap((c) => c.rows);
  const live = all.filter((r) => r.status.key !== "removed").length;
  return `
  <section>
    <h2>${esc(p.slug.toUpperCase())}</h2>
    <p class="tally"><strong>${tally(all, "collected")}</strong> of <strong>${live}</strong> exhibits collected
      · ${tally(all, "partial")} partial · ${tally(all, "pending")} pending · ${tally(all, "blocked")} blocked</p>
    ${p.criteria.map((c) => `
    <h3>Criterion ${c.number}: ${esc(c.name)}</h3>
    ${c.rows.length ? `<div class="wrap"><table>
      <thead><tr><th class="ex">#</th><th>Description</th><th class="st">Status</th><th>Source</th></tr></thead>
      <tbody>${c.rows.map((r) => `<tr class="s-${r.status.key}"><td class="ex">${esc(r.exhibit)}</td><td>${inline(r.description)}</td><td class="st"><span class="badge b-${r.status.key}">${esc(r.status.label)}</span></td><td class="src">${inline(r.source)}</td></tr>`).join("")}</tbody>
    </table></div>` : `<p class="empty">No exhibits recorded.</p>`}`).join("")}
  </section>`;
}).join("");

const html = `<title>Review Packet${applicant ? " — " + esc(applicant) : ""}</title>
<style>
  :root{--bg:#fbfaf8;--fg:#1c1b19;--mut:#6b6862;--line:#e3e0da;--card:#fff;
    --ok:#1a7f5a;--okbg:#e3f3ec;--part:#8a6d1f;--partbg:#faf1d8;--pend:#5a5a5a;--pendbg:#eeece8;
    --blk:#a13d2d;--blkbg:#fbe8e4;--rem:#8b8781;--rembg:#f0eeea;}
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#161513;--fg:#eceae6;--mut:#9a968f;
    --line:#302e2a;--card:#1e1d1a;--ok:#5fd3a4;--okbg:#153228;--part:#d9b451;--partbg:#332a13;
    --pend:#a8a49d;--pendbg:#282623;--blk:#f0907c;--blkbg:#361f1a;--rem:#7a766f;--rembg:#232120;}}
  :root[data-theme=dark]{--bg:#161513;--fg:#eceae6;--mut:#9a968f;--line:#302e2a;--card:#1e1d1a;
    --ok:#5fd3a4;--okbg:#153228;--part:#d9b451;--partbg:#332a13;--pend:#a8a49d;--pendbg:#282623;
    --blk:#f0907c;--blkbg:#361f1a;--rem:#7a766f;--rembg:#232120;}
  body{background:var(--bg);color:var(--fg);font:15px/1.6 ui-sans-serif,system-ui,-apple-system,sans-serif;margin:0;padding:2.5rem 1.25rem 5rem;}
  main{max-width:60rem;margin:0 auto;}
  h1{font-size:1.9rem;letter-spacing:-.02em;margin:0 0 .25rem;}
  .field{color:var(--mut);margin:0 0 .5rem;}
  .note{color:var(--mut);font-size:.85rem;border-left:2px solid var(--line);padding-left:.75rem;margin:1.5rem 0 2.5rem;}
  h2{font-size:1.3rem;margin:2.5rem 0 .25rem;padding-top:1.25rem;border-top:1px solid var(--line);}
  h3{font-size:1rem;margin:2rem 0 .5rem;color:var(--mut);font-weight:600;}
  .tally{color:var(--mut);margin:.25rem 0 0;font-size:.9rem;}
  .wrap{overflow-x:auto;}
  table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:6px;font-size:.87rem;}
  th,td{text-align:left;padding:.5rem .7rem;border-bottom:1px solid var(--line);vertical-align:top;}
  tbody tr:last-child td{border-bottom:0;}
  th{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:600;}
  .ex{width:2.5rem;} .st{width:6.5rem;} .src{color:var(--mut);font-size:.8rem;word-break:break-word;}
  code{font:.85em ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--rembg);padding:.1em .35em;border-radius:3px;}
  .badge{display:inline-block;padding:.1rem .45rem;border-radius:99px;font-size:.72rem;font-weight:600;white-space:nowrap;}
  .b-collected{background:var(--okbg);color:var(--ok);} .b-partial{background:var(--partbg);color:var(--part);}
  .b-pending{background:var(--pendbg);color:var(--pend);} .b-blocked{background:var(--blkbg);color:var(--blk);}
  .b-removed{background:var(--rembg);color:var(--rem);}
  tr.s-removed td{color:var(--rem);} .empty{color:var(--mut);font-style:italic;}
</style>
<main>
  <h1>Evidence Review Packet${applicant ? " — " + esc(applicant) : ""}</h1>
  ${field ? `<p class="field">Field of endeavor: <strong>${esc(field)}</strong></p>` : ""}
  <p class="note">Generated ${new Date().toISOString().slice(0, 10)} from the case workspace.
    Exhibit numbers are assigned at final assembly. This packet lists what evidence exists and where it
    lives; it is not a legal filing and not legal advice.</p>
  ${sections}
</main>`;

writeFileSync(outFile, html);
const total = petitions.reduce((n, p) => n + p.criteria.reduce((m, c) => m + c.rows.length, 0), 0);
console.log(`wrote ${outFile} — ${petitions.length} petition(s), ${total} exhibit rows`);
