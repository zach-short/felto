#!/usr/bin/env bash
# Regenerate the icons, mascots and sounds.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/build_icons.py
python3 tools/build_mascots.py
python3 tools/build_sounds.py
