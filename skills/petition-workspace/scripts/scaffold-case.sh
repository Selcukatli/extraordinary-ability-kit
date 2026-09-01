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

# Criterion names per petition type. O-1A has 8; EB-1A has 10, and the numbering
# diverges from criterion 7 onward — do not share one list between them.
o1a_criteria=(
  "Awards" "Membership" "Published Material" "Judging"
  "Original Contributions" "Scholarly Articles" "Critical Role" "High Remuneration"
)
eb1a_criteria=(
  "Awards" "Membership" "Published Material" "Judging"
  "Original Contributions" "Scholarly Articles" "Exhibitions"
  "Leading or Critical Role" "High Remuneration" "Commercial Success"
)

for p in "${petitions[@]}"; do
  dir="$TARGET/$p"
  mkdir -p "$dir/evidence-by-criterion" "$dir/recommendation-letters"

  sed -e "s/PETITION_TYPE/$p/" -e "s/TODAY/$(date +%Y-%m-%d)/" \
      "$TPL/evidence-list-header.md" > "$dir/evidence-list.md"

  case "$p" in
    o1a)  names=("${o1a_criteria[@]}") ;;
    eb1a) names=("${eb1a_criteria[@]}") ;;
  esac

  n=1
  for name in "${names[@]}"; do
    {
      printf '### Criterion %d: %s\n\n' "$n" "$name"
      printf '| Exhibit # | Description | Status | Source |\n'
      printf '|-----------|-------------|--------|--------|\n\n'
    } >> "$dir/evidence-list.md"
    printf '# Criterion %d: %s\n\nThe argument for this criterion: what the evidence is,\nwhy it satisfies the regulatory language, and why it matters to the field.\n' \
      "$n" "$name" > "$dir/evidence-by-criterion/$(printf '%02d' $n)-$(echo "$name" | tr '[:upper:] ' '[:lower:]-').md"
    n=$((n + 1))
  done

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
