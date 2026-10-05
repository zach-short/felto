#!/usr/bin/env bash
# Rebuild native projects from app.json (use after changing plugins or native deps).
# Regenerates app/ios and app/android, which are gitignored.
set -euo pipefail
cd "$(dirname "$0")/.."
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8  # CocoaPods crashes without a UTF-8 locale
bun install --cwd app
cd app && bunx expo prebuild --clean
