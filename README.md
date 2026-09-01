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
> The author is not an attorney and this has not been reviewed by one. AI-generated
> drafts must be reviewed by a human, and legal content by a licensed immigration
> attorney, before filing. Filings are signed under penalty of perjury.
>
> Legal facts with a shelf life — fees, approval rates, processing times — are quarantined
> in one file with verification dates. **Last verified: February 2026.** Confirm anything
> you will file or pay on against [uscis.gov](https://www.uscis.gov).
>
> **Read [DISCLAIMER.md](DISCLAIMER.md) before using this.** No warranty, no liability,
> no attorney-client relationship.

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
| `/add-evidence` | File a document and record it in one step |
| `/review-packet <dir>` | Build the shareable HTML packet |

## Quickstart

```bash
/new-case ~/my-petition o1a     # scaffold
/triage                          # which criteria can you actually support?
/add-evidence                    # file documents as you collect them
/status                          # what is blocking, what matters most
/review-packet ~/my-petition     # one HTML file to send your attorney
```

## How your files are stored

Everything stays **on your machine, in plain files**. Nothing is uploaded, and there is no
database or account.

`/new-case` creates this:

```
my-petition/
├── case-overview.md              who you are, what you are filing, criteria claimed
├── resources/                    RAW material — shared across petition types
│   ├── awards/          membership/     press/         judging/
│   ├── patents/         publications/   compensation/  company-docs/
│   ├── education/       speaking/       photos/        recommendation-letters/
└── o1a/                          (and/or eb1a/)
    ├── evidence-list.md          THE TRACKER — one table per criterion
    ├── evidence-by-criterion/    01-awards.md … one argument file per criterion
    ├── recommendation-letters/
    ├── petition-narrative.md
    └── overview.md
```

`resources/` holds raw input and is **shared** between petition types, because the same
award supports both an O-1A and an EB-1A claim. The per-petition directories hold *argued
output* — the same evidence framed for each standard, with independent exhibit numbering.

### Filing something

Rather than creating folders and writing table rows by hand:

```bash
node skills/petition-workspace/scripts/add-evidence.mjs ~/my-petition \
  -c 1 -d "Meridian Robotics Grand Challenge, 1st of 210 teams (2023)" \
  ~/Downloads/"Screenshot 2026-03-14 at 4.51.12 PM.png"
```

That one command routes the file to `resources/awards/<slug>/`, renames it from the
useless screenshot name, and appends a `[x] collected` row to the Criterion 1 table with
the path filled in. Use `-u <url>` for something you have found but not yet captured
(records as `[ ] pending`), `--dry-run` to preview, `--move` to relocate rather than copy.

Criterion numbers route to folders **per petition type**, because the numbering diverges:
O-1A criterion 7 is *critical role* → `company-docs/`, while EB-1A criterion 7 is
*artistic exhibitions* → `speaking/`.

### Tracking status

Each row carries one of five markers, and the tooling reads them:

| Marker | Meaning |
|---|---|
| `[x] collected` | Complete and filed under `resources/` |
| `[~] partial` | Some files in hand, more needed |
| `[ ] pending` | Identified but not captured |
| `[!] blocked` | Paywalled, dead link, or unobtainable |
| `[-] removed` | Considered and rejected — **keep the row and say why** |

Keeping rejected evidence as `[-] removed` rows with a reason is the difference between
remembering why you dropped something and re-collecting it in month nine.

> **Do not run a markdown formatter over `evidence-list.md`.** Formatters that round-trip
> markdown through a syntax tree escape the brackets — `[x]` becomes `\[x\]` — and silently
> break every status marker in the file. This happens on editor save with format-on-save
> enabled. Add your case workspace to your formatter's ignore list. `add-evidence.mjs`
> detects the damage and refuses to write rather than compounding it.

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

## Publishing your own fork

The repo is set up so a case workspace can be mined for reusable material without leaking
the case:

1. **Never fork or clone a case workspace to create a public repo.** Scrubbing the working
   tree does nothing — the history keeps every version of every file. Start with a fresh
   `git init` and port files in individually.
2. `cp .pii-denylist.example .pii-denylist` and fill in the real names, employers, and
   institutions. The file is gitignored, so the guard can catch them without the repo
   publishing the list it protects.
3. `SOURCE_CASE_REPO=~/my-case ./scripts/guard-source-repo.sh` records a baseline and fails
   if the source workspace changes while you are porting out of it.
4. `npm test` before every push — frontmatter validation, manifest consistency, PII scan.
5. CI (`.github/workflows/validate.yml`) runs the same checks plus an end-to-end scaffold,
   packet build, and similarity-check assertion on every push and PR.

To make it installable, push to GitHub and replace `<org>` in the install commands above
with your org or username. `npx skills add <org>/extraordinary-ability-kit --list` reads
directly from the default branch — no release or npm publish needed.

## Contributing

Issues and PRs welcome, with two rules:

- **No real case data**, ever — not in issues, not in examples, not in tests. Use the
  fictional applicant in `fixtures/sample-case/`.
- **Legal content needs a citation.** Statements about what USCIS requires should cite the
  regulation, the Policy Manual, or a specific AAO decision. Anything with a shelf life
  goes in `volatile.md` with a date, not into the narrative reference.

## License

[MIT](LICENSE), with the important caveat that the license's warranty disclaimer is not
decoration for a project like this one. See [DISCLAIMER.md](DISCLAIMER.md).
