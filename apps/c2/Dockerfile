# syntax=docker/dockerfile:1
# Build context is the repo root (see docker-compose.yml).

# --- Stage 1: build the sandcat agent binaries from vendored source ----------
FROM golang:1.24-bookworm AS agent
WORKDIR /agent
COPY agent/ ./
# Vendored deps, so this stage needs no network.
RUN sh build.sh /agent-out

# --- Stage 2: the C2 service --------------------------------------------------
FROM node:22-bookworm-slim AS runtime
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
# openssl is needed by the Prisma query engine; ca-certificates for TLS.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# Workspace manifests first, for layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/c2/package.json apps/c2/
COPY packages/prisma/package.json packages/prisma/
COPY packages/c2-core/package.json packages/c2-core/
RUN pnpm install --frozen-lockfile --filter @secure-ev-web/c2... || pnpm install --filter @secure-ev-web/c2...

# Source for the C2 app, the shared engine, and the prisma package
# (schema + generated client).
COPY packages/prisma/ packages/prisma/
COPY packages/c2-core/ packages/c2-core/
COPY apps/c2/ apps/c2/
# prisma generate validates the datasource env even though it does not connect.
RUN DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder" \
    pnpm --filter @secure-ev-web/prisma run prisma:generate

# Agent binaries built in stage 1, seeded into the payload dir at startup.
COPY --from=agent /agent-out/ /opt/agent-binaries/
COPY apps/c2/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV C2_PORT=4204 \
    C2_PAYLOAD_DIR=/data/payloads \
    C2_EXFIL_DIR=/data/exfil
EXPOSE 4204

WORKDIR /app/apps/c2
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "start"]
