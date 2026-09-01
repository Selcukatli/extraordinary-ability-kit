---
description: Interview the applicant and assess which petition criteria they can satisfy
---

Run a criteria feasibility assessment.

1. Invoke the `petition-strategy` skill.
2. Establish first, before assessing any criterion:
   - **Petition type.** "O-1" is ambiguous — O-1A covers sciences, education, business,
     and athletics; O-1B covers the arts and has a different criteria list this kit does
     not yet carry. Say so plainly if they are O-1B.
   - **The field of endeavor, stated narrowly.**
   - For O-1A: who will petition (it cannot be self-petitioned) and whether an advisory
     opinion source exists.
3. Load the matching manifest from `references/criteria/` — never recite a list from memory.
4. Walk criteria **one at a time**, using each entry's `proves`, `document`, and
   `fails_when` fields. Ask for the full picture before filtering; do not let the applicant
   self-censor early.
5. Close with an honest assessment: which criteria are solid, which are borderline, which
   are not there, and — if they are short — that judging is the fastest to build.
6. Remember that meeting three criteria is the floor, not the finish. Say whether the
   overall picture would survive a final merits determination.

Arguments: `$ARGUMENTS`
