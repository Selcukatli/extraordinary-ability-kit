# extraordinary-ability-kit — Design

**Date:** 2026-09-01
**Status:** Approved, in implementation

## Problem

Preparing an O-1A or EB-1A petition is an evidence-management problem disguised as a
legal one. An applicant must identify which regulatory criteria they can support,
collect dozens to hundreds of exhibits from the open web and personal archives,
organize them so an adjudicator can follow the argument, draft a petition narrative
and 5–10 recommendation letters, and hand a coherent package to an attorney.

Existing tooling addresses none of this. Applicants use ad-hoc folders, lose track of
what they have collected, and pay attorneys for assembly work rather than judgment.

## What this is

A dual-distribution toolkit — a Claude Code plugin and a set of `npx skills`-installable
agent skills — that helps a **self-preparing applicant** run their own O-1A or EB-1A
case: triage which criteria are viable, collect and organize evidence, draft the
petition and letters, and generate a read-only portal to hand to an attorney.

## What this is not

Not legal advice, and not a lawyer. The intended flow is explicit and stated in the
README, in the plugin description, and at the top of every drafting skill:

> Use this to collect and store evidence, organize your application, and draft the
> petition and recommendation letters. Then work with an immigration attorney to
> revise, rewrite, and file.

The self-help posture is deliberate. Preparing your own petition pro se is legal;
the residual risk is **reliance**, not unauthorized practice of law. That risk is
managed with dated sources, explicit uncertainty, and attorney-review gates — not by
weakening the tool.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Primary user | Self-preparing applicant, one case per workspace | The path the author actually walked; validatable. No client model, no case switcher. |
| Petition types (v1) | O-1A + EB-1A only, manifest-driven | Only ship law that has been personally verified. Adding O-1B / EB-2 NIW later is a manifest plus review, not a rewrite. |
| Drafting scope | Full drafts of narrative, letters, outreach; never auto-fill forms | Applicant-authored drafts are normal practice. Forms are signed under penalty of perjury. |
| Distribution | One repo, two channels: Claude Code plugin + `npx skills` | Reaches Codex and other runtimes without a second repo. |
| Portal | Generated from a template on demand | Nobody inherits a config that ever pointed at real case files. |

## Criteria are data, not prose

The originating workspace hardcoded a single ten-item criteria list, which is correct
for EB-1A and **wrong for O-1A** — O-1A has eight criteria under
8 CFR 214.2(o)(3)(iii)(B); *display at artistic exhibitions* and *commercial success in
the performing arts* belong to O-1B. That error was live in the reference for months
and surfaced only when a user asked about a non-EB-1A case.

Criteria therefore live in per-petition YAML manifests
(`skills/petition-strategy/references/criteria/*.yaml`), each declaring its own criteria
list, count required, regulatory citations, and per-criterion quirks (O-1A counts
*offered* remuneration; EB-1A counts only past). Skills read the manifest rather than
reciting a fixed list. Adding a petition type is a new manifest.

## Volatile facts are quarantined

Fees, approval rates, processing times, and policy-update dates live in exactly one
file — `references/volatile.md` — each with a `last-verified` date, and the README
states the verification date prominently. Stale law scattered through 1,400 lines of
prose is the most likely way an open-source legal toolkit harms someone.

## Distribution constraints

`npx skills add <repo> --skill <name>` installs **one** skill folder: its `SKILL.md`,
`references/`, `scripts/`, and `agents/openai.yaml`. It does not install `commands/`,
`agents/`, or any top-level `templates/`. Three consequences, binding on all
implementation:

1. **Logic lives in skills; commands are thin wrappers.** Scaffolding logic lives in
   `skills/petition-workspace/scripts/scaffold-case.sh`; `/new-case` shells out to it.
2. **Templates live inside their owning skill,** never top-level.
3. **Skills are self-contained.** No cross-skill relative paths. Cross-references are
   soft: "if `petition-strategy` is available, consult its criteria manifest; otherwise
   ask which petition type."

Skills carry a `petition-` prefix because installed skills share a global namespace with
every other skill a user has.

## Repo layout

```
extraordinary-ability-kit/
├── .claude-plugin/plugin.json
├── skills/
│   ├── petition-strategy/     legal knowledge, criteria manifests, consular annexes
│   ├── petition-workspace/    folder taxonomy, naming, scaffold-case.sh, case template
│   ├── petition-evidence/     capture workflow, screenshot standards, capture-article.js
│   ├── petition-letters/      recommendation letters + voice differentiation + similarity check
│   ├── petition-narrative/    petition letter / criterion arguments
│   ├── petition-status/       stage model — where am I, what is blocking
│   └── petition-portal/       Next.js portal template + generation guidance
├── commands/                  new-case, triage, status, new-portal (thin)
├── agents/evidence-collector.md
├── fixtures/sample-case/      fictional applicant, for docs + CI (never installed)
├── scripts/validate-skills.mjs
└── .github/workflows/validate-skills.yml
```

## The stage model

`petition-status` owns a seven-stage spine and reports position plus blockers:

`intake → criteria triage → evidence collection → drafting → attorney review → assembly → filing`

It is the front door. A stranger runs `/status` or invokes the skill and gets oriented
rather than facing seven skills with no idea which to open.

## Recommendation letters: voice differentiation

An LLM asked to draft eight letters produces eight letters with one skeleton, one
cadence, and the same three adjectives. USCIS treats that as a credibility signal:
identical phrasing across letters is a documented weak-letter characteristic and a
listed common mistake, because it undercuts the independence the letters exist to show.

`petition-letters` therefore carries explicit machinery, not just a prompt:

- a per-recommender voice profile (register, diction, sentence length, first-person
  stance, cultural/native-language register) captured before drafting;
- deliberately varied structure and length across the set;
- non-overlapping criterion coverage, tracked in a matrix;
- `scripts/similarity-check.mjs`, which reads all drafts together and reports shared
  n-grams, repeated openings, and near-duplicate sentences before anything is sent.

## PII strategy

The source workspace is one person's live immigration case. Nothing is bulk-copied and
history is never inherited: the repo is a fresh `git init`, and every ported file is
scrubbed as it lands.

Rather than replacing real examples with `[PLACEHOLDER]` tokens — which makes the
documentation worse — examples use a single coherent fictional applicant defined in
`fixtures/sample-case/`. She appears in every skill's illustrations, the README
walkthrough, and the portal's demo seed. This yields better docs than the original
(one continuous case instead of disconnected fragments) and doubles as the CI fixture.

`.claude/settings.local.json` from the source workspace is never ported under any
circumstance.

## Testing

- `scripts/validate-skills.mjs` parses every `SKILL.md` frontmatter with gray-matter —
  the same library the installer uses. The installer **silently drops** a skill whose
  frontmatter fails to parse; an unquoted `: ` in a description is the usual cause. CI
  fails loudly instead.
- A PII guard scans the tree for the author's identifiers and known real-case tokens.
- `scaffold-case.sh` runs against a temp dir and its output tree is asserted.
- `similarity-check.mjs` is exercised against deliberately near-duplicate fixtures.

## Deferred

- O-1B and EB-2 NIW manifests (NIW needs the manifest to stretch to Dhanasar's
  three-prong test rather than a criteria count).
- Attorney collaboration features in the portal (comments, approval workflow).
- Multi-case / attorney-practice mode.
