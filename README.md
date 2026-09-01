# extraordinary-ability-kit

Agent skills for preparing your own U.S. **O-1A** or **EB-1A** extraordinary ability
petition: assess which criteria you can satisfy, collect and organize evidence, draft the
petition letter and recommendation letters, and generate a review packet to hand to your
attorney.

> **This is reference material and drafting help, not legal advice.**
>
> The intended flow: use this to collect and store evidence, organize your application,
> and draft the petition and letters — then **work with an immigration attorney** to
> revise, rewrite, and file. Preparing your own petition is legal and common; getting a
> professional to review it before you file is how you avoid expensive mistakes.
>
> Legal facts with a shelf life — fees, approval rates, processing times — are quarantined
> in one file with verification dates. **Last verified: February 2026.** Confirm anything
> you will file or pay on against [uscis.gov](https://www.uscis.gov).

## Install

**As a Claude Code plugin** — gets everything, including slash commands and the evidence
collector agent:

```bash
/plugin install extraordinary-ability-kit
```

**As individual skills** via the [`skills`](https://www.npmjs.com/package/skills) CLI —
works with Codex, Claude Code, and other runtimes:

```bash
npx skills add <org>/extraordinary-ability-kit --list
npx skills add <org>/extraordinary-ability-kit --skill petition-strategy --agent claude-code
npx skills add <org>/extraordinary-ability-kit --all --agent codex
```

Skills are self-contained, so installing one on its own works. Slash commands are thin
wrappers over the skills; the logic lives in the skills themselves.

## Skills

| Skill | What it does |
|---|---|
| `petition-strategy` | Legal framework, the criteria manifests, Kazarian two-step, RFE strategy, consular annexes |
| `petition-workspace` | Case folder structure, file naming, the `evidence-list.md` format, scaffolding |
| `petition-evidence` | Capturing press articles and documents into filed, tracked exhibits |
| `petition-letters` | Drafting a recommendation letter set that reads as independent voices |
| `petition-narrative` | Drafting the petition letter and criterion-by-criterion argument |
| `petition-status` | Where the case stands, what is blocking it, what to do next |
| `petition-portal` | A single-file HTML review packet for your attorney |

## Commands (plugin only)

| Command | |
|---|---|
| `/new-case <dir> [o1a\|eb1a\|both]` | Scaffold a case workspace |
| `/triage` | Interview-driven criteria feasibility assessment |
| `/status` | Stage, blockers, and prioritized next actions |
| `/review-packet <dir>` | Build the shareable HTML packet |

## Quickstart

```bash
/new-case ~/my-petition o1a     # scaffold
/triage                          # find out which criteria you can actually support
# ...collect evidence, drafting letters and narrative as you go...
/status                          # what is blocking, what matters most
/review-packet ~/my-petition     # one HTML file to send your attorney
```

## Design notes

**Criteria are data, not prose.** O-1A has **8** criteria (8 CFR 214.2(o)(3)(iii)(B));
EB-1A has **10** (8 CFR 204.5(h)(3)). They are not interchangeable — *display at artistic
exhibitions* and *commercial success in the performing arts* are EB-1A and O-1B criteria
that do not exist in O-1A, and three others are worded differently in ways that change
what qualifies. Each petition type declares its own manifest in
`skills/petition-strategy/references/criteria/`, and skills are instructed to read it
rather than recite a list from memory. CI enforces the manifests' internal consistency.

**Recommendation letters get real machinery, not a prompt.** A model asked to draft eight
letters produces eight letters with one skeleton and one vocabulary — precisely the
homogeneity USCIS reads as a credibility problem, since it undercuts the independence the
letters exist to show. `petition-letters` carries per-recommender voice profiles and a
[similarity checker](skills/petition-letters/scripts/similarity-check.mjs) that reads the
whole set together and fails on shared phrasing before anything is sent.

**The review packet is a file, not an app.** A case workspace holds passports, tax
returns, and salary records. Generating one self-contained HTML file means no hosted
database, no auth service to misconfigure, and no third-party infrastructure holding
someone's immigration file.

## What is not covered

- **O-1B** (arts, motion picture/TV) — a different criteria list. The skills say so
  rather than substituting the O-1A list.
- **EB-2 NIW** — a different legal test entirely (*Dhanasar*'s three prongs, not a
  criteria count).
- Form filling. I-129, I-140, and DS-260 are signed under penalty of perjury; the kit
  assembles the underlying data and stops there.

## Development

```bash
npm install
npm test        # frontmatter + manifest validation, PII scan
```

`scripts/check-pii.mjs` scans for absolute home paths, emails, receipt numbers, and
phone numbers. For case-specific names and employers, copy `.pii-denylist.example` to
`.pii-denylist` (gitignored) and add the real terms — the guard can then catch them
without this repo publishing the list it is protecting.

`scripts/guard-source-repo.sh` asserts that a case workspace you are porting material
*out* of stays untouched:

```bash
SOURCE_CASE_REPO=~/my-case ./scripts/guard-source-repo.sh
```

## License

MIT
