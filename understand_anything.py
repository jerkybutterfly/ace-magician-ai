"""
Understand Anything — local pipeline
Inspired by https://github.com/Lum1104/Understand-Anything

Walks a codebase, extracts files / functions / classes / imports, asks a local
Ollama model to write a one-sentence summary per file, and writes a knowledge
graph JSON compatible with the Understand-Anything dashboard format:

    {
      "root": "/abs/path",
      "generated_at": "...",
      "stats": {...},
      "nodes": [{id, kind, name, path, layer, summary, lines}],
      "edges": [{source, target, relation}]
    }

Usage (CLI):
    python3 understand_anything.py /path/to/repo \\
        --model gemma3:4b \\
        --ollama http://localhost:11434 \\
        --out .understand-anything/knowledge-graph.json \\
        --max-files 250
"""
from __future__ import annotations

import argparse
import ast
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any

CODE_EXT = {
    ".py": "python",
    ".js": "javascript", ".jsx": "javascript",
    ".ts": "typescript", ".tsx": "typescript",
    ".go": "go", ".rs": "rust", ".java": "java",
    ".rb": "ruby", ".php": "php", ".cs": "csharp",
    ".c": "c", ".h": "c", ".cpp": "cpp", ".hpp": "cpp",
    ".swift": "swift", ".kt": "kotlin",
}
SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", ".turbo",
    "venv", ".venv", "__pycache__", ".idea", ".vscode", "target",
    ".cache", ".pytest_cache", "coverage", ".understand-anything",
}
LAYER_RULES = [
    ("api",     re.compile(r"(?:^|/)(api|routes|controllers|endpoints|handlers)/")),
    ("service", re.compile(r"(?:^|/)(services|usecase|domain|core|lib|business)/")),
    ("data",    re.compile(r"(?:^|/)(models|db|database|repository|repositories|schema|migrations|prisma)/")),
    ("ui",      re.compile(r"(?:^|/)(components|pages|views|screens|ui|src/app|app)/")),
    ("utility", re.compile(r"(?:^|/)(utils|helpers|lib|common|shared)/")),
    ("test",    re.compile(r"(?:^|/)(tests?|__tests__|spec)/|\.(test|spec)\.[a-z]+$")),
    ("config",  re.compile(r"(?:^|/)(config|settings|\.env|\..*rc)")),
]


def detect_layer(rel_path: str) -> str:
    for name, pat in LAYER_RULES:
        if pat.search(rel_path):
            return name
    return "other"


def iter_code_files(root: Path, max_files: int) -> list[Path]:
    out: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in filenames:
            ext = Path(fn).suffix.lower()
            if ext in CODE_EXT:
                out.append(Path(dirpath) / fn)
                if len(out) >= max_files:
                    return out
    return out


def parse_python(src: str) -> tuple[list[dict], list[str]]:
    nodes, imports = [], []
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return nodes, imports
    for n in ast.walk(tree):
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            nodes.append({"kind": "function", "name": n.name, "line": n.lineno})
        elif isinstance(n, ast.ClassDef):
            nodes.append({"kind": "class", "name": n.name, "line": n.lineno})
        elif isinstance(n, ast.Import):
            for a in n.names:
                imports.append(a.name)
        elif isinstance(n, ast.ImportFrom):
            if n.module:
                imports.append(n.module)
    return nodes, imports


JS_FN  = re.compile(r"(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(")
JS_CLS = re.compile(r"(?:export\s+)?class\s+([A-Za-z_$][\w$]*)")
JS_ARROW = re.compile(r"(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=]*\)?\s*=>")
JS_IMPORT = re.compile(r"""(?:import\s+[^'"]*from\s+|require\s*\(\s*)['"]([^'"]+)['"]""")


def parse_js_like(src: str) -> tuple[list[dict], list[str]]:
    nodes, imports = [], []
    for line_no, line in enumerate(src.splitlines(), 1):
        for pat, kind in ((JS_FN, "function"), (JS_ARROW, "function"), (JS_CLS, "class")):
            m = pat.search(line)
            if m:
                nodes.append({"kind": kind, "name": m.group(1), "line": line_no})
    imports = JS_IMPORT.findall(src)
    return nodes, imports


