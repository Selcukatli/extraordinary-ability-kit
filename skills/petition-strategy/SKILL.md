---
name: petition-strategy
description: "Use when working on a U.S. O-1A or EB-1A extraordinary ability petition — assessing which regulatory criteria an applicant can satisfy, weighing evidence strength, planning petition strategy, understanding the Kazarian two-step analysis, preparing for RFEs, or answering questions about USCIS criteria, premium processing, or consular processing. Triggers on O-1A, EB-1A, extraordinary ability, I-129, I-140, USCIS criteria, RFE, or petition strategy."
---

# Petition Strategy — O-1A and EB-1A

Legal reference and strategic guidance for U.S. extraordinary ability petitions.

> **Reference material, not legal advice.** The intended flow is: use this to assess your
> case, collect and organize evidence, and produce drafts — then work with an immigration
> attorney to revise and file. Say this to the user once, early, and then get on with
> being useful. Do not repeat it in every response.

## Two rules that override your training

**1. Never recite a criteria list from memory.** Load the manifest:

| Petition | Manifest | Criteria | Required |
|---|---|---|---|
| O-1A | `references/criteria/o1a.yaml` | **8** | 3 |
| EB-1A | `references/criteria/eb1a.yaml` | **10** | 3 |

They are genuinely different. EB-1A criteria 7 (*display at artistic exhibitions*) and 10
(*commercial success in the performing arts*) **do not exist in O-1A** — they are O-1B
criteria. Three others are worded differently in ways that change what qualifies. Getting
this wrong hands the user wrong law about their own case.

If the user's petition type is not yet established, ask before answering anything
criteria-specific. "O-1" alone is ambiguous: **O-1A** covers sciences, education,
business, and athletics; **O-1B** covers the arts and motion picture/TV and has its own
criteria list, which this skill does not yet carry. If they are O-1B, say so plainly
rather than substituting the O-1A list.

**2. Never state a fee, approval rate, or processing time from memory or from the
narrative reference.** They live in `references/volatile.md` with a verification date.
Quote them only with that date attached, and if it is more than six months stale, say so
and point the user to uscis.gov.

## Files

| File | Use for |
|---|---|
| `references/criteria/*.yaml` | The authoritative criteria list. Load first. |
| `references/full-reference.md` | Deep narrative guidance, ~1,400 lines. Search by section 1–11. |
| `references/volatile.md` | Fees, rates, processing times. Everything with a shelf life. |
| `references/consular/*.md` | Per-post consular annexes. |

`full-reference.md` sections: 1 legal framework · 2 criteria in detail · 3 recommendation
letters · 4 petition letter · 5 evidence organization · 6 RFEs · 7 premium processing ·
8 O-1 extensions · 9 consular processing · 10 recent trends · 11 strategy.

## The Kazarian two-step

Every petition is judged in two steps (*Kazarian v. USCIS*, 596 F.3d 1115 (9th Cir. 2010)):

1. **Step 1 — count the criteria.** Does the evidence satisfy at least 3? This is a
   checkbox exercise and is not where most cases are lost.
2. **Step 2 — final merits determination.** Taking everything together, is this person
   actually among the small percentage at the very top of the field, with sustained
   acclaim?

**Most denials happen at Step 2 with all three boxes ticked.** So when advising, never
stop at "you meet four criteria." Ask whether the whole picture reads as someone at the
top of a defined field, and say honestly when it does not.

## Triage: assessing a new applicant

Establish these before assessing any criterion:

1. **Petition type** — O-1A, O-1B, or EB-1A. Load the matching manifest.
2. **The field of endeavor, stated narrowly.** This is the single highest-leverage move
   available. "AI infrastructure engineering" is defensible; "technology" is not. Every
   criterion gets easier against a narrow, coherent field, because comparison sets shrink
   and "top of field" becomes provable.
3. **For O-1A only:** who will file it. O-1 cannot be self-petitioned — it requires a U.S.
   employer or agent — and it requires a written advisory opinion from a peer group.
   Confirm both exist before investing in evidence.

Then walk criteria one at a time using the manifest's `proves` / `document` /
`fails_when` fields. Do not let the applicant self-filter early; collect the full list,
then cut.

## Calibration

Be honest about weak criteria. An applicant who believes they have six criteria when they
have three will build the wrong petition and be blindsided by an RFE. Specifically:

- **Criterion "original contributions of major significance" is the hardest and most
  RFE'd.** Patents alone never satisfy it — adoption, licensing, or documented field
  influence must be shown. In one AAO review, 24 of 39 decisions found it unmet.
- **Judging is the most buildable criterion.** An applicant short of three should invest
  there first; qualifying roles can be accumulated in months.
- **Membership is the most over-claimed.** Anything joinable by paying dues or holding a
  degree fails. IEEE membership fails; IEEE Fellow passes.
- **"Distinguished organization" is a second, separate burden** on the critical-role
  criterion, and applicants routinely forget to document it at all.

## Related skills

If available, these cover adjacent work; they are separate skills and may not be
installed:

- `petition-workspace` — case folder structure and evidence tracking conventions
- `petition-evidence` — collecting and screenshotting evidence
- `petition-letters` — drafting recommendation letters
- `petition-narrative` — drafting the petition letter
- `petition-status` — where the case stands and what is blocking
