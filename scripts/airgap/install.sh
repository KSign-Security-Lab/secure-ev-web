#!/usr/bin/env bash
# Install the platform on the CLOSED network from a bundle made by bundle.sh.
#
#   scripts/airgap/install.sh <bundle.tar.zst> [install-dir]
#
# install-dir defaults to ./bas-platform. Needs Docker, Node + pnpm, and
# python3. No network access is used.
set -euo pipefail

BUNDLE="${1:?usage: install.sh <bundle.tar.zst> [install-dir]}"
DEST="${2:-$PWD/bas-platform}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "==> Unpacking bundle"
zstd -dc "$BUNDLE" | tar -x -C "$STAGE"

echo "==> Loading Docker images"
zstd -dc "$STAGE/images/images.tar.zst" | docker load

echo "==> Placing the repository in $DEST"
mkdir -p "$DEST"
cp -a "$STAGE/repo/." "$DEST/"
cd "$DEST"

echo "==> Restoring the ability data and source cache"
cp "$STAGE/data/data.json" packages/prisma/data/data.json
[ -d "$STAGE/source-cache" ] && cp -a "$STAGE/source-cache" packages/prisma/.cache || true

echo "==> Seeding collected ability payloads into the C2 payload dir"
mkdir -p apps/c2/data/payloads apps/c2/data/exfil
if [ -d "$STAGE/payloads" ]; then
  cp -a "$STAGE/payloads/." apps/c2/data/payloads/
fi

echo "==> Installing node dependencies offline"
# Point pnpm at the bundled store and install without touching the network.
pnpm config set store-dir "$STAGE/pnpm-store" --location project
pnpm install --offline --frozen-lockfile

echo "==> Starting MySQL"
docker compose up -d mysql
# Wait for the database to accept connections.
for _ in $(seq 1 30); do
  docker compose exec -T mysql mysqladmin -uroot -p1234 ping >/dev/null 2>&1 && break
  sleep 2
done

echo "==> Applying migrations and seeding the catalog"
set -a; . ./.env 2>/dev/null || true; set +a
( cd packages/prisma && pnpm exec prisma migrate deploy && pnpm exec tsx seed.ts )

echo "==> Starting the C2 service"
docker compose up -d c2

cat <<EOF

Done.
  - Web UI:  start with 'pnpm dev' (http://<host>:4200)
  - C2:      http://<host>:4204  (agents beacon here)
Set C2_PUBLIC_URL in .env to an address the targets can reach, then rebuild the
deploy commands from the Agents page.
EOF
