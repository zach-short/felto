#!/usr/bin/env bash
# The whole-repo gate: regenerate the assets, check the SVGs, then typecheck, lint and test the app.
# Afterwards: git diff --stat -- assets/icons assets/mascots assets/sounds (any line must be meant).
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/build_icons.py
python3 tools/build_mascots.py
python3 tools/build_sounds.py
xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg
bun run --cwd app typecheck
bun run --cwd app lint
bun run --cwd app test
