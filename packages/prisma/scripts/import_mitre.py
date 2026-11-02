#!/usr/bin/env python3
"""Rebuild data/mitre_list.json from MITRE's Enterprise ATT&CK STIX bundle.

Writes one row per (tactic, technique) and per (tactic, sub-technique), so the
Mitre table carries the full matrix: every active parent technique and
sub-technique, with the tactic column it sits in and the tactic's position in
the matrix. Revoked and deprecated techniques are left out.

The bundle is cached at .cache/attack/enterprise-attack.json:

    python3 scripts/import_mitre.py --fetch     # download the latest bundle
    python3 scripts/import_mitre.py             # rebuild from the cache

``load_attack`` is also used by import_abilities.py to move ability rows off
revoked technique IDs (e.g. T1562.001 -> T1685) via the bundle's revoked-by
relationships.
"""

import argparse
import json
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_STIX = os.path.join(ROOT, ".cache", "attack", "enterprise-attack.json")
DEFAULT_OUT = os.path.join(ROOT, "data", "mitre_list.json")
STIX_URL = (
    "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/"
    "master/enterprise-attack/enterprise-attack.json"
)


def _external_id(obj):
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack":
            return ref.get("external_id")
    return None


def _active(obj):
    return not obj.get("revoked") and not obj.get("x_mitre_deprecated")


def load_attack(stix_path=DEFAULT_STIX):
    """Parse the bundle.

    Returns a dict with:
      version     ATT&CK release, e.g. "20.0"
      tactics     [(shortname, name)] in matrix order
      techniques  {id: {"name", "tactics": [shortname], "parent": id|None}} (active only)
      revoked     {old id: replacement id} following revoked-by chains
    """
    with open(stix_path, encoding="utf-8") as f:
        objects = json.load(f)["objects"]
    by_ref = {o["id"]: o for o in objects}

    version = next(
        (o.get("x_mitre_version") for o in objects if o["type"] == "x-mitre-collection"),
        None,
    )
    matrix = next(o for o in objects if o["type"] == "x-mitre-matrix" and _active(o))
    tactics = [
        (by_ref[ref]["x_mitre_shortname"], by_ref[ref]["name"])
        for ref in matrix["tactic_refs"]
    ]

    techniques = {}
    for obj in objects:
        if obj["type"] != "attack-pattern" or not _active(obj):
            continue
        tid = _external_id(obj)
        if not tid:
            continue
        techniques[tid] = {
            "name": obj["name"],
            "tactics": [
                phase["phase_name"]
                for phase in obj.get("kill_chain_phases", [])
                if phase.get("kill_chain_name") == "mitre-attack"
            ],
            "parent": tid.split(".")[0] if obj.get("x_mitre_is_subtechnique") else None,
        }

    revoked_by = {
        o["source_ref"]: o["target_ref"]
        for o in objects
        if o["type"] == "relationship" and o.get("relationship_type") == "revoked-by"
    }
    revoked = {}
    for obj in objects:
        if obj["type"] != "attack-pattern" or not obj.get("revoked"):
            continue
        old_id, ref, hops = _external_id(obj), obj["id"], 0
        while ref in revoked_by and hops < 10:  # follow chains to the live technique
            ref, hops = revoked_by[ref], hops + 1
        new_id = _external_id(by_ref[ref]) if ref in by_ref else None
        if old_id and new_id and new_id != old_id and new_id in techniques:
            revoked[old_id] = new_id

    return {"version": version, "tactics": tactics, "techniques": techniques, "revoked": revoked}


def build_rows(attack):
    order = {short: i for i, (short, _) in enumerate(attack["tactics"])}
    names = dict(attack["tactics"])
    techniques = attack["techniques"]
    rows = []
    for tid, tech in techniques.items():
        parent_id = tech["parent"] or tid
        parent = techniques.get(parent_id)
        if parent is None:  # sub-technique whose parent is not active; skip
            continue
        for tactic in tech["tactics"]:
            if tactic not in order:
                continue
            rows.append(
                {
                    "tactic": tactic,
                    "tactic_name": names[tactic],
                    "tactic_order": order[tactic],
                    "technique_id": parent_id,
                    "technique_name": parent["name"],
                    "subtechnique_id": tid if tech["parent"] else None,
                    "subtechnique_name": tech["name"] if tech["parent"] else None,
                    "platform": "Enterprise",
                }
            )
    rows.sort(
        key=lambda r: (r["tactic_order"], r["technique_id"], r["subtechnique_id"] or "")
    )
    return rows


def fetch(stix_path):
    os.makedirs(os.path.dirname(stix_path), exist_ok=True)
    print(f"downloading {STIX_URL}", file=sys.stderr)
    tmp = stix_path + ".part"
    urllib.request.urlretrieve(STIX_URL, tmp)
    os.replace(tmp, stix_path)


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--stix", default=DEFAULT_STIX, help="Enterprise ATT&CK STIX bundle")
    parser.add_argument("--out", default=DEFAULT_OUT, help="mitre_list.json to write")
    parser.add_argument("--fetch", action="store_true", help="download the latest bundle first")
    args = parser.parse_args()

    if args.fetch or not os.path.exists(args.stix):
        fetch(args.stix)

    attack = load_attack(args.stix)
    rows = build_rows(attack)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=1, ensure_ascii=False)
        f.write("\n")

    parents = {r["technique_id"] for r in rows}
    subs = {r["subtechnique_id"] for r in rows if r["subtechnique_id"]}
    print(
        f"ATT&CK {attack['version']}: {len(attack['tactics'])} tactics, "
        f"{len(parents)} techniques, {len(subs)} sub-techniques, {len(rows)} rows -> {args.out}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
