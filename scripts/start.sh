#!/usr/bin/env bash
# Start Metro for a debug dev-client build. Add --clear to reset the cache.
set -euo pipefail
cd "$(dirname "$0")/.."
exec bun run --cwd app start -- "$@"
