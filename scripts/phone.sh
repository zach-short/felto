#!/usr/bin/env bash
# Build the app and install it on the connected iPhone. Local build, no EAS.
#   scripts/phone.sh            Release build: JS is bundled in, runs without the Mac.
#   scripts/phone.sh debug      Debug dev client: needs Metro (scripts/start.sh).
# Override the phone with: PHONE=<udid> scripts/phone.sh
set -euo pipefail
cd "$(dirname "$0")/.."
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8  # CocoaPods crashes without a UTF-8 locale

PHONE="${PHONE:-00008150-0010050A0247801C}"
MODE="${1:-release}"

case "$MODE" in
  release) ARGS=(--configuration Release) ;;
  debug)   ARGS=() ;;
  *) echo "usage: scripts/phone.sh [release|debug]" >&2; exit 2 ;;
esac

[ -d app/node_modules ] || bun install --cwd app
exec bun run --cwd app ios -- --device "$PHONE" "${ARGS[@]}"
