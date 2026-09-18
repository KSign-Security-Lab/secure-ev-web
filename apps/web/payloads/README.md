# Agent payloads

`/file/download` serves the sandcat binary matching the requesting agent's
`platform` header from this directory. The binaries are deliberately **not**
committed — they are ~19MB and this repository is public.

Populate them from a Caldera checkout:

```sh
cp <caldera>/plugins/sandcat/payloads/sandcat.go-linux   apps/web/payloads/
cp <caldera>/plugins/sandcat/payloads/sandcat.go-windows apps/web/payloads/
cp <caldera>/plugins/sandcat/payloads/sandcat.go-darwin  apps/web/payloads/
```

Expected filenames: `sandcat.go-linux`, `sandcat.go-windows`, `sandcat.go-darwin`.
