#!/usr/bin/env python3
"""Rebuild data/data.json from Caldera's published ability content.

Sources are the ones a stock Caldera server loads abilities from:

- plugin ability files (stockpile, response, training, access, manx, sandcat and
  the caldera-ot plugins), in both the v1 ``platforms:`` and v2 ``executors:``
  formats;
- Atomic Red Team, converted the way the ``atomic`` plugin converts it;
- the CTID Adversary Emulation Library, ingested the way the ``emu`` plugin does.

Plus one CTID micro emulation plan (ApacheEmu, T1190) that has no Caldera form,
and, deduplicated against all of the above, procedures from ForgeArmory,
Leonidas, Stratus Red Team and PurpleSharp (see EXTRA_REPOS).

Each Caldera ability becomes one row per distinct (executor, command, payloads)
variant; platforms sharing a variant are joined as e.g. "Darwin,Linux". Rows in
the existing data.json that are not superseded by an imported ability are kept.

    python3 scripts/import_abilities.py --fetch            # clone/update sources
    python3 scripts/import_abilities.py                    # rebuild from cache
"""

import argparse
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import uuid
from collections import defaultdict

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CACHE = os.path.join(ROOT, ".cache", "ability-sources")
DEFAULT_DATA = os.path.join(ROOT, "data", "data.json")
ATTACK_STIX = os.path.join(ROOT, ".cache", "attack", "enterprise-attack.json")

CALDERA_PLUGINS = {
    "stockpile": "https://github.com/mitre/stockpile",
    "response": "https://github.com/mitre/response",
    "training": "https://github.com/mitre/training",
    "access": "https://github.com/mitre/access",
    "manx": "https://github.com/mitre/manx",
    "sandcat": "https://github.com/mitre/sandcat",
    "bacnet": "https://github.com/mitre/bacnet",
    "modbus": "https://github.com/mitre/modbus",
    "dnp3": "https://github.com/mitre/dnp3",
    "profinet": "https://github.com/mitre/profinet",
    "iec61850": "https://github.com/mitre/iec61850",
    "gems": "https://github.com/mitre/gems",
}
ATOMIC_REPO = ("atomic-red-team", "https://github.com/redcanaryco/atomic-red-team")
EMU_REPO = (
    "adversary_emulation_library",
    "https://github.com/center-for-threat-informed-defense/adversary_emulation_library",
)

PLATFORM_LABELS = {"windows": "Windows", "linux": "Linux", "darwin": "Darwin"}

# Misspelled or technique-named tactics found in upstream ability files.
TACTIC_FIXES = {
    "defensive-evasion": "defense-evasion",
    "commmand-and-control": "command-and-control",
    "credential-dumping": "credential-access",
    "os-credential-dumping": "credential-access",
    "hijack-execution-flow---dll-search-order-hijacking": "persistence",
}


# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------


def fetch(cache):
    os.makedirs(cache, exist_ok=True)
    repos = dict(CALDERA_PLUGINS)
    repos.update([ATOMIC_REPO, EMU_REPO])
    repos.update(EXTRA_REPOS)
    for name, url in repos.items():
        path = os.path.join(cache, name)
        if os.path.isdir(os.path.join(path, ".git")):
            subprocess.run(["git", "fetch", "-q", "--depth", "1", "origin", "HEAD"], cwd=path, check=True)
            subprocess.run(["git", "reset", "-q", "--hard", "FETCH_HEAD"], cwd=path, check=True)
        else:
            subprocess.run(["git", "clone", "-q", "--depth", "1", url, path], check=True)
        print(f"fetched {name}", file=sys.stderr)


