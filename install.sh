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

echo "----------------------------------------"
echo "==> Installing VSIX files..."

shopt -s nullglob
VSIX_FILES=("$DIST_DIR"/*.vsix)
shopt -u nullglob

if [ ${#VSIX_FILES[@]} -eq 0 ]; then
  echo "ERROR: No VSIX files found in $DIST_DIR" >&2
  exit 1
fi

for v in "${VSIX_FILES[@]}"; do
  echo "==> install: $(basename "$v")"
  code --install-extension "$v" --force
done

echo "----------------------------------------"
echo "==> All done."
