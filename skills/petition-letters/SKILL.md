---
name: petition-letters
description: "Use when drafting, reviewing, or managing recommendation or expert support letters for a U.S. O-1A or EB-1A extraordinary ability petition — choosing recommenders, planning criterion coverage across a letter set, drafting individual letters, differentiating their voices, running a cross-letter similarity check, or writing outreach to prospective signers. Triggers on recommendation letters, support letters, expert letters, or recommender outreach for an immigration petition."
---

# Recommendation Letters

Drafting a set of letters that reads as several independent experts rather than one author.

> Letters are normally drafted by the applicant or attorney and then edited and signed by
> the recommender. That is standard practice, not deception — the recommender's judgment,
> edits, and signature are what make the letter theirs. Always tell the signer the draft
> is a starting point and invite them to rewrite it.

## The failure mode this skill exists to prevent

Asked to draft eight letters, a language model produces eight letters with one skeleton,
one cadence, and the same three adjectives. USCIS reads that as a credibility signal:
identical phrasing across letters is a documented weak-letter characteristic, because it
undercuts the very independence the letters exist to demonstrate.

**A set of individually good letters that sound alike is worse than a set of merely
adequate letters that sound like different people.**

## Process

### 1. Plan the set before drafting any of it

Aim for **5–7 letters**. More is not better; a large set of thin letters reads as padding.

Build a coverage matrix first — recommender against criteria — and assign each letter
**two or three criteria to carry**. Overlap is fine; total overlap is not. If every letter
covers everything, none of them says anything specific.

Weight toward **independent** experts — people who never employed, funded, or co-authored
with the applicant. A letter from someone with no stake is worth several from colleagues.
A set with no independent voices is a common RFE trigger.

### 2. Capture a voice profile per recommender

Before drafting, record for each signer:

- **Register** — academic, operator, executive, customer, regulator
- **Relationship and how they know the work** — worked alongside, adopted it, reviewed it,
  know it only by reputation. This must appear in the letter itself.
- **First-person stance** — do they say "I", "we", "my team"?
- **Sentence length and diction** — a plant director and a chaired professor do not
  write alike, and should not be made to
- **Native language** — a letter from a non-native English speaker that reads as flawless
  idiomatic American English is a tell. Preserve natural register without caricature.

### 3. Draft each letter against its own profile

Vary deliberately across the set:

- **Structure** — not every letter opens with credentials and closes with a summary. Some
  should open with a specific incident.
- **Length** — 1 to 2 pages, and genuinely different within that range. Under half a page
  reads as disinterest; over three pages does not get read.
- **Evidence type** — one letter carries a number, another a story, another a comparison
  to peers in the field.

Every letter must contain: who the writer is and why their opinion carries weight, how
they know the work, **at least one concrete specific** (a number, an incident, a named
deployment), and why the contribution matters to the *field* rather than to an employer.

Avoid: generic praise ("talented, hardworking, dedicated"), personal qualities in place of
professional achievement, and unexplained superlatives.

### 4. Run the similarity check before anything is sent

```bash
node scripts/similarity-check.mjs <letters-dir>
```

Reports pairwise 6-word-shingle overlap, sentence openings reused across letters, and
length uniformity. Exits non-zero on a failing pair. **Run it on the whole set, not
letter by letter** — the defect only exists between letters.

Rewrite failures rather than paraphrasing them. Paraphrase preserves the shared skeleton,
which is the actual problem.

### 5. Outreach

When writing to a prospective signer: say what you are asking for, why *them* specifically,
what you will provide (a draft), that they should edit freely, and the date you need it.
Keep it short. Attach a one-page summary of the relevant achievements rather than the
whole petition.

## Reference

`references/full-reference.md` in the `petition-strategy` skill, Section 3, has the full
letter playbook — strong versus weak patterns, structure, and common mistakes — if that
skill is installed.
