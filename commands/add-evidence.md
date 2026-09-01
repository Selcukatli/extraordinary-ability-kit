---
description: File an evidence document into the case workspace and record it
---

File evidence into the case workspace and record it in `evidence-list.md` in one step.

1. Invoke the `petition-workspace` skill if you need the conventions.
2. Determine the criterion number the evidence supports. If the user is unsure, ask —
   filing it under the wrong criterion routes it to the wrong folder. Remember the
   numbering differs between petition types (O-1A criterion 7 is critical role; EB-1A
   criterion 7 is artistic exhibitions).
3. Run:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/skills/petition-workspace/scripts/add-evidence.mjs \
     <case-dir> -c <criterion> -d "<description>" [-p <petition>] <file...>
   ```
   Use `-u <url>` instead of files for something not yet captured; it records as pending.
   Use `--dry-run` first when the user is unsure. Use `--move` to relocate rather than copy.
4. Write the description as an adjudicator would need it: what the item is, who issued it,
   the year, and — for awards and memberships — anything establishing selectivity. A
   description of "certificate" is useless six months later.
5. If a batch is being filed, run them one at a time and report the resulting paths.

Arguments: `$ARGUMENTS`
