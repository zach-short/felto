#!/usr/bin/env bash
# Fast app-only check (no asset regeneration): typecheck, lint, test.
set -euo pipefail
cd "$(dirname "$0")/.."
bun run --cwd app typecheck
bun run --cwd app lint
bun run --cwd app test