def load_yaml(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            return yaml.safe_load(f)
    except yaml.YAMLError as e:
        print(f"skip {path}: {e}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Rows
# ---------------------------------------------------------------------------


def platform_label(name):
    return PLATFORM_LABELS.get(str(name).lower(), "Unknown")


def attack_type(technique_id):
    return "ICS" if technique_id.startswith("T0") else "Enterprise"


def as_text(value):
    if value is None:
        return ""
    return value if isinstance(value, str) else str(value)


def build_rows(ability_id, name, description, tactic, technique_id, technique_name, variants):
    """variants: [(platform, executor, command, payloads)] -> seed rows."""
    grouped = {}
    for platform, executor, command, payloads in variants:
        key = (executor, command, tuple(payloads))
        grouped.setdefault(key, [])
        label = platform_label(platform)
        if label not in grouped[key]:
            grouped[key].append(label)

    rows = []
    order = list(PLATFORM_LABELS.values()) + ["Unknown"]
    for (executor, command, payloads), platforms in grouped.items():
        platforms = sorted(platforms, key=order.index)
        row_id = ability_id
        if len(grouped) > 1:
            row_id = f"{ability_id}-{'_'.join(platforms).lower()}-{executor}"
        rows.append(
            dict(
                id=row_id,
                ability_name=as_text(name),
                description=as_text(description),
                tactic=as_text(tactic),
                technique_id=as_text(technique_id),
                technique_name=as_text(technique_name),
                platform=",".join(platforms),
                shell_type=executor,
                command=command,
                payloads=",".join(payloads),
                type=attack_type(as_text(technique_id)),
            )
        )
    return rows


def caldera_ability_rows(ab):
    """One Caldera ability (v1 or v2 format) -> seed rows."""
    if "platforms" not in ab:  # v2; emu entries carry an `executors` metadata list beside v1 `platforms`
        technique_id = ab.get("technique_id", "")
        technique_name = ab.get("technique_name", "")
        variants = [
            (ex.get("platform", ""), ex.get("name", ""), as_text(ex.get("command")), ex.get("payloads") or [])
            for ex in ab["executors"] or []
        ]
    else:  # v1
        technique = ab.get("technique") or {}
        technique_id = technique.get("attack_id", "")
        technique_name = technique.get("name", "")
        variants = []
        for platform, executors in (ab.get("platforms") or {}).items():
            for executor, details in (executors or {}).items():
                details = details or {}
                variants.append((platform, executor, as_text(details.get("command")), details.get("payloads") or []))
    variants = [v for v in variants if v[2].strip() or v[3]]
    tactic = "-".join(as_text(ab.get("tactic")).lower().split())
    tactic = TACTIC_FIXES.get(tactic, tactic)
    return build_rows(as_text(ab["id"]), ab.get("name"), ab.get("description"), tactic, technique_id, technique_name, variants)


def caldera_file_abilities(path):
    docs = load_yaml(path)
    if not isinstance(docs, list):
        return []
    return [ab for ab in docs if isinstance(ab, dict) and "id" in ab and ("platforms" in ab or "executors" in ab)]


def import_plugins(cache):
    rows = []
    for name in CALDERA_PLUGINS:
        for path in sorted(glob.glob(os.path.join(cache, name, "data", "abilities", "**", "*.yml"), recursive=True)):
            for ab in caldera_file_abilities(path):
                rows.extend(caldera_ability_rows(ab))
    return rows


def import_emu(cache):
    """Mirrors emu_svc: every <plan>/Emulation_Plan/yaml/*.yaml in the library."""
    rows = []
    pattern = os.path.join(cache, EMU_REPO[0], "**", "Emulation_Plan", "yaml", "*.yaml")
    for path in sorted(glob.glob(pattern, recursive=True)):
        for ab in caldera_file_abilities(path):
            rows.extend(caldera_ability_rows(ab))
    return rows


def import_micro_plans(cache):
    """CTID micro emulation plans that cover a technique Caldera has no ability for."""
    readme = os.path.join(cache, EMU_REPO[0], "micro_emulation_plans", "src", "apache_rce", "README.md")
    if not os.path.isfile(readme):
        return []
    ability_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "ctid-micro-emulation-plans/apache_rce"))
    description = (
        "CTID micro emulation plan: installs a vulnerable Apache 2.4 web server, exploits "
        "CVE-2021-41773 against it, runs whoami/systeminfo/ipconfig through the exploit, then "
        "cleans up. Self-contained on one host. ApacheEmu.exe is built from "
        "adversary_emulation_library/micro_emulation_plans/src/apache_rce."
    )
    return build_rows(
        ability_id,
        "Apache RCE micro emulation (CVE-2021-41773)",
        description,
        "initial-access",
        "T1190",
        "Exploit Public-Facing Application",
        [("windows", "psh", ".\\ApacheEmu.exe", ["ApacheEmu.exe"])],
    )


# ---------------------------------------------------------------------------
# Atomic Red Team — ported from mitre/atomic app/atomic_svc.py (Apache-2.0)
# ---------------------------------------------------------------------------

ART_PLATFORMS = dict(windows="windows", macos="darwin", linux="linux")
ART_EXECUTORS = dict(command_prompt="cmd", sh="sh", powershell="psh", bash="sh")
RE_VARIABLE = re.compile("(#{(.*?)})", re.DOTALL)
RE_RESERVED = re.compile(r"#{(server|group|paw|location|exe_name|upstream_dest|payload:.*?)}", re.DOTALL)
PREFIX_HASH_LEN = 6


class ExtractionError(Exception):
    pass