def ollama_summary(text: str, path: str, model: str, base: str, timeout: int = 30) -> str:
    prompt = (
        f"Summarize this source file in one short sentence (max 25 words). "
        f"Focus on its responsibility, not implementation details.\n\n"
        f"File: {path}\n\n---\n{text[:4000]}\n---"
    )
    body = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 80, "temperature": 0.2},
    }).encode()
    req = urllib.request.Request(
        f"{base.rstrip('/')}/api/generate",
        data=body, headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.loads(r.read())
            return (data.get("response") or "").strip().replace("\n", " ")[:240]
    except Exception as e:  # noqa: BLE001
        return f"(summary unavailable: {e.__class__.__name__})"


def build_graph(root: Path, model: str, ollama_url: str, max_files: int,
                progress: callable | None = None) -> dict[str, Any]:
    files = iter_code_files(root, max_files)
    nodes: list[dict] = []
    edges: list[dict] = []
    file_id_by_relpath: dict[str, str] = {}

    for idx, fp in enumerate(files):
        rel = fp.relative_to(root).as_posix()
        file_id = f"file:{rel}"
        file_id_by_relpath[rel] = file_id
        layer = detect_layer(rel)
        try:
            src = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            src = ""
        lang = CODE_EXT.get(fp.suffix.lower(), "text")
        if lang == "python":
            children, imports = parse_python(src)
        elif lang in ("javascript", "typescript"):
            children, imports = parse_js_like(src)
        else:
            children, imports = [], []

        summary = ollama_summary(src, rel, model, ollama_url) if src.strip() else ""
        nodes.append({
            "id": file_id, "kind": "file", "name": rel.split("/")[-1],
            "path": rel, "layer": layer, "language": lang,
            "lines": src.count("\n") + 1, "summary": summary,
            "imports": imports[:30],
        })
        for child in children[:40]:
            cid = f"{file_id}::{child['kind']}:{child['name']}"
            nodes.append({
                "id": cid, "kind": child["kind"], "name": child["name"],
                "path": rel, "layer": layer, "line": child.get("line"),
                "language": lang, "summary": "",
            })
            edges.append({"source": file_id, "target": cid, "relation": "contains"})

        if progress:
            progress(idx + 1, len(files), rel)

    # Resolve imports to files inside the repo
    rel_keys = list(file_id_by_relpath.keys())
    for n in [x for x in nodes if x["kind"] == "file"]:
        for imp in n.get("imports", []):
            for rel in rel_keys:
                stem = rel.rsplit(".", 1)[0]
                if stem.endswith(imp.replace(".", "/")) or stem.endswith(imp):
                    if file_id_by_relpath[rel] != n["id"]:
                        edges.append({
                            "source": n["id"], "target": file_id_by_relpath[rel],
                            "relation": "imports",
                        })
                    break

    layers: dict[str, int] = {}
    for n in nodes:
        if n["kind"] == "file":
            layers[n["layer"]] = layers.get(n["layer"], 0) + 1

    return {
        "root": str(root),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "model": model,
        "stats": {
            "files": sum(1 for n in nodes if n["kind"] == "file"),
            "functions": sum(1 for n in nodes if n["kind"] == "function"),
            "classes": sum(1 for n in nodes if n["kind"] == "class"),
            "edges": len(edges),
            "layers": layers,
        },
        "nodes": nodes,
        "edges": edges,
    }


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("path")
    p.add_argument("--model", default=os.environ.get("OLLAMA_MODEL", "gemma3:4b"))
    p.add_argument("--ollama", default=os.environ.get("OLLAMA_URL", "http://localhost:11434"))
    p.add_argument("--out", default=None)
    p.add_argument("--max-files", type=int, default=250)
    args = p.parse_args()

    root = Path(args.path).expanduser().resolve()
    if not root.exists():
        print(f"path not found: {root}", file=sys.stderr)
        return 2

    out_path = Path(args.out) if args.out else root / ".understand-anything" / "knowledge-graph.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    def progress(i: int, total: int, rel: str) -> None:
        print(f"[{i}/{total}] {rel}", file=sys.stderr, flush=True)

    graph = build_graph(root, args.model, args.ollama, args.max_files, progress)
    out_path.write_text(json.dumps(graph, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "out": str(out_path), "stats": graph["stats"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
