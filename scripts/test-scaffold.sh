#!/usr/bin/env bash
# Exercise scaffold-case.sh end to end: fresh scaffold, and --add for another
# petition workspace on an existing case.
# Run: bash scripts/test-scaffold.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCAFFOLD="$ROOT/skills/petition-workspace/scripts/scaffold-case.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fails=0

ok()   { echo "  ok   $1"; }
fail() { echo "  FAIL $1" >&2; fails=$((fails + 1)); }
check() { local name="$1"; shift; if "$@" >/dev/null 2>&1; then ok "$name"; else fail "$name"; fi; }
refuses() { local name="$1"; shift; if "$@" >/dev/null 2>&1; then fail "$name"; else ok "$name"; fi; }
criteria() { grep -c '^### Criterion' "$1"; }

echo "scaffold-case.sh"

case="$TMP/case"
"$SCAFFOLD" "$case" o1a >/dev/null
check "fresh o1a scaffold has 8 criteria" test "$(criteria "$case/o1a/evidence-list.md")" = 8
check "fresh o1a scaffold has no eb1a/" test ! -e "$case/eb1a"
refuses "plain scaffold still refuses a non-empty directory" "$SCAFFOLD" "$case" eb1a

# Simulate a case in progress: user edits that --add must not touch.
echo "Field of endeavor: industrial robotics" >> "$case/case-overview.md"
echo "| | Org chart | [x] collected | resources/company-docs/org-chart.png |" >> "$case/o1a/evidence-list.md"
mkdir -p "$case/resources/awards/meridian" && echo x > "$case/resources/awards/meridian/cert.pdf"
before="$(cd "$case" && find case-overview.md README.md .gitignore resources o1a -type f -exec shasum {} + | sort)"

"$SCAFFOLD" --add "$case" eb1a >/dev/null
check "--add eb1a creates eb1a/ with 10 criteria" test "$(criteria "$case/eb1a/evidence-list.md")" = 10
check "--add eb1a writes 10 criterion argument files" test "$(ls "$case/eb1a/evidence-by-criterion" | wc -l | tr -d ' ')" = 10
check "--add eb1a writes overview and narrative" test -s "$case/eb1a/overview.md" -a -s "$case/eb1a/petition-narrative.md"
after="$(cd "$case" && find case-overview.md README.md .gitignore resources o1a -type f -exec shasum {} + | sort)"
check "--add leaves existing case files untouched" test "$before" = "$after"

refuses "--add refuses an existing petition workspace" "$SCAFFOLD" --add "$case" eb1a
refuses "--add both refuses when either already exists" "$SCAFFOLD" --add "$case" both
refuses "--add refuses a directory that is not a case" "$SCAFFOLD" --add "$TMP/nope" o1a
refuses "--add requires a petition type" "$SCAFFOLD" --add "$case"
refuses "--add rejects an unknown petition type" "$SCAFFOLD" --add "$case" h1b

# The added workspace must work with the rest of the toolchain.
printf 'x' > "$TMP/f.png"
check "add-evidence files into the added workspace" \
  node "$ROOT/skills/petition-workspace/scripts/add-evidence.mjs" "$case" -p eb1a -c 7 -d "Showcase demo" "$TMP/f.png"
check "added workspace's evidence-list records the exhibit" grep -q "Showcase demo" "$case/eb1a/evidence-list.md"
check "review packet builds over both workspaces" \
  node "$ROOT/skills/petition-portal/scripts/build-portal.mjs" "$case" -o "$TMP/packet.html"

if [ "$fails" -gt 0 ]; then echo "$fails failure(s)" >&2; exit 1; fi
echo "test-scaffold: all checks passed"
