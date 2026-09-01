---
name: petition-status
description: "Use when someone asks where their U.S. O-1A or EB-1A petition case stands, what to do next, what is blocking progress, whether they are ready to file, or how much time remains before a deadline. Also use as the entry point when starting work on an existing petition case workspace. Triggers on what's next, case status, am I ready to file, what's blocking, or reviewing petition progress."
---

# Petition Status

The front door. Reads a case workspace and reports position, blockers, and the next few
actions that actually matter.

## Stages

```
intake → criteria triage → evidence collection → drafting → attorney review → assembly → filing
```

A case is rarely in one stage cleanly — evidence collection and drafting overlap for
months. Report the **earliest stage with unfinished blocking work**, not the furthest
along anything has reached.

## How to assess

Read, in this order:

1. `case-overview.md` — applicant, petition type, filing target, criteria claimed
2. `<petition>/evidence-list.md` — count status markers per criterion
3. `<petition>/evidence-by-criterion/` — which arguments exist and which are stubs
4. `<petition>/recommendation-letters/` — drafted, sent, signed
5. `<petition>/petition-narrative.md` — real draft or placeholder

Then report:

- **Stage and why**
- **Criteria coverage** — how many are solidly evidenced. Below three, that is the only
  thing worth discussing.
- **Blockers**, distinguishing what the applicant controls from what they are waiting on
  (a signature, an attorney, a records office). Waiting items should have been started
  earliest; flag any that have not been.
- **Time** — working backward from the filing target, with the long-lead items called out

## Prioritize honestly

Rank by what would most change the outcome, not by what is easiest:

- **Under three solid criteria** — everything else is premature. Judging roles are the
  fastest criterion to build; say so.
- **Unsigned letters** — the longest-latency item in any case, since it depends on other
  people. Chase these before polishing prose.
- **A thin "original contributions" showing** — the most RFE'd criterion. Strengthening it
  is worth more than adding a fourth exhibit to a criterion already proven.
- **Expiring status** — if current status expires before the filing target, that reorders
  everything.

Say plainly when a filing target is not achievable. An applicant who learns in month nine
that they should have started letters in month three has been failed by soft reporting.

## Related

`petition-strategy` for criteria assessment, `petition-evidence` for collection,
`petition-letters` for the letter set, `petition-narrative` for the petition letter.
