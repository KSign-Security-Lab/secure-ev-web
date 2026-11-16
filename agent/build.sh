#!/usr/bin/env sh
# Build the sandcat agent binaries from the vendored source in ./sandcat.
#
# Fully offline: the Go module cache is vendored (sandcat/vendor), so this needs
# only a Go toolchain (1.24+) and no network. The C2 Dockerfile runs this same
# build in a golang image for hosts without Go.
#
# Output: one binary per target in the directory given as $1 (default ./out),
# named sandcat-<os>-<arch>[.exe] — the names /file/download resolves.
#
# The C2 server address is NOT baked in; the deploy commands pass it with
# -server at runtime. main.key is a fixed static key so builds are reproducible.
set -eu

OUT="${1:-./out}"
SRC="$(CDPATH= cd -- "$(dirname -- "$0")/sandcat" && pwd)"
KEY="${SANDCAT_KEY:-bas-static-key}"
# `linux/arm` is the 32-bit ARM target (Raspberry Pi OS 32-bit, ARMv7 — Pi 2/3/4).
# It is built with GOARM=7; the output is still named sandcat-linux-arm, which is
# what /file/download resolves for `architecture: arm`. ARMv6 (Pi Zero / Pi 1)
# would need a separate GOARM=6 build and a distinct name — out of scope here.
TARGETS="linux/amd64 linux/arm64 linux/arm windows/amd64 darwin/amd64 darwin/arm64"

mkdir -p "$OUT"
for target in $TARGETS; do
  GOOS="${target%/*}"
  GOARCH="${target#*/}"
  ext=""
  [ "$GOOS" = windows ] && ext=".exe"
  # 32-bit ARM needs a GOARM level; pin ARMv7 so it runs on Pi 2/3/4 userlands.
  goarm=""
  [ "$GOARCH" = arm ] && goarm=7
  echo "building sandcat-$GOOS-$GOARCH$ext"
  ( cd "$SRC" && \
    CGO_ENABLED=0 GOOS="$GOOS" GOARCH="$GOARCH" GOARM="$goarm" GOFLAGS=-mod=vendor GOPROXY=off \
    go build -trimpath -ldflags "-s -w -X main.key=$KEY" \
      -o "$OUT/sandcat-$GOOS-$GOARCH$ext" sandcat.go )
done
echo "done -> $OUT"
