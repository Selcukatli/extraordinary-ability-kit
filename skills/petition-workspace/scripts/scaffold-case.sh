#!/usr/bin/env bash
# Scaffold a petition case workspace.
# Usage: scaffold-case.sh <target-dir> [o1a|eb1a|both]
set -euo pipefail

TARGET="${1:?usage: scaffold-case.sh <target-dir> [o1a|eb1a|both]}"
TYPE="${2:-o1a}"
TPL="$(cd "$(dirname "$0")/../templates/case" && pwd)"

case "$TYPE" in o1a|eb1a|both) ;; *) echo "type must be o1a, eb1a, or both" >&2; exit 2 ;; esac

if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "refusing to scaffold into non-empty directory: $TARGET" >&2
  exit 1
fi

mkdir -p "$TARGET"/{resources/{awards,membership,press,judging,patents,publications,compensation,company-docs,recommendation-letters,education,speaking,photos},communications/{attorneys,recommenders},reference}

petitions=()
case "$TYPE" in
  o1a)  petitions=(o1a) ;;
  eb1a) petitions=(eb1a) ;;
  both) petitions=(o1a eb1a) ;;
esac

for p in "${petitions[@]}"; do
  dir="$TARGET/$p"
  mkdir -p "$dir/evidence-by-criterion" "$dir/recommendation-letters"
  sed "s/^petition_type: o1a.*/petition_type: $p/" "$TPL/evidence-list.md" \
    | sed "s/YYYY-MM-DD/$(date +%Y-%m-%d)/" > "$dir/evidence-list.md"
  printf '# %s — Overview\n\nStrategy, criteria claimed, timeline, and open questions.\n' \
    "$(echo "$p" | tr '[:lower:]' '[:upper:]')" > "$dir/overview.md"
  printf '# %s — Petition Narrative\n\nDraft of the petition letter.\n' \
    "$(echo "$p" | tr '[:lower:]' '[:upper:]')" > "$dir/petition-narrative.md"
done

cat > "$TARGET/case-overview.md" <<'EOF'
# Case Overview

## Applicant
- Name:
- Nationality:
- Current status / expiry:
- **Field of endeavor** (state it narrowly — this is the highest-leverage line in the file):

## Filing plan
- Petition type(s):
- Petitioner / sponsor (O-1 cannot be self-petitioned):
- Target filing date:
- Attorney:

## Criteria claimed
| # | Criterion | Confidence | Notes |
|---|-----------|------------|-------|

## Open questions
EOF

cat > "$TARGET/.gitignore" <<'EOF'
# Never commit generated build artifacts
temp/
*.tmp

# OS noise
.DS_Store
EOF

cat > "$TARGET/README.md" <<'EOF'
# Petition case workspace

Scaffolded by `extraordinary-ability-kit`.

- `resources/` — raw source material: screenshots, PDFs, certificates, scans
- `<petition>/evidence-list.md` — the exhibit tracker. Tools parse it; keep its format.
- `<petition>/evidence-by-criterion/` — the argument for each criterion
- `communications/` — attorney and recommender correspondence
- `case-overview.md` — who the applicant is and what is being filed

> This workspace will hold passports, tax returns, and other sensitive records.
> Think carefully before pushing it to a hosted git remote, and never to a public one.
EOF

echo "scaffolded $TYPE case at $TARGET"
find "$TARGET" -type f | sort | sed "s|^$TARGET|.|"
