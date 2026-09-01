#!/usr/bin/env node
// Validate every skills/<name>/SKILL.md.
//
// The `npx skills` installer parses each SKILL.md's YAML frontmatter with gray-matter
// and SKIPS any skill whose frontmatter fails to parse — silently, with no error. The
// usual cause is an unquoted ": " (colon-space) inside `description`. This check parses
// with the same library and fails loudly instead.
//
// Run: node scripts/validate-skills.mjs

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import yaml from "js-yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const errors = [];
const warnings = [];
let checked = 0;

for (const entry of readdirSync(skillsDir).sort()) {
  const dir = join(skillsDir, entry);
  if (!statSync(dir).isDirectory()) continue;
  const rel = `skills/${entry}/SKILL.md`;
  const file = join(dir, "SKILL.md");

  if (!existsSync(file)) { errors.push(`${rel}: missing SKILL.md`); continue; }
  checked++;

  let data;
  try {
    data = matter(readFileSync(file, "utf8")).data;
  } catch (e) {
    errors.push(`${rel}: frontmatter failed to parse -> ${e.message.split("\n")[0]}. ` +
      `A common cause is an unquoted ': ' in 'description' — wrap the value in double quotes.`);
    continue;
  }

  if (!data.name) errors.push(`${rel}: missing 'name'`);
  else if (data.name !== entry) errors.push(`${rel}: name '${data.name}' != directory '${entry}'`);
  if (!data.description) errors.push(`${rel}: missing 'description'`);
  else if (data.description.length < 60) warnings.push(`${rel}: description is very short (${data.description.length} chars) — it is what an agent matches on`);
  else if (data.description.length > 1024) errors.push(`${rel}: description too long (${data.description.length} chars)`);
}

// Criteria manifests must stay internally consistent — this is the file that prevents
// the 8-vs-10 criteria bug from reappearing.
const critDir = join(skillsDir, "petition-strategy/references/criteria");
if (existsSync(critDir)) {
  for (const f of readdirSync(critDir).filter((f) => f.endsWith(".yaml"))) {
    const rel = `criteria/${f}`;
    let d;
    try { d = yaml.load(readFileSync(join(critDir, f), "utf8")); }
    catch (e) { errors.push(`${rel}: YAML parse failed -> ${e.message.split("\n")[0]}`); continue; }
    if (!Array.isArray(d.criteria)) { errors.push(`${rel}: no criteria array`); continue; }
    if (d.criteria.length !== d.criteria_total)
      errors.push(`${rel}: ${d.criteria.length} criteria but criteria_total=${d.criteria_total}`);
    d.criteria.forEach((c, i) => {
      if (c.id !== i + 1) errors.push(`${rel}: criterion at index ${i} has id ${c.id}, expected ${i + 1}`);
      for (const k of ["key", "name", "text"]) if (!c[k]) errors.push(`${rel}: criterion ${c.id} missing '${k}'`);
    });
    if (!d.criteria_required) errors.push(`${rel}: missing criteria_required`);
    checked++;
  }
}

for (const w of warnings) console.warn(`warn: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`validate-skills: ${checked} file(s) OK${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);