class AtomicConverter:
    def __init__(self, repo_dir, payload_out=None):
        self.repo_dir = repo_dir
        self.payload_out = payload_out
        self.technique_to_tactics = defaultdict(list)
        stix = os.path.join(repo_dir, "atomic_red_team", "enterprise-attack.json")
        if os.path.isfile(stix):
            with open(stix, encoding="utf-8") as f:
                for obj in json.load(f).get("objects", []):
                    if obj.get("type") != "attack-pattern":
                        continue
                    for ref in obj.get("external_references", []):
                        if ref.get("source_name") != "mitre-attack":
                            continue
                        for kc in obj.get("kill_chain_phases", []):
                            if kc.get("kill_chain_name") == "mitre-attack":
                                self.technique_to_tactics[ref.get("external_id")].append(kc.get("phase_name"))

    def rows(self):
        rows = []
        for path in sorted(glob.glob(os.path.join(self.repo_dir, "atomics", "**", "T*.yaml"), recursive=True)):
            entries = load_yaml(path)
            if not isinstance(entries, dict):
                continue
            for test in entries.get("atomic_tests") or []:
                try:
                    rows.extend(self.test_rows(entries, test))
                except Exception as e:  # one malformed test must not stop the import
                    print(f"skip atomic test {test.get('name')!r}: {e}", file=sys.stderr)
        return rows

    def test_rows(self, entries, test):
        ability_id = hashlib.md5(json.dumps(test, default=str).encode()).hexdigest()
        tactics = self.technique_to_tactics.get(entries["attack_technique"], ["redcanary-unknown"])
        tactic = "multiple" if len(tactics) > 1 else tactics[0]
        variants = []
        if test["executor"]["name"] != "manual":
            executor = ART_EXECUTORS.get(test["executor"]["name"], "unknown")
            for p in test["supported_platforms"]:
                platform = ART_PLATFORMS.get(p, "unknown")
                command, payloads = self.prepare_executor(test, platform, executor)
                variants.append((platform, executor, command, payloads))
        return build_rows(
            ability_id,
            test["name"],
            test.get("description", ""),
            tactic,
            entries["attack_technique"],
            entries["display_name"],
            variants,
        )

    def payload_name(self, path):
        with open(path, "rb") as f:
            digest = hashlib.md5(f.read()).hexdigest()
        return digest[:PREFIX_HASH_LEN] + "_" + os.path.basename(path)

    def catch_path_to_atomics_folder(self, text, platform):
        regex = re.compile(r"\$?PathToAtomicsFolder((?:/[^/ \n]+)+|(?:\\[^\\ \n]+)+)")
        payloads = []
        match = regex.search(text)
        if match:
            fullpath, path = match.group(0, 1)
            if platform == "windows":
                path = path.replace("\\", "/")
            path = os.path.join(self.repo_dir, "atomics", path[1:])
            if os.path.isfile(path):
                name = self.payload_name(path)
                payloads.append(name)
                text = text.replace(fullpath, name)
                if self.payload_out:
                    dest = os.path.join(self.payload_out, name)
                    if not os.path.isfile(dest):
                        os.makedirs(self.payload_out, exist_ok=True)
                        shutil.copyfile(path, dest)
        return text, payloads

    def use_default_inputs(self, test, platform, text):
        payloads = []
        defaults = test.get("input_arguments") or {}
        if RE_RESERVED.search(text):
            return text, payloads
        for _ in range(100):  # guards against self-referencing defaults
            match = RE_VARIABLE.search(text)
            if not match:
                break
            full, varname = match.groups()
            default = str((defaults.get(varname) or {}).get("default"))
            default, new_payloads = self.catch_path_to_atomics_folder(default, platform)
            payloads.extend(new_payloads)
            text = text.replace(full, default)
        return text, payloads

    def prepare_cmd(self, test, platform, executor, cmd):
        cmd, payloads = self.use_default_inputs(test, platform, cmd)
        cmd, more = self.catch_path_to_atomics_folder(cmd, platform)
        return handle_multiline_commands(cmd, executor), payloads + more

    def prepare_executor(self, test, platform, executor):
        dep_construct = ""
        for dependence in test.get("dependencies") or []:
            try:
                dep_construct = prereq_formatter(
                    dependence.get("prereq_command", ""),
                    dependence.get("get_prereq_command", ""),
                    test.get("dependency_executor_name", executor),
                    executor,
                    dep_construct,
                )
            except (ExtractionError, IndexError):
                pass
        command = test["executor"]["command"]
        precmd = f"{dep_construct} \n {command}" if dep_construct else command
        return self.prepare_cmd(test, platform, executor, precmd)


def handle_multiline_commands(cmd, executor):
    lines = cmd.strip().split("\n")
    if executor == "cmd":
        return " && ".join(remove_dos_comment_lines(lines))
    return concatenate_shell_commands(remove_shell_comments(lines, executor))


def concatenate_shell_commands(lines):
    out = []
    lines = [line for line in lines if line.strip()]
    for index, line in enumerate(lines):
        out.append(line)
        if re.search(r"do\s*$", line) or re.search(r"then\s*$", line) or re.search(r";\s*$", line):
            if not re.search(r"\s+$", line):
                out.append(" ")
        elif index < len(lines) - 1:
            out.append("; ")
    return "".join(out)


def remove_dos_comment_lines(lines):
    def is_comment(line):
        return re.match(r"^\s*@?\s*rem\s+", line, re.IGNORECASE) or re.match(r"^\s*::\s+", line, re.IGNORECASE)

    return [line for line in lines if not is_comment(line)]


