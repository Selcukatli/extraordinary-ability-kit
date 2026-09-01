---
description: Generate a shareable HTML review packet from the case workspace
---

Generate a review packet for an attorney or reviewer.

1. Invoke the `petition-portal` skill.
2. Run:
   `node ${CLAUDE_PLUGIN_ROOT}/skills/petition-portal/scripts/build-portal.mjs <case-dir> -o <out.html>`
3. **Read the generated file before telling the user it is ready.** It is derived from
   their working notes, which contain internal candour — removed-evidence reasons,
   assessments of recommenders, attorney-fee comparisons. Flag anything that reads badly
   out of context.
4. Remind them the packet lists where evidence lives but does not embed the documents.

Arguments: `$ARGUMENTS`
