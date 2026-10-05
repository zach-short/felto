#!/usr/bin/env bash
# Build the dev client and open it on the Android emulator or a connected phone.
set -euo pipefail
cd "$(dirname "$0")/.."
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8  # CocoaPods crashes without a UTF-8 locale
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home -v 17)}"
exec bun run --cwd app android