def remove_shell_comments(lines, executor):
    def remove_escaped_quotes(line):
        return re.sub(r'`("|\')' if executor == "psh" else r"\\('|\")", "", line)

    def within_quotes(line, index):
        start = 0
        while start < len(line) and start <= index:
            rest = line[start:]
            quote = re.search(r"'|\"", rest)
            if not quote:
                return False
            open_at = quote.start()
            matches = list(re.finditer(rest[open_at], rest))
            if len(matches) > 1:
                close_at = matches[1].start()
                if open_at + start <= index <= close_at + start:
                    return True
                start = close_at + start + 1
            else:
                return True
        return False

    def remove_trailing_comment(line):
        for match in re.finditer(r"(;|\s)\s*#", line):
            if not within_quotes(remove_escaped_quotes(line[0 : match.end()]), match.start()):
                return line[0 : match.start()]
        return line

    out = []
    for line in lines:
        if not re.match(r"^\s*#", line):
            processed = remove_trailing_comment(line)
            if processed:
                out.append(processed)
    return out


def prereq_formatter(prereq_test, prereq, prereq_type, exec_type, ability_command):
    output = ""
    prereq = prereq.rstrip()
    if (
        "exit" not in prereq_test.lower()
        or prereq.startswith('echo "')
        or (prereq.startswith("echo ") and ("Run" in prereq or "Sorry," in prereq))
    ):
        raise ExtractionError
    if prereq_type == "sh":
        segments = prereq_test.split(";")
        if "exit 1" in segments[1]:
            output += f"{segments[0]}; then {prereq}; fi;"
        else:
            output += f"{segments[0]}; then : ; else {prereq}; fi;"
    elif prereq_type == "psh":
        if prereq_test.startswith("Try"):
            output += prereq_test.replace("exit 1", prereq).replace("exit 0", " ; ")
        else:
            segments = prereq_test.split(")")
            outcomes = segments[1].split("}")
            if "exit 1" in outcomes[0]:
                output += f"{segments[0]}) {{{prereq}}}"
            else:
                output += f"{segments[0]}) {{ ; }} else {{{prereq}}}"
    elif prereq_type == "cmd":
        segments = prereq_test.split("(")
        outcomes = segments[1].split("ELSE")
        if "exit 1" in outcomes[0]:
            output += f"{segments[0]} ({prereq})"
        else:
            output += f"{segments[0]} ( call ) ELSE ( {prereq} )"
    else:
        return ability_command
    if prereq_type == exec_type or (prereq_type == "cmd" and exec_type == "psh"):
        output += "\n" + ability_command
    elif prereq_type == "psh" and exec_type == "cmd":
        output = f'powershell -command "{output} \n {ability_command}"'
    else:
        output = ability_command
    return output


# ---------------------------------------------------------------------------
# Additional open-source TTP libraries
#
# Imported after everything above and deduplicated against it: a procedure is
# dropped when its command matches one already in the library (whitespace,
# case and quoting ignored), and ForgeArmory's Atomic Red Team conversions are
# dropped when the original Atomic test is already present for the technique.
# Technique IDs, names and tactics come from the current ATT&CK bundle
# (scripts/import_mitre.py); procedures without an Enterprise technique are
# skipped.
# ---------------------------------------------------------------------------

EXTRA_REPOS = {
    "forgearmory": "https://github.com/facebookincubator/ForgeArmory",
    "leonidas": "https://github.com/ReversecLabs/leonidas",
    "stratus-red-team": "https://github.com/DataDog/stratus-red-team",
    "purplesharp": "https://github.com/mvelazc0/PurpleSharp",
}


class Attack:
    """Current Enterprise ATT&CK lookups for the extra importers."""

    def __init__(self, stix_path):
        from import_mitre import load_attack

        data = load_attack(stix_path)
        self.techniques, self.revoked = data["techniques"], data["revoked"]

    def resolve(self, technique_id):
        tid = as_text(technique_id).strip().split(" ")[0]
        tid = self.revoked.get(tid, tid)
        return tid if tid in self.techniques else None

    def name(self, tid):
        return self.techniques[tid]["name"]

    def tactic(self, tid, hints=()):
        """The technique's tactic, preferring one the source named."""
        tactics = self.techniques[tid]["tactics"]
        for hint in hints:
            hint = re.sub(r"^ta\d{4}\s*", "", as_text(hint).strip().lower())
            hint = re.sub(r"(?<=[a-z])(?=[A-Z])", "-", hint)
            hint = "-".join(hint.replace("_", " ").split())
            if hint in tactics:
                return hint
            if hint == "defense-evasion":
                for t in ("stealth", "defense-impairment"):
                    if t in tactics:
                        return t
        return tactics[0] if tactics else ""


def arg_text(value):
    """Render an argument default the way Go/Jinja templates print it."""
    return str(value).lower() if isinstance(value, bool) else as_text(value)


def command_fingerprint(command):
    text = as_text(command).lower().replace('"', "").replace("'", "")
    return re.sub(r"\s+", " ", text).strip(" ;")


def name_key(name, technique_id):
    return (re.sub(r"[^a-z0-9]+", " ", as_text(name).lower()).strip(), technique_id.split(".")[0])


