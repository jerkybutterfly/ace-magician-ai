#!/usr/bin/env python3
"""
spec_kit skill — wrapper around GitHub's Spec Kit CLI (https://github.com/github/spec-kit).

Subcommands:
  check                              -> verify env (python, uv, git, spec-kit reachable)
  install-uv                         -> pip-install `uv`
  init <name> [--path <dir>]         -> scaffold a new spec-driven project
  list [path]                        -> list spec-kit projects in path (default ~/SpecKitProjects)
  read <project> <file>              -> read spec.md / plan.md / tasks.md from a project
  write <project> <file> <b64body>   -> write a spec file (body is base64-encoded UTF-8)

All output is plain text on stdout. Non-zero exit on failure.
"""
import sys
import os
import shutil
import subprocess
import base64
import json
from pathlib import Path

DEFAULT_ROOT = Path.home() / "SpecKitProjects"
SPEC_FILES = {"spec.md", "plan.md", "tasks.md", "constitution.md"}
UVX_SOURCE = "git+https://github.com/github/spec-kit.git"


def _run(cmd, cwd=None, timeout=300):
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    try:
        res = subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout,
            shell=False, env=env, encoding="utf-8", errors="replace",
        )
        return res.returncode, res.stdout, res.stderr
    except FileNotFoundError as e:
        return 127, "", str(e)
    except subprocess.TimeoutExpired:
        return 124, "", f"Command timed out after {timeout}s"


def cmd_check():
    out = {"python": sys.version.split()[0], "uv": None, "git": None, "spec_kit": None}

    git = shutil.which("git")
    if git:
        rc, so, _ = _run([git, "--version"])
        out["git"] = so.strip() if rc == 0 else "found but not working"

    uv = shutil.which("uv")
    if uv:
        rc, so, _ = _run([uv, "--version"])
        out["uv"] = so.strip() if rc == 0 else "found but not working"

    if uv:
        rc, so, se = _run(
            [uv, "tool", "run", "--python", "3.12", "--from", UVX_SOURCE, "specify", "--help"],
            timeout=300,
        )
        if rc == 0:
            out["spec_kit"] = "ok"
        else:
            # Return the FULL error so the UI can show it
            out["spec_kit"] = f"error: {(se or so).strip()}"
    else:
        out["spec_kit"] = "uv missing — run install-uv first"

    print(json.dumps(out, indent=2))


def cmd_install_uv():
    rc, so, se = _run([sys.executable, "-m", "pip", "install", "--user", "uv"], timeout=300)
    print(so)
    if rc != 0:
        print(se, file=sys.stderr)
        sys.exit(rc)
    print("uv installed. You may need to add ~/.local/bin (or %APPDATA%\\Python\\Scripts on Windows) to PATH.")


def cmd_init(args):
    if not args:
        print("usage: init <name> [--path <dir>]", file=sys.stderr)
        sys.exit(2)
    name = args[0]
    root = DEFAULT_ROOT
    if "--path" in args:
        i = args.index("--path")
        if i + 1 < len(args):
            root = Path(args[i + 1]).expanduser()
    root.mkdir(parents=True, exist_ok=True)

    uv = shutil.which("uv")
    if not uv:
        print("uv is not installed. Run: spec_kit install-uv", file=sys.stderr)
        sys.exit(1)

    # `specify init <name>` creates a folder with that name
    rc, so, se = _run(
        [uv, "tool", "run", "--python", "3.12", "--from", UVX_SOURCE, "specify", "init", name, "--ai", "claude", "--ignore-agent-tools"],
        cwd=str(root),
        timeout=600,
    )
    print(so)
    if rc != 0:
        print(se, file=sys.stderr)
        sys.exit(rc)
    print(f"\nProject created at: {root / name}")


def cmd_list(args):
    root = Path(args[0]).expanduser() if args else DEFAULT_ROOT
    if not root.exists():
        print(json.dumps({"root": str(root), "projects": []}, indent=2))
        return
    projects = []
    for p in sorted(root.iterdir()):
        if not p.is_dir():
            continue
        files = [f.name for f in p.iterdir() if f.is_file() and f.name in SPEC_FILES]
        # Look one level deeper too (spec-kit puts files in subfolders)
        for sub in p.rglob("*.md"):
            if sub.name in SPEC_FILES:
                rel = str(sub.relative_to(p))
                if rel not in files:
                    files.append(rel)
        projects.append({"name": p.name, "path": str(p), "spec_files": files})
    print(json.dumps({"root": str(root), "projects": projects}, indent=2))


def _resolve_spec_file(project_dir: Path, fname: str) -> Path:
    direct = project_dir / fname
    if direct.exists():
        return direct
    matches = list(project_dir.rglob(fname))
    if matches:
        return matches[0]
    return direct  # may not exist; caller decides


def cmd_read(args):
    if len(args) < 2:
        print("usage: read <project_path> <file>", file=sys.stderr)
        sys.exit(2)
    project = Path(args[0]).expanduser()
    fname = args[1]
    target = _resolve_spec_file(project, fname)
    if not target.exists():
        print(f"File not found: {target}", file=sys.stderr)
        sys.exit(1)
    print(target.read_text(encoding="utf-8"))


def cmd_write(args):
    if len(args) < 3:
        print("usage: write <project_path> <file> <base64_body>", file=sys.stderr)
        sys.exit(2)
    project = Path(args[0]).expanduser()
    fname = args[1]
    body_b64 = args[2]
    try:
        body = base64.b64decode(body_b64).decode("utf-8")
    except Exception as e:
        print(f"Bad base64: {e}", file=sys.stderr)
        sys.exit(2)
    target = _resolve_spec_file(project, fname)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body, encoding="utf-8")
    print(f"Wrote {len(body)} bytes to {target}")


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)
    sub, rest = args[0], args[1:]
    if sub == "check":
        cmd_check()
    elif sub == "install-uv":
        cmd_install_uv()
    elif sub == "init":
        cmd_init(rest)
    elif sub == "list":
        cmd_list(rest)
    elif sub == "read":
        cmd_read(rest)
    elif sub == "write":
        cmd_write(rest)
    else:
        print(f"Unknown subcommand: {sub}", file=sys.stderr)
        print(__doc__)
        sys.exit(2)


if __name__ == "__main__":
    main()
