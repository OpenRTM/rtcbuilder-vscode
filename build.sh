#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"

DIRS=(
  rtcbuilder4vscode
  rtcbuilder4vscode-java
  rtcbuilder4vscode-lua
  rtcbuilder4vscode-processing
  rtcbuilder4vscode-python
)

cd "$ROOT_DIR"

mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR"/*.vsix

echo "==> Building all extensions..."

for d in "${DIRS[@]}"; do
  echo "----------------------------------------"
  echo "==> build: $d"
  (cd "$ROOT_DIR/$d" && ./build.sh)
done

echo "----------------------------------------"
echo "==> All done."