FA_EXECUTORS = {
    "powershell": "psh",
    "powershell.exe": "psh",
    "pwsh": "psh",
    "cmd": "cmd",
    "cmd.exe": "cmd",
    "bash": "sh",
    "sh": "sh",
    "zsh": "sh",
}
RE_FA_ARG = re.compile(r"\{\{\s*\.Args\.(\w+)\s*\}\}")
RE_FA_ART = re.compile(r"Converted from Atomic Red Team")


def import_forgearmory(cache, attack, skipped):
    """TTPForge TTPs whose steps are all inline commands in one shell.

    Rows carry `_art` when the TTP is an Atomic Red Team conversion.
    """
    root = os.path.join(cache, "forgearmory")
    rows = []
    for path in sorted(glob.glob(os.path.join(root, "ttps", "**", "*.yaml"), recursive=True)):
        with open(path, encoding="utf-8") as f:
            text = f.read()
        body = RE_FA_ARG.sub(lambda m: f"__ARG_{m.group(1)}__", text)
        if "{{" in body:  # Go template logic we cannot render statically
            skipped["forgearmory: template logic"] += 1
            continue
        try:
            doc = yaml.safe_load(body)
        except yaml.YAMLError:
            skipped["forgearmory: unparseable"] += 1
            continue
        if not isinstance(doc, dict) or not doc.get("steps"):
            continue
        steps = doc["steps"]
        if any(not isinstance(s, dict) or "inline" not in s for s in steps):
            skipped["forgearmory: non-command steps"] += 1
            continue
        executors = {FA_EXECUTORS.get(as_text(s.get("executor", "bash")).lower()) for s in steps}
        if len(executors) != 1 or None in executors:
            skipped["forgearmory: mixed or unsupported shell"] += 1
            continue
        executor = executors.pop()

        mitre = doc.get("mitre") or {}
        ids = (mitre.get("subtechniques") or []) + (mitre.get("techniques") or [])
        tid = next((t for t in map(attack.resolve, ids) if t), None)
        if not tid:
            skipped["forgearmory: no Enterprise technique"] += 1
            continue

        args = {
            a["name"]: a.get("default")
            for a in doc.get("args") or []
            if isinstance(a, dict) and a.get("name")
        }

        def fill(value):
            return re.sub(
                r"__ARG_(\w+)__",
                lambda m: arg_text(args[m.group(1)])
                if args.get(m.group(1)) is not None
                else f"#{{{m.group(1)}}}",
                as_text(value),
            )

        command = fill("\n".join(as_text(s["inline"]).strip() for s in steps))
        requirements = doc.get("requirements") or {}
        oses = [as_text(p.get("os")).lower() for p in requirements.get("platforms") or [] if isinstance(p, dict)]
        if executor in ("psh", "cmd"):
            oses = ["windows"]
        else:
            oses = [o for o in oses if o in ("linux", "darwin")] or ["linux", "darwin"]

        rel = os.path.relpath(path, root)
        description = fill(doc.get("description")).strip()
        if requirements.get("superuser"):
            description += "\n\nRequires superuser."
        description += f"\n\nSource: ForgeArmory {rel}"
        ability_id = as_text(doc.get("uuid")) or str(uuid.uuid5(uuid.NAMESPACE_URL, f"forgearmory/{rel}"))
        for row in build_rows(
            ability_id,
            fill(doc.get("name")),
            description,
            attack.tactic(tid, mitre.get("tactics") or []),
            tid,
            attack.name(tid),
            [(o, executor, command, []) for o in oses],
        ):
            if RE_FA_ART.search(text):
                row["_art"] = True
            row["_source"] = rel
            rows.append(row)
    return rows


def import_leonidas(cache, attack, skipped):
    """Leonidas cloud test cases (AWS CLI / kubectl), run from the agent host."""
    root = os.path.join(cache, "leonidas")
    rows = []
    for path in sorted(glob.glob(os.path.join(root, "definitions", "**", "*.yml"), recursive=True)):
        doc = load_yaml(path)
        if not isinstance(doc, dict):
            continue
        code = as_text(((doc.get("executors") or {}).get("sh") or {}).get("code")).strip()
        tid = next((t for t in map(attack.resolve, doc.get("mitre_ids") or []) if t), None)
        if not code or not tid:
            skipped["leonidas: no shell command or Enterprise technique"] += 1
            continue
        args = {k: (v or {}).get("value") for k, v in (doc.get("input_arguments") or {}).items()}
        command = re.sub(
            r"\{\{\s*(\w+)\s*\}\}",
            lambda m: arg_text(args[m.group(1)]) if args.get(m.group(1)) is not None else f"#{{{m.group(1)}}}",
            code,
        )
        platform = as_text(doc.get("platform")).lower()
        tool = "the AWS CLI" if platform == "aws" else "kubectl" if platform == "kubernetes" else "a CLI"
        description = as_text(doc.get("description")).strip()
        description += f"\n\nTarget: {platform.upper() or 'cloud'}; runs through {tool} with credentials configured on the agent host."
        if doc.get("permissions"):
            description += f" Required permissions: {', '.join(map(as_text, doc['permissions']))}."
        rel = os.path.relpath(path, root)
        description += f"\n\nSource: Leonidas {rel}"
        rows.extend(
            dict(row, _source=rel)
            for row in build_rows(
                str(uuid.uuid5(uuid.NAMESPACE_URL, f"leonidas/{rel}")),
                doc.get("name"),
                description,
                attack.tactic(tid, [doc.get("category")]),
                tid,
                attack.name(tid),
                [("linux", "sh", command, []), ("darwin", "sh", command, [])],
            )
        )
    return rows


