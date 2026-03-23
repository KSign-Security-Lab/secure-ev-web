# secure-ev-web

secure-ev-web is an open-source Breach and Attack Simulation (BAS) web platform focused on EV charging and adjacent security testing workflows.

It combines operational visibility, ATT&CK-aligned attack content, fuzzing job orchestration, and session-based interaction in one application.

## Core Capabilities

- `Dashboard`: consolidated metrics for abilities, agents, and MITRE coverage
- `Agents`: live inventory and posture views from external security platform APIs
- `Abilities`: searchable ATT&CK-oriented ability catalog backed by MySQL/Prisma
- `Fuzzing`: job lifecycle and report ingestion for protocol fuzzing workflows
- `Playground`: interactive session control through WebSocket-based terminal UX
- `Analysis Workspace`: analysis interface for code/security review flows (currently mock-data driven)

## Repository Layout

```text
.
├── apps/
│   └── web/                    # Next.js app (UI + tRPC routes)
├── packages/
│   ├── prisma/                 # DB schema, migrations, seed data, generated client
│   └── fuzzing-runner/         # Python mock runner utility
└── docker-compose.yml          # MySQL service for local development
```

## System Model

- External APIs provide live agent and session data.
- Prisma + MySQL store abilities, MITRE metadata, fuzzing jobs, and reports.
- tRPC routes in `apps/web` expose typed server operations to the UI.
- WebSocket channels support interactive terminal and notification flows.

## Project Status

- This repository was opened for public collaboration.
- Some areas are production-oriented, while others (for example parts of Analysis Workspace) are still prototype-level.
- Issues and pull requests are welcome.

## License

This project is open source. Workspace package metadata currently declares `MIT` for `@secure-ev-web/web` and `@secure-ev-web/prisma`.
