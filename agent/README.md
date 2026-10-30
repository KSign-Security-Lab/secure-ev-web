# Agent

The platform's agent is MITRE's Sandcat (gocat), vendored here so the binaries
can be **built from source, offline**, without a Caldera checkout.

```text
agent/
├── build.sh         # builds all targets from the vendored source
└── sandcat/         # gocat source, pinned (see sandcat/UPSTREAM)
    ├── vendor/      # committed Go module cache — no network needed to build
    ├── LICENSE      # Apache-2.0
    ├── NOTICE       # what we changed
    └── UPSTREAM     # upstream repo, commit and version
```

## Build

Needs a Go 1.24+ toolchain. No network: the module cache is vendored.

```sh
agent/build.sh [output-dir]      # default output dir: agent/out
```

This produces one binary per target, named as `/file/download` expects:

| Target          | Output file                 |
| --------------- | --------------------------- |
| linux/amd64     | `sandcat-linux-amd64`       |
| linux/arm64     | `sandcat-linux-arm64`       |
| windows/amd64   | `sandcat-windows-amd64.exe` |
| darwin/amd64    | `sandcat-darwin-amd64`      |
| darwin/arm64    | `sandcat-darwin-arm64`      |

No Go on the host? The C2 image (`apps/c2/Dockerfile`) runs this build in a
`golang` stage and copies the result into the payload directory the C2 serves.

## What is compiled in

The default build only: the **HTTP** contact, no gocat-extensions. That keeps
the dependency set to shlex, zeroconf and x/crypto and cross-compiles with
`CGO_ENABLED=0`. The C2 server address is not baked in — the deploy commands
pass it at runtime with `-server`.
