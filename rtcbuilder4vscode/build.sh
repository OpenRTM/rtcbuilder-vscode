#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

cd "$SCRIPT_DIR"

echo "==> Building extension in: $SCRIPT_DIR"

if [ ! -f package.json ]; then
  echo "ERROR: package.json not found in $SCRIPT_DIR" >&2
  exit 1
fi

mkdir -p "$DIST_DIR"

NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"
VSIX_FILE="$DIST_DIR/${NAME}-${VERSION}.vsix"

echo "==> Output: $VSIX_FILE"

rm -f "$VSIX_FILE"

if [ -f package-lock.json ]; then
  echo "==> Installing dependencies with npm ci"
  npm ci
else
  echo "==> package-lock.json not found, using npm install"
  npm install
fi

if npm run | grep -qE '^[[:space:]]+compile'; then
  echo "==> Running compile script"
  npm run compile
elif npm run | grep -qE '^[[:space:]]+build'; then
  echo "==> Running build script"
  npm run build
else
  echo "==> No compile/build script found, skipping"
fi

echo "==> Packaging VSIX"
npx @vscode/vsce package -o "$VSIX_FILE"

echo "==> Done: $VSIX_FILE"

echo "==> Cleanup node_modules"
rm -rf $SCRIPT_DIR/node_modules
echo "==> Done: cleanup node_module"

