#!/usr/bin/env bash
# Assert the source case workspace is untouched by work in this repo.
# Material is ported OUT of it, read-only. Nothing is ever written back.
#
# Usage: scripts/guard-source-repo.sh [path-to-source-repo]
#        SOURCE_CASE_REPO=/path/to/case scripts/guard-source-repo.sh
set -euo pipefail

SRC="${1:-${SOURCE_CASE_REPO:-}}"
if [ -z "$SRC" ]; then
  echo "guard: no source repo configured (pass a path or set SOURCE_CASE_REPO) — skipping"
  exit 0
fi
BASELINE="$(dirname "$0")/../.source-repo-baseline"

if [ ! -d "$SRC/.git" ]; then
  echo "guard: source repo not found at $SRC — skipping"; exit 0
fi

current="$(cd "$SRC" && git status --porcelain | sort)"

if [ ! -f "$BASELINE" ]; then
  printf '%s\n' "$current" > "$BASELINE"
  echo "guard: baseline recorded ($(printf '%s' "$current" | grep -c . || true) entries)"
  exit 0
fi

if diff -q <(printf '%s\n' "$current") "$BASELINE" >/dev/null; then
  echo "guard: source repo unchanged ✓"
else
  echo "guard: SOURCE REPO CHANGED since baseline" >&2
  diff "$BASELINE" <(printf '%s\n' "$current") >&2 || true
  exit 1
fi
