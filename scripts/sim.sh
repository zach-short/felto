#!/usr/bin/env bash
# Build the dev client and open it on an iOS simulator. Default: iPhone 17 Pro.
#   SIM="iPhone 17" scripts/sim.sh
set -euo pipefail
cd "$(dirname "$0")/.."
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8  # CocoaPods crashes without a UTF-8 locale
exec bun run --cwd app ios -- --device "${SIM:-iPhone 17 Pro}"
