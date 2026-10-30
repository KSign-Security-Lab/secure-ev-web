#!/usr/bin/env sh
# Seed the agent binaries into the payload directory (a mounted volume) without
# clobbering ability payloads the operator has added, then run the C2.
set -eu

mkdir -p "${C2_PAYLOAD_DIR:-/data/payloads}" "${C2_EXFIL_DIR:-/data/exfil}"
for src in /opt/agent-binaries/*; do
  [ -e "$src" ] || continue
  dest="${C2_PAYLOAD_DIR:-/data/payloads}/$(basename "$src")"
  if [ ! -e "$dest" ]; then
    cp "$src" "$dest"
    echo "[c2] seeded agent binary $(basename "$src")"
  fi
done

exec "$@"
