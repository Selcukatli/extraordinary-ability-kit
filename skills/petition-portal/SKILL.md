---
name: petition-portal
description: "Use when preparing a shareable review packet of a U.S. O-1A or EB-1A petition case for an attorney, sponsor, or reviewer — generating a browsable summary of the evidence exhibit list, sharing case status outside the workspace, or handing a package to counsel. Triggers on review packet, share with my attorney, portal for my case, or exporting the evidence list."
---

# Review Packet

Turning a case workspace into one file you can hand to an attorney.

```bash
node scripts/build-portal.mjs <case-dir> [-o review-packet.html]
```

Reads every `<petition>/evidence-list.md` plus `case-overview.md` and writes a single
self-contained HTML file: exhibit tables by criterion, status badges, per-petition tallies.
No dependencies, no build step, works offline, readable in light and dark.

## Why a file and not an app

The obvious design is a web app with a database and login. Resist it for the common case.

A petition workspace holds passports, tax returns, salary records, and medical results.
Standing up a hosted app means putting that on someone else's infrastructure, securing it,
and maintaining it — for what is usually a document you send to one attorney twice. A local
file has no attack surface, no credentials to leak, no deploy to misconfigure, and no
monthly cost.

Generate the packet, check it, and send it the way you would send any confidential
document. If a hosted portal is genuinely warranted — several reviewers, ongoing
collaboration, files served in-browser — treat that as a separate project with real access
control, and never expose the case directory directly.

## Before sending

Read the generated file first. It is derived from your notes, and notes contain candour
you may not want a third party reading — a `[-] removed` row explaining that an award was
too weak, or a description that speculates about a recommender. That context is valuable
internally and can read badly out of context.

Check specifically:

- Descriptions that editorialize about people who will read this
- Anything about attorney fees or strategy across competing firms
- File paths that reveal unrelated directories

The packet lists *what evidence exists and where*. It does not embed the evidence itself,
so sending it does not distribute the underlying documents.
