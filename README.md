# secure-ev-web

secure-ev-web is an open-source Breach and Attack Simulation (BAS) web platform focused on EV charging and adjacent security testing workflows.

It combines operational visibility, ATT&CK-aligned attack content, fuzzing job orchestration, and session-based interaction in one application.

## Core Capabilities

- `Dashboard`: consolidated metrics for abilities, agents, and MITRE coverage
- `Agents`: live inventory of agents checked in to the built-in C2, plus Sandcat deployment
- `Abilities`: searchable ATT&CK-oriented ability catalog backed by MySQL/Prisma
- `Fuzzing`: job lifecycle and report ingestion for protocol fuzzing workflows
- `Playground`: interactive command execution against a selected agent
- `Analysis Workspace`: analysis interface for code/security review flows (currently mock-data driven)
- `Integrations`: connect external security products over their API, or collect logs from products without one through a generated Fluent Bit install script

## Repository Layout

```text
.
├── apps/
│   ├── web/                    # Next.js app (UI + tRPC routes)
│   └── c2/                     # standalone C2 service (agent-facing endpoints)
├── agent/                      # sandcat agent source, vendored; built from source
├── packages/
│   ├── prisma/                 # DB schema, migrations, seed data, generated client
│   └── fuzzing-runner/         # Python mock runner utility
├── scripts/airgap/             # build and install bundles for a closed network
└── docker-compose.yml          # MySQL + the C2 service
```

The agent binaries served to targets are **built from the vendored source** in
`agent/` (see `agent/README.md`) — no Caldera checkout is needed. The C2 service
seeds them into its payload directory at startup; that directory is also where
collected ability payloads are dropped, and it is not committed.

## Local Ports

This project's band is 4200-4299. See `~/PORTS.md` for the allocation across the
five projects sharing this machine.

| Port | Service |
| ---- | ------- |
| 4200 | Next.js web app (`pnpm dev`) — operator UI and tRPC API only |
| 4201 | WebSocket notification channel (client fallback when `NEXT_PUBLIC_WS_URL` is unset) |
| 4202 | MySQL (host mapping for the `mysql` container, which still listens on 3306 internally) |
| 4203 | Prisma Studio (`pnpm prisma:studio`) |
| 4204 | C2 service — the agent-facing endpoints (`/beacon`, `/file/download`, `/file/upload`) |

Integrated products listen on their own ports and are configured per integration
from the Integrations page, not through this range.

Ports belonging to external systems (fuzzing targets) are configured through `.env`
and are not part of this range.

## System Model

- The platform runs its own C2 as a **standalone service** (`apps/c2`, port
  4204), separate from the operator UI. Agents (MITRE's Sandcat, Apache-2.0)
  beacon to `POST /beacon`, fetch their binary from `/file/download` and exfil
  to `/file/upload`; all three speak Sandcat's native HTTP contact protocol, so
  stock agents work unmodified. There is no dependency on a Caldera server, and
  the agent is built from vendored source (`agent/`) rather than copied from one.
- The C2 and the web app share state only through the database, so only the C2's
  port need be exposed to target hosts; the unauthenticated operator UI stays on
  the internal network.
- The whole stack runs on a closed network. See `scripts/airgap/` to build a
  bundle on a connected machine and install it where there is no internet.
- Terminal commands are queued per agent and collected on its next beacon. While
  an operator has a terminal attached the server returns a one-second beacon
  interval, so commands round-trip in about a second and the agent drops back to
  its normal interval when the terminal closes.
- Integrations reach products two ways: API-mode adapters poll the product directly, while AGENT-mode products push records to `/api/ingest` from a Fluent Bit agent installed with a generated, per-integration token.
- Prisma + MySQL store abilities, MITRE metadata, fuzzing jobs, reports, integrations, and collected logs.
- tRPC routes in `apps/web` expose typed server operations to the UI.
- A WebSocket channel carries in-app notifications.

### C2 configuration

`C2_PUBLIC_URL` (in the root `.env`, read by the web app) seeds the callback
address baked into generated install commands. It must be reachable from the
target host — not `localhost` — and should point at the C2 port, e.g.
`http://10.0.0.5:4204`. It is editable afterwards from the deploy modal's
Configuration tab, along with the implant name, beacon timers, watchdog and
untrusted timer.

The C2 service itself is configured through its own environment (see
`docker-compose.yml`): `DATABASE_URL`, `C2_PORT` (4204), `C2_PAYLOAD_DIR`,
`C2_EXFIL_DIR` and `C2_MAX_UPLOAD_MB`.

## Project Status

- This repository was opened for public collaboration.
- Some areas are production-oriented, while others (for example parts of Analysis Workspace) are still prototype-level.
- Issues and pull requests are welcome.

## License

This project is open source. Workspace package metadata currently declares `MIT` for `@secure-ev-web/web` and `@secure-ev-web/prisma`.
