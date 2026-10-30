#!/usr/bin/env bash
# Build an offline bundle on a CONNECTED machine.
#
# Produces one tarball with everything needed to stand the platform up on a
# closed network: Docker images, the pnpm offline store, the ability data and
# collected payloads, and the agent source cache. Nothing here reaches the
# internet on the target side.
#
#   scripts/airgap/bundle.sh [output-dir]
#
# Output: <output-dir>/bas-airgap-<date>.tar.zst (default output-dir: ./dist)
set -euo pipefail

REPO="$(cd -- "$(dirname -- "$0")/../.." && pwd)"
OUT_DIR="${1:-$REPO/dist}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

GOLANG_IMAGE="golang:1.24-bookworm"
NODE_IMAGE="node:22-bookworm-slim"
MYSQL_IMAGE="mysql:9.5.0"
C2_IMAGE="bas-platform-c2:latest"

echo "==> Pulling base images"
docker pull "$GOLANG_IMAGE"
docker pull "$NODE_IMAGE"
docker pull "$MYSQL_IMAGE"

echo "==> Building the C2 image"
docker build -t "$C2_IMAGE" -f "$REPO/apps/c2/Dockerfile" "$REPO"

echo "==> Saving images"
mkdir -p "$STAGE/images"
docker save "$MYSQL_IMAGE" "$C2_IMAGE" "$GOLANG_IMAGE" "$NODE_IMAGE" \
  | zstd -q -o "$STAGE/images/images.tar.zst"

echo "==> Fetching the pnpm offline store"
# Populates the virtual store cache from the lockfile without building anything.
( cd "$REPO" && pnpm fetch )
# The store lives in the pnpm store dir; capture it for --offline installs.
PNPM_STORE="$(pnpm store path)"
mkdir -p "$STAGE/pnpm-store"
cp -a "$PNPM_STORE/." "$STAGE/pnpm-store/"

echo "==> Building the ability catalog and collecting payloads"
( cd "$REPO/packages/prisma" \
  && python3 scripts/import_abilities.py --fetch \
       --payload-out "$STAGE/payloads" )
mkdir -p "$STAGE/data"
cp "$REPO/packages/prisma/data/data.json" "$STAGE/data/data.json"
# The source cache lets the catalog be rebuilt offline later if needed.
if [ -d "$REPO/packages/prisma/.cache" ]; then
  cp -a "$REPO/packages/prisma/.cache" "$STAGE/source-cache"
fi

echo "==> Packing the repository (excluding git and node_modules)"
git -C "$REPO" archive --format=tar --prefix=repo/ HEAD | tar -x -C "$STAGE"

mkdir -p "$OUT_DIR"
BUNDLE="$OUT_DIR/bas-airgap-$(date +%Y%m%d).tar.zst"
echo "==> Writing $BUNDLE"
tar -C "$STAGE" -cf - . | zstd -q -o "$BUNDLE"
echo "Done: $BUNDLE"
echo "Copy it to the closed network and run scripts/airgap/install.sh there."
