#!/usr/bin/env python3
"""
Local AI Agent — FastAPI server for PC control.
Run: pip install fastapi uvicorn psutil && python agent.py
"""
import os
import subprocess
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil

app = FastAPI(title="Local AI Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Safety: blocked commands (add more as needed) ──
BLOCKED_COMMANDS = {"rm -rf /", "mkfs", "dd if=", ":(){:|:&};:", "format c:"}


def is_blocked(cmd: str) -> bool:
    lower = cmd.lower().strip()
    return any(b in lower for b in BLOCKED_COMMANDS)


# ── Models ──
class CommandRequest(BaseModel):
    command: str


class FileWriteRequest(BaseModel):
    path: str
    content: str


class FileDeleteRequest(BaseModel):
    path: str


# ── Terminal ──
@app.post("/terminal")
async def run_terminal(req: CommandRequest):
    if is_blocked(req.command):
        raise HTTPException(status_code=403, detail="Command blocked for safety")
    try:
        result = subprocess.run(
            req.command, shell=True, capture_output=True, text=True, timeout=30
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Command timed out (30s)", "returncode": -1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── File Operations ──
@app.get("/files")
async def list_files(path: str = "/"):
    target = Path(path).resolve()
    if not target.exists():
        raise HTTPException(status_code=404, detail="Path not found")
    if not target.is_dir():
        raise HTTPException(status_code=400, detail="Not a directory")
    entries = []
    try:
        for entry in sorted(target.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower())):
            try:
                stat = entry.stat()
                entries.append({
                    "name": entry.name,
                    "is_dir": entry.is_dir(),
                    "size": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                })
            except (PermissionError, OSError):
                continue
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    return entries


@app.get("/files/read")
async def read_file(path: str):
    target = Path(path).resolve()
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found")
    if not target.is_file():
        raise HTTPException(status_code=400, detail="Not a file")
    try:
        content = target.read_text(errors="replace")[:100_000]  # Limit to 100KB
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/files/write")
async def write_file(req: FileWriteRequest):
    try:
        target = Path(req.path).resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(req.content)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/files/delete")
async def delete_file(req: FileDeleteRequest):
    target = Path(req.path).resolve()
    if not target.exists():
        raise HTTPException(status_code=404, detail="Not found")
    try:
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── System Info ──
@app.get("/system")
async def system_info():
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    return {
        "cpu_percent": psutil.cpu_percent(interval=0.5),
        "memory": {
            "total": mem.total,
            "used": mem.used,
            "percent": mem.percent,
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "percent": disk.percent,
        },
    }


if __name__ == "__main__":
    import uvicorn
    print("🤖 Local AI Agent starting on http://0.0.0.0:8484")
    print("   Endpoints: /terminal, /files, /files/read, /files/write, /files/delete, /system")
    uvicorn.run(app, host="0.0.0.0", port=8484)
