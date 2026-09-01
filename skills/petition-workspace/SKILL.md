---
name: petition-workspace
description: "Use when setting up or organizing a case workspace for a U.S. O-1A or EB-1A extraordinary ability petition — creating the folder structure, deciding where a file belongs, naming evidence files, maintaining the evidence exhibit list format, or keeping a case repository clean. Triggers on starting a new petition case, scaffolding a case folder, organizing immigration evidence, or file naming for exhibits."
---

# Petition Workspace

Structure and conventions for a petition case folder. A case runs for a year or more and
accumulates hundreds of files; the structure is what keeps it navigable at month ten.

## Scaffold a new case

```bash
scripts/scaffold-case.sh <target-dir> [o1a|eb1a|both]
```

Refuses to write into a non-empty directory. Creates `resources/` for raw material,
one directory per petition type, `communications/`, and `case-overview.md`.

## Layout

```
case/
├── case-overview.md          applicant, filing plan, criteria claimed, open questions
├── resources/                RAW source material — shared across petition types
│   ├── awards/{award-slug}/
│   ├── membership/{org-slug}/
│   ├── press/{company-or-topic}/{articles,podcasts,translations}/
│   ├── judging/{event-or-org}/
│   ├── patents/  publications/  compensation/  company-docs/
│   ├── recommendation-letters/  education/  speaking/  photos/
├── o1a/  (and/or eb1a/)
│   ├── overview.md               strategy, criteria claimed, timeline
│   ├── evidence-list.md          THE EXHIBIT TRACKER — parsed by tools
│   ├── evidence-by-criterion/    the argument for each criterion
│   ├── petition-narrative.md     the petition letter draft
│   └── recommendation-letters/
└── communications/{attorneys,recommenders}/
```

**The organizing principle:** `resources/` holds raw input, shared between petition types
because the same fact supports both. The per-petition directories hold *argued output* —
the same evidence framed for each standard, with independent exhibit numbering.

## Naming

Lowercase, hyphenated, descriptive enough to identify without opening:

| Kind | Pattern | Example |
|---|---|---|
| Press | `publication-subject-year` | `automation-review-kestrel-2024.png` |
| Award | `grantor-award-year` | `meridian-grand-challenge-2023.pdf` |
| Translation | `translation-` + source name | `translation-folha-tecnologica-profile.md` |
| Time-sensitive | date-prefixed | `2024-03-plant-deployment-letter.pdf` |

Never leave a file named `Screenshot 2026-03-14 at 4.51.12 PM.png`.

## The evidence-list.md format contract

Tools parse this file. Its shape is a contract, not a style preference.

- One table per criterion under `### Criterion N: Name`
- Fixed columns: `Exhibit # | Description | Status | Source`
- Status is one of five literal markers: `[ ] pending`, `[~] partial`,
  `[x] collected`, `[!] blocked`, `[-] removed`
- Source is a path under `resources/`, or a URL for anything not yet captured
- Exhibit numbers stay empty until final assembly, then run sequentially

**Keep rejected evidence as `[-] removed` rows with a reason.** Six months on you will
not remember why you dropped something, and you will re-collect it.

> [!danger] Do not run a markdown formatter over evidence-list.md
> Formatters that round-trip markdown through a syntax tree escape the brackets —
> `[x] collected` becomes `\[x\] collected` — and silently break every status marker in
> the file. This is not hypothetical; it is the most common way these files get corrupted,
> and it happens on editor save with format-on-save enabled. Add the case workspace to
> your formatter's ignore file.

## Build artifacts

Generated files — slide exports, converted PDFs, one-off scripts — go in a `temp/` folder
inside the relevant directory, and `temp/` is gitignored. Only final outputs belong in the
working directory.

## A word about the repository itself

This workspace will hold passports, tax returns, salary records, and medical exam results.
Think hard before pushing it to a hosted remote, and never to a public one. If you use git
here, keep it local or use a private remote you control.
