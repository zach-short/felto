#!/usr/bin/env bash
# SessionStart: puts `personal-config` on PATH for the skills (autopilot, delegate, passoff...),
# which call it by bare name. Locally the shell function wins and this does nothing harmful.
set -euo pipefail
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
dir="$HOME/.local/bin"
mkdir -p "$dir"
printf '#!/usr/bin/env bash\nexec node "%s/.claude/bin/personal-config.js" "$@"\n' "$root" > "$dir/personal-config"
chmod +x "$dir/personal-config"
case ":$PATH:" in *":$dir:"*) ;; *) [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export PATH=\"$dir:\$PATH\"" >> "$CLAUDE_ENV_FILE" ;; esac
