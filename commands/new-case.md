---
description: Scaffold a new O-1A or EB-1A petition case workspace
---

Scaffold a petition case workspace.

Arguments: `$ARGUMENTS` — expected as `<target-dir> [o1a|eb1a|both]`, defaulting to `o1a`.

1. Invoke the `petition-workspace` skill for conventions.
2. Run its scaffold script:
   `${CLAUDE_PLUGIN_ROOT}/skills/petition-workspace/scripts/scaffold-case.sh <target-dir> <type>`
   It refuses to write into a non-empty directory — do not work around that; ask the user.
3. Then help fill in `case-overview.md`, starting with the field of endeavor. Push for a
   narrow, specific field statement; it is the highest-leverage line in the whole case.
4. Remind the user once that this workspace will hold sensitive records and should not go
   to a public git remote.