RE_GO_FIELD = {
    "id": re.compile(r'\bID:\s*"([a-z0-9][\w.-]+)"'),
    "name": re.compile(r'\bFriendlyName:\s*"([^"]+)"'),
    "platform": re.compile(r"\bPlatform:\s*providers\.(\w+)"),
}
RE_GO_DESCRIPTION = re.compile(r"\bDescription:\s*`([^`]*)`", re.S)
RE_GO_TACTICS = re.compile(r"MitreAttackTactics:\s*\[\]mitreattack\.Tactic\{([^}]*)\}")
RE_GO_TECHNIQUE = re.compile(r'\bID:\s*"(T\d{4}(?:\.\d{3})?)"')


def import_stratus(cache, attack, skipped):
    """Stratus Red Team techniques that map to an ATT&CK technique ID."""
    root = os.path.join(cache, "stratus-red-team", "v2", "internal", "attacktechniques")
    rows = []
    for path in sorted(glob.glob(os.path.join(root, "**", "main.go"), recursive=True)):
        with open(path, encoding="utf-8") as f:
            src = f.read()
        fields = {k: (m.group(1) if (m := r.search(src)) else "") for k, r in RE_GO_FIELD.items()}
        if not fields["id"]:
            continue
        tid = next((t for t in map(attack.resolve, RE_GO_TECHNIQUE.findall(src)) if t), None)
        if not tid:
            skipped["stratus: no ATT&CK technique mapping"] += 1
            continue
        tactics_match = RE_GO_TACTICS.search(src)
        hints = re.findall(r"mitreattack\.(\w+)", tactics_match.group(0)) if tactics_match else []
        desc_match = RE_GO_DESCRIPTION.search(src)
        description = (desc_match.group(1).strip() if desc_match else "")
        description += (
            f"\n\nTarget: {fields['platform'] or 'cloud'}. Runs `stratus detonate`, which provisions "
            "prerequisites with Terraform, detonates, then cleans up; needs the stratus CLI and "
            "cloud credentials on the agent host."
            f"\n\nSource: Stratus Red Team {fields['id']}"
        )
        command = f"stratus detonate {fields['id']} --cleanup"
        rel = os.path.relpath(path, os.path.join(cache, "stratus-red-team"))
        rows.extend(
            dict(row, _source=rel)
            for row in build_rows(
                str(uuid.uuid5(uuid.NAMESPACE_URL, f"stratus-red-team/{fields['id']}")),
                fields["name"] or fields["id"],
                description,
                attack.tactic(tid, hints),
                tid,
                attack.name(tid),
                [("linux", "sh", command, []), ("darwin", "sh", command, [])],
            )
        )
    return rows


def import_purplesharp(cache, attack, skipped):
    """PurpleSharp's built-in local simulations, one per supported technique."""
    program = os.path.join(cache, "purplesharp", "PurpleSharp", "Program.cs")
    if not os.path.isfile(program):
        return []
    with open(program, encoding="utf-8-sig") as f:
        src = f.read()
    rows = []
    for raw in sorted(set(re.findall(r'case "(T\d{4}(?:\.\d{3})?)"', src))):
        tid = attack.resolve(raw)
        if not tid:
            skipped["purplesharp: no Enterprise technique"] += 1
            continue
        description = (
            f"Runs PurpleSharp's built-in simulation of {raw} ({attack.name(tid)}) on the local host. "
            "PurpleSharp.exe is not in the source repository: build it from mvelazc0/PurpleSharp or "
            "take it from the project's releases and place it in the C2 payload directory."
            "\n\nSource: PurpleSharp"
        )
        rows.extend(
            dict(row, _source="PurpleSharp/Program.cs")
            for row in build_rows(
                str(uuid.uuid5(uuid.NAMESPACE_URL, f"purplesharp/{raw}")),
                f"PurpleSharp: {attack.name(tid)}",
                description,
                attack.tactic(tid),
                tid,
                attack.name(tid),
                [("windows", "psh", f".\\PurpleSharp.exe /t {raw}", ["PurpleSharp.exe"])],
            )
        )
    return rows


EXTRA_IMPORTERS = {
    "forgearmory": import_forgearmory,
    "leonidas": import_leonidas,
    "stratus-red-team": import_stratus,
    "purplesharp": import_purplesharp,
}


RAW_DIR = os.path.join(ROOT, "raw-sources")
LICENSE_NAMES = ("LICENSE", "LICENSE.txt", "LICENSE.md", "COPYING")


def write_raw_sources(cache, used):
    """Copy the upstream files the added rows came from into raw-sources/.

    raw-sources/<repo>/ mirrors the upstream paths, keeps the repo's license,
    and has a manifest.json naming the upstream commit and, per file, the
    ability rows built from it — so every imported ability can be checked
    against its original later. Each repo folder is rebuilt on every run.
    """
    for repo, files in used.items():
        src_root = os.path.join(cache, repo)
        dst_root = os.path.join(RAW_DIR, repo)
        shutil.rmtree(dst_root, ignore_errors=True)
        os.makedirs(dst_root)
        for rel in sorted(files):
            dst = os.path.join(dst_root, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(src_root, rel), dst)
        license_file = next((n for n in LICENSE_NAMES if os.path.isfile(os.path.join(src_root, n))), None)
        if license_file:
            shutil.copy2(os.path.join(src_root, license_file), os.path.join(dst_root, license_file))
        commit = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=src_root, capture_output=True, text=True
        ).stdout.strip()
        manifest = {
            "repository": EXTRA_REPOS[repo],
            "commit": commit or None,
            "license": license_file,
            "files": [
                {"path": rel, "abilities": sorted(ids)} for rel, ids in sorted(files.items())
            ],
        }
        with open(os.path.join(dst_root, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=1, ensure_ascii=False)
            f.write("\n")
    print(f"raw source files copied to {RAW_DIR}", file=sys.stderr)


def add_extra_sources(rows, cache, attack):
    """Append the extra libraries to `rows`, skipping duplicates. Returns rows.

    A candidate is a duplicate of a row already in the library when:
    - its command is the same (whitespace, case and quoting ignored);
    - it is a ForgeArmory copy of an Atomic test and a row for the same
      technique has (nearly) the same name; or
    - a row for the exact same technique ID has nearly the same name and
      command.
    "Nearly" is a difflib similarity of 0.9 or more.
    """
    from difflib import SequenceMatcher

    def similar(a, b):
        return SequenceMatcher(None, a, b).ratio() >= 0.9

    skipped = defaultdict(int)
    seen_commands = set()
    by_parent = defaultdict(list)  # parent technique -> [(technique id, name key, command fingerprint)]
    seen_ids = set()

    def remember(row):
        fingerprint = command_fingerprint(row["command"])
        if fingerprint:
            seen_commands.add(fingerprint)
        tid = as_text(row["technique_id"]).strip()
        name, parent = name_key(row["ability_name"], tid)
        by_parent[parent].append((tid, name, fingerprint))
        seen_ids.add(row["id"])

    for row in rows:
        remember(row)

    used = defaultdict(lambda: defaultdict(list))  # repo -> upstream file -> row ids
    for source_repo, importer in EXTRA_IMPORTERS.items():
        candidates = importer(cache, attack, skipped)
        added = dup_command = dup_art = dup_near = 0
        for row in candidates:
            art = row.pop("_art", False)
            source = row.pop("_source")
            fingerprint = command_fingerprint(row["command"])
            name, parent = name_key(row["ability_name"], row["technique_id"])
            if fingerprint in seen_commands or row["id"] in seen_ids:
                dup_command += 1
                continue
            same_technique = by_parent[parent]
            if art and any(similar(name, n) for _, n, _ in same_technique):
                dup_art += 1
                continue
            if any(
                t == row["technique_id"] and similar(name, n) and similar(fingerprint, c)
                for t, n, c in same_technique
            ):
                dup_near += 1
                continue
            remember(row)
            rows.append(row)
            used[source_repo][source].append(row["id"])
            added += 1
        print(
            f"{source_repo}: {len(candidates)} rows, {added} added; dropped {dup_command} identical commands, "
            f"{dup_near} near-identical, {dup_art} Atomic Red Team copies",
            file=sys.stderr,
        )
    for reason, n in sorted(skipped.items()):
        print(f"  skipped {n}: {reason}", file=sys.stderr)
    write_raw_sources(cache, used)
    return rows


# ---------------------------------------------------------------------------
# Merge
# ---------------------------------------------------------------------------


def base_id(row_id):
    """Strip the -<platforms>-<executor> suffix build_rows adds."""
    match = re.match(r"^([0-9a-f]{32}|[0-9a-f-]{36})(?:-|$)", row_id)
    return match.group(1) if match else row_id


def merge(existing, imported):
    rows, seen = [], set()
    for row in imported:
        row_id = row["id"]
        n = 2
        while row_id in seen:  # identical ids across sources: keep both, disambiguated
            row_id = f"{row['id']}-{n}"
            n += 1
        seen.add(row_id)
        rows.append(dict(row, id=row_id))

    imported_ids = {base_id(r["id"]) for r in imported}
    imported_names = {(r["technique_id"], r["ability_name"]) for r in imported}
    kept = [
        r
        for r in existing
        if base_id(r["id"]) not in imported_ids
        and (r["technique_id"], r["ability_name"]) not in imported_names
        and r["id"] not in seen
    ]
    return rows + kept, len(kept)


# ATT&CK tactics that no longer exist in the current matrix. v19 split
# defense-evasion into stealth and defense-impairment.
RETIRED_TACTICS = {"defense-evasion"}


def remap_attack(rows, stix_path):
    """Move rows onto current Enterprise ATT&CK IDs.

    Uses the STIX bundle's revoked-by relationships, so abilities tagged with
    a revoked ID (e.g. T1562.001 -> T1685, T1070.001 -> T1685.005) count
    toward coverage again. Rows still labelled with a retired tactic get the
    technique's current tactic. Returns (rows, number of IDs remapped,
    number of tactics relabelled).
    """
    from import_mitre import load_attack

    attack = load_attack(stix_path)
    techniques, revoked = attack["techniques"], attack["revoked"]
    current_tactics = {short for short, _ in attack["tactics"]}
    remapped = relabelled = 0
    for row in rows:
        tid = (row.get("technique_id") or "").strip()
        if tid in revoked:
            tid = revoked[tid]
            row["technique_name"] = techniques[tid]["name"]
            remapped += 1
        row["technique_id"] = tid

        tactic = (row.get("tactic") or "").strip()
        tech_tactics = techniques.get(tid, {}).get("tactics", [])
        if tech_tactics and tactic in RETIRED_TACTICS and tactic not in current_tactics:
            preferred = [t for t in tech_tactics if t in ("stealth", "defense-impairment")]
            row["tactic"] = (preferred or tech_tactics)[0]
            relabelled += 1
    return rows, remapped, relabelled


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--cache", default=DEFAULT_CACHE, help="where source repositories are cloned")
    parser.add_argument("--data", default=DEFAULT_DATA, help="seed file to rebuild")
    parser.add_argument("--fetch", action="store_true", help="clone or update the source repositories first")
    parser.add_argument(
        "--payload-out",
        help="also collect referenced payload files into this directory (serve it as the C2 payload dir). "
        "Only Atomic Red Team ships its attachments; plugin and OT binaries are not in the source repos "
        "and are reported as missing.",
    )
    parser.add_argument(
        "--remap-only",
        action="store_true",
        help="only remap revoked technique IDs in the existing seed file, without re-importing",
    )
    args = parser.parse_args()

    def write_remapped(rows):
        if os.path.isfile(ATTACK_STIX):
            rows, remapped, relabelled = remap_attack(rows, ATTACK_STIX)
            print(
                f"ATT&CK remap: {remapped} revoked technique IDs replaced, "
                f"{relabelled} tactics relabelled",
                file=sys.stderr,
            )
        else:
            print(
                f"ATT&CK remap skipped: {ATTACK_STIX} not found (run scripts/import_mitre.py)",
                file=sys.stderr,
            )
        with open(args.data, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=1, ensure_ascii=False)
        print(f"wrote {len(rows)} rows to {args.data}", file=sys.stderr)

    if args.remap_only:
        with open(args.data, encoding="utf-8") as f:
            write_remapped(json.load(f))
        return

    if args.fetch:
        fetch(args.cache)

    sources = {
        "caldera plugins": import_plugins(args.cache),
        "atomic red team": AtomicConverter(
            os.path.join(args.cache, ATOMIC_REPO[0]), payload_out=args.payload_out
        ).rows(),
        "emulation library": import_emu(args.cache),
        "micro emulation plans": import_micro_plans(args.cache),
    }
    imported = [row for rows in sources.values() for row in rows]
    for name, rows in sources.items():
        print(f"{name}: {len(rows)} rows", file=sys.stderr)

    existing = []
    if os.path.isfile(args.data):
        with open(args.data, encoding="utf-8") as f:
            existing = json.load(f)
    attack = Attack(ATTACK_STIX) if os.path.isfile(ATTACK_STIX) else None
    if attack:
        # Rows a previous run took from the extra libraries are rebuilt below.
        extra_ids = {
            base_id(r["id"])
            for importer in EXTRA_IMPORTERS.values()
            for r in importer(args.cache, attack, defaultdict(int))
        }
        existing = [r for r in existing if base_id(r["id"]) not in extra_ids]

    rows, kept = merge(existing, imported)
    print(f"kept {kept} existing rows not superseded by an import", file=sys.stderr)

    if attack:
        rows = add_extra_sources(rows, args.cache, attack)
    else:
        print(f"extra libraries skipped: {ATTACK_STIX} not found (run scripts/import_mitre.py)", file=sys.stderr)

    if args.payload_out:
        referenced = set()
        for row in imported:
            referenced.update(name for name in row["payloads"].split(",") if name)
        collected = set(os.listdir(args.payload_out)) if os.path.isdir(args.payload_out) else set()
        missing = sorted(referenced - collected)
        print(
            f"payloads: collected {len(referenced & collected)}/{len(referenced)} referenced files "
            f"into {args.payload_out}",
            file=sys.stderr,
        )
        if missing:
            print(
                f"payloads: {len(missing)} not available offline (not shipped in the source repos), "
                f"e.g. {', '.join(missing[:8])}",
                file=sys.stderr,
            )

    write_remapped(rows)


if __name__ == "__main__":
    main()
