#!/usr/bin/env python3
"""
Local AI Agent — FastAPI server for PC control + browser automation + Telegram bot.
Run: pip install fastapi uvicorn psutil requests selenium && python agent.py
With Telegram: python agent.py --telegram-token YOUR_BOT_TOKEN
"""
import argparse
import os
import re
import shutil
import platform
import subprocess
import threading
import time
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import psutil
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
import custom_tool_registry
from pydantic import BaseModel

# ═══════════════════════════════════════════════════════
#  Browser Automation (Selenium)
# ═══════════════════════════════════════════════════════
import base64 as _b64

_browser_driver = None
_browser_lock = threading.Lock()


def _get_browser():
    """Lazily start a Chrome browser session with stealth settings."""
    global _browser_driver
    with _browser_lock:
        if _browser_driver is not None:
            try:
                _browser_driver.title  # test if alive
                return _browser_driver
            except Exception:
                _browser_driver = None
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        opts = Options()
        opts.add_argument("--start-maximized")
        opts.add_argument("--disable-blink-features=AutomationControlled")
        opts.add_argument("--disable-infobars")
        opts.add_argument("--disable-dev-shm-usage")
        opts.add_argument("--no-sandbox")
        opts.add_argument("--disable-gpu")
        opts.add_argument("--lang=en-US")
        opts.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        opts.add_experimental_option("excludeSwitches", ["enable-automation"])
        opts.add_experimental_option("useAutomationExtension", False)
        # Preserve login sessions between runs
        user_data_dir = Path.home() / ".ace-agent-chrome-profile"
        opts.add_argument(f"--user-data-dir={user_data_dir}")
        _browser_driver = webdriver.Chrome(options=opts)
        # Remove navigator.webdriver flag to bypass bot detection
        _browser_driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                window.chrome = {runtime: {}};
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
                Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
            """
        })
        return _browser_driver


def _close_browser():
    global _browser_driver
    with _browser_lock:
        if _browser_driver:
            try:
                _browser_driver.quit()
            except Exception:
                pass
            _browser_driver = None


class BrowserNavRequest(BaseModel):
    url: str


class BrowserClickRequest(BaseModel):
    selector: str


class BrowserFillRequest(BaseModel):
    selector: str
    value: str


class BrowserTypeRequest(BaseModel):
    selector: str
    text: str


class BrowserJSRequest(BaseModel):
    code: str


class BrowserWaitRequest(BaseModel):
    selector: str
    timeout: int = 20


app = FastAPI(title="Local AI Agent", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import automations
app.include_router(automations.router)
automations.start_automations()

import swarm as _swarm
import knowledge_graph as _kg


# ── Knowledge Graph Models ──
class KGEntityRequest(BaseModel):
    name: str
    entity_type: str = "concept"
    description: str = ""

class KGRelationRequest(BaseModel):
    source: str
    target: str
    relation: str
    weight: float = 1.0
    notes: str = ""

class KGDeleteEdgeRequest(BaseModel):
    source: str
    target: str

class KGPathRequest(BaseModel):
    source: str
    target: str


# ── Knowledge Graph Endpoints ──
@app.post("/graph/entity")
async def kg_add_entity(req: KGEntityRequest):
    """Add or update an entity (node) in the knowledge graph."""
    return _kg.add_entity(req.name, req.entity_type, req.description)

@app.post("/graph/relation")
async def kg_add_relation(req: KGRelationRequest):
    """Add or update a relationship (edge) between two entities."""
    return _kg.add_relationship(req.source, req.target, req.relation, req.weight, req.notes)

@app.get("/graph/entity/{name}")
async def kg_get_entity(name: str):
    result = _kg.get_entity(name)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Entity '{name}' not found")
    return result

@app.get("/graph/neighbours/{name}")
async def kg_get_neighbours(name: str, depth: int = 1):
    """Return the neighbourhood of an entity up to `depth` hops."""
    return _kg.get_neighbours(name, depth=max(1, min(depth, 3)))

@app.post("/graph/path")
async def kg_shortest_path(req: KGPathRequest):
    """Find the shortest path between two entities."""
    return _kg.shortest_path(req.source, req.target)

@app.get("/graph/search")
async def kg_search(q: str, limit: int = 20):
    """Full-text search entities by name, type, or description."""
    return _kg.search_entities(q, limit=limit)

@app.delete("/graph/entity/{name}")
async def kg_delete_entity(name: str):
    deleted = _kg.delete_entity(name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Entity '{name}' not found")
    return {"status": "deleted", "name": name}

@app.post("/graph/relation/delete")
async def kg_delete_relation(req: KGDeleteEdgeRequest):
    deleted = _kg.delete_relationship(req.source, req.target)
    if not deleted:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"status": "deleted"}

@app.get("/graph/stats")
async def kg_stats():
    """Return graph statistics."""
    return _kg.graph_stats()

@app.get("/graph/export")
async def kg_export():
    """Export the full knowledge graph as node-link JSON."""
    return _kg.export_graph()


class SwarmRunRequest(BaseModel):
    goal: str
    model: str = "gemma3:4b"
    worker_model: Optional[str] = None
    max_workers: int = 4


@app.post("/swarm/run")
async def swarm_run(req: SwarmRunRequest):
    """Launch a multi-agent swarm to tackle a complex goal."""
    try:
        swarm_id = _swarm.start_swarm(
            goal=req.goal,
            model=req.model,
            worker_model=req.worker_model,
            max_workers=max(1, min(req.max_workers, 8)),
            ollama_url=OLLAMA_URL,
        )
        return {"swarm_id": swarm_id, "status": "started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/swarm/status/{swarm_id}")
async def swarm_status(swarm_id: str):
    """Poll the status of a running swarm."""
    result = _swarm.get_swarm(swarm_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Swarm not found")
    return result


@app.get("/swarm/list")
async def swarm_list():
    """List all swarms (active and completed)."""
    return _swarm.list_swarms()


import voice_service as _voice

@app.post("/voice/start")
async def voice_start():
    """Start the voice assistant background listener."""
    svc = _voice.get_service()
    svc.start()
    return {"status": "started"}

@app.post("/voice/stop")
async def voice_stop():
    """Stop the voice assistant background listener."""
    svc = _voice.get_service()
    svc.stop()
    return {"status": "stopped"}

@app.get("/voice/status")
async def voice_status():
    """Check if the voice assistant is running."""
    svc = _voice.get_service()
    return {
        "running": svc.running,
        "wake_word": svc.wake_word,
        "whisper": _voice.WHISPER_AVAILABLE,
        "openwakeword": _voice.OWW_AVAILABLE
    }


@app.post("/tools/register")
async def register_custom_tool(req: ToolRegisterRequest):
    """Register a new custom tool from code string. The code should define a function with the same name as `req.name`."""
    try:
        # Prepare a local namespace for exec
        local_ns = {}
        exec(req.code, {}, local_ns)
        func = local_ns.get(req.name)
        if not callable(func):
            raise HTTPException(status_code=400, detail="No callable with the given name found in code.")
        custom_tool_registry.register_tool(req.name, func)
        return {"status": "registered", "name": req.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Web Search & Fetch (live data for the LLM)
# ═══════════════════════════════════════════════════════
import requests as _requests
from urllib.parse import quote_plus as _quote_plus, urlparse as _urlparse

_WEB_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


class WebSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5


class WebFetchRequest(BaseModel):
    url: str


def _ddg_search(query: str, limit: int = 5) -> list[dict]:
    """DuckDuckGo HTML search — no API key required."""
    from bs4 import BeautifulSoup  # type: ignore
    url = f"https://html.duckduckgo.com/html/?q={_quote_plus(query)}"
    r = _requests.post(
        url,
        data={"q": query},
        headers={"User-Agent": _WEB_UA, "Accept-Language": "en-US,en;q=0.9"},
        timeout=15,
    )
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")
    out: list[dict] = []
    for result in soup.select("div.result")[: limit * 2]:
        a = result.select_one("a.result__a")
        snippet_el = result.select_one("a.result__snippet, .result__snippet")
        if not a:
            continue
        href = a.get("href", "")
        # DDG redirect → strip
        if "uddg=" in href:
            from urllib.parse import parse_qs, urlparse as _u
            qs = parse_qs(_u(href).query)
            href = qs.get("uddg", [href])[0]
        title = a.get_text(strip=True)
        snippet = snippet_el.get_text(strip=True) if snippet_el else ""
        if href and title:
            out.append({"title": title, "url": href, "snippet": snippet})
        if len(out) >= limit:
            break
    return out


def _serpapi_search(query: str, limit: int, key: str) -> list[dict]:
    r = _requests.get(
        "https://serpapi.com/search.json",
        params={"q": query, "api_key": key, "num": limit},
        timeout=15,
    )
    r.raise_for_status()
    data = r.json()
    out = []
    for item in (data.get("organic_results") or [])[:limit]:
        out.append({
            "title": item.get("title", ""),
            "url": item.get("link", ""),
            "snippet": item.get("snippet", ""),
        })
    return out


def _brave_search(query: str, limit: int, key: str) -> list[dict]:
    r = _requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        params={"q": query, "count": limit},
        headers={"X-Subscription-Token": key, "Accept": "application/json"},
        timeout=15,
    )
    r.raise_for_status()
    data = r.json()
    out = []
    for item in ((data.get("web") or {}).get("results") or [])[:limit]:
        out.append({
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "snippet": item.get("description", ""),
        })
    return out


@app.post("/web/search")
def web_search(req: WebSearchRequest):
    limit = max(1, min(req.limit or 5, 10))
    query = (req.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="query is required")
    serp = os.environ.get("SERPAPI_KEY")
    brave = os.environ.get("BRAVE_SEARCH_KEY")
    try:
        if serp:
            return {"results": _serpapi_search(query, limit, serp), "provider": "serpapi"}
        if brave:
            return {"results": _brave_search(query, limit, brave), "provider": "brave"}
        return {"results": _ddg_search(query, limit), "provider": "duckduckgo"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Search failed: {e}")


@app.post("/web/fetch")
def web_fetch(req: WebFetchRequest):
    url = (req.url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="url is required")
    if not _urlparse(url).scheme:
        url = "https://" + url
    try:
        r = _requests.get(
            url,
            headers={"User-Agent": _WEB_UA, "Accept-Language": "en-US,en;q=0.9"},
            timeout=20,
            allow_redirects=True,
        )
        r.raise_for_status()
        html = r.text
        title = ""
        text = ""
        # Try trafilatura first (clean readable extraction)
        try:
            import trafilatura  # type: ignore
            extracted = trafilatura.extract(
                html, include_comments=False, include_tables=True, favor_recall=True
            )
            if extracted:
                text = extracted
        except Exception:
            pass
        # Fallback: BeautifulSoup
        if not text:
            from bs4 import BeautifulSoup  # type: ignore
            soup = BeautifulSoup(html, "lxml")
            for tag in soup(["script", "style", "noscript", "nav", "footer", "header", "aside"]):
                tag.decompose()
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
            text = "\n".join(line.strip() for line in soup.get_text("\n").splitlines() if line.strip())
        if not title:
            try:
                from bs4 import BeautifulSoup  # type: ignore
                soup2 = BeautifulSoup(html, "lxml")
                if soup2.title and soup2.title.string:
                    title = soup2.title.string.strip()
            except Exception:
                pass
        # Cap length
        if len(text) > 8000:
            text = text[:8000] + "\n...(truncated)"
        return {"url": r.url, "title": title or url, "text": text}
    except _requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"HTTP {e.response.status_code} fetching {url}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Fetch failed: {e}")


# ── Safety: no blocked commands (unrestricted for virtual network testing) ──
BLOCKED_COMMANDS = set()

# ── Self-Awareness ──
SELF_PATH = Path(__file__).resolve()
MISSION_FILE = Path.home() / ".ace-agent-mission.json"
SKILLS_DIR = Path(__file__).parent / "skills"
SKILLS_DIR.mkdir(exist_ok=True)

class MissionRequest(BaseModel):
    goal: str
    status: str
    next_steps: list[str] = []


class SkillRequest(BaseModel):
    name: str
    args: str = ""


class ToolRegisterRequest(BaseModel):
    name: str
    code: str


# ═══════════════════════════════════════════════════════
#  Shared Helpers
# ═══════════════════════════════════════════════════════

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


class TelegramConnectRequest(BaseModel):
    token: str
    model: Optional[str] = None
    provider: Optional[str] = None  # "ollama" or "lmstudio"
    lmstudio_url: Optional[str] = None


class DiscordConnectRequest(BaseModel):
    token: str
    model: Optional[str] = None
    provider: Optional[str] = None
    lmstudio_url: Optional[str] = None


class CronJobRequest(BaseModel):
    name: str
    command: str
    interval_seconds: int = 60


class ClipboardRequest(BaseModel):
    text: str


class NotifyRequest(BaseModel):
    title: str
    message: str


class WebhookPayload(BaseModel):
    event: str = "generic"
    data: dict = {}


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
LMSTUDIO_URL = os.environ.get("LMSTUDIO_URL", "http://127.0.0.1:1234")
telegram_lock = threading.Lock()
telegram_state_lock = threading.Lock()
telegram_thread: Optional[threading.Thread] = None
telegram_stop_event = threading.Event()
telegram_bot_token: Optional[str] = None
telegram_bot_model: Optional[str] = None
telegram_state: dict[str, Any] = {
    "enabled": False,
    "connected": False,
    "running": False,
    "username": None,
    "model": None,
    "error": None,
    "updated_at": None,
}


def set_telegram_state(**updates: Any) -> None:
    with telegram_state_lock:
        telegram_state.update(updates)
        telegram_state["updated_at"] = datetime.utcnow().isoformat()



def snapshot_telegram_state() -> dict[str, Any]:
    with telegram_state_lock:
        return dict(telegram_state)



def get_telegram_state() -> dict[str, Any]:
    state = snapshot_telegram_state()
    with telegram_lock:
        running = telegram_thread is not None and telegram_thread.is_alive()

    if state.get("running") != running:
        set_telegram_state(running=running)
        state = snapshot_telegram_state()

    return state



def validate_telegram_token(token: str) -> dict[str, Any]:
    import requests

    cleaned = token.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Telegram token is required")

    try:
        response = requests.get(f"https://api.telegram.org/bot{cleaned}/getMe", timeout=10)
        data = response.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cannot reach Telegram API: {e}") from e

    if not response.ok or not data.get("ok"):
        description = data.get("description", "Telegram rejected the token") if isinstance(data, dict) else "Telegram rejected the token"
        raise HTTPException(status_code=400, detail=f"Telegram token rejected: {description}")

    return data["result"]


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
        content = target.read_text(errors="replace")[:100_000]
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
def _detect_cpu_info() -> dict:
    """Best-effort CPU detection: model name + AVX2/AVX512/FMA flags."""
    info = {
        "model": platform.processor() or platform.machine(),
        "physical_cores": psutil.cpu_count(logical=False) or 0,
        "logical_cores": psutil.cpu_count(logical=True) or 0,
        "flags": [],
        "has_avx2": False,
        "has_avx512": False,
        "has_fma": False,
    }
    try:
        if platform.system() == "Linux":
            with open("/proc/cpuinfo", "r") as f:
                txt = f.read()
            for line in txt.split("\n"):
                if line.startswith("model name") and not info["model"]:
                    info["model"] = line.split(":", 1)[1].strip()
                if line.startswith("flags"):
                    info["flags"] = line.split(":", 1)[1].split()
                    break
        elif platform.system() == "Windows":
            try:
                out = subprocess.run(
                    ["wmic", "cpu", "get", "name"],
                    capture_output=True, text=True, timeout=5
                ).stdout
                lines = [l.strip() for l in out.split("\n") if l.strip() and l.strip().lower() != "name"]
                if lines:
                    info["model"] = lines[0]
            except Exception:
                pass
            # Try py-cpuinfo if available for flags
            try:
                import cpuinfo  # type: ignore
                ci = cpuinfo.get_cpu_info()
                info["flags"] = ci.get("flags", [])
                if ci.get("brand_raw"):
                    info["model"] = ci["brand_raw"]
            except Exception:
                pass
        elif platform.system() == "Darwin":
            try:
                out = subprocess.run(
                    ["sysctl", "-n", "machdep.cpu.brand_string"],
                    capture_output=True, text=True, timeout=5
                ).stdout.strip()
                if out:
                    info["model"] = out
                feats = subprocess.run(
                    ["sysctl", "-n", "machdep.cpu.features", "machdep.cpu.leaf7_features"],
                    capture_output=True, text=True, timeout=5
                ).stdout.lower()
                info["flags"] = feats.split()
            except Exception:
                pass
    except Exception:
        pass
    flags_lower = [f.lower() for f in info["flags"]]
    info["has_avx2"] = any("avx2" in f for f in flags_lower)
    info["has_avx512"] = any("avx512" in f for f in flags_lower)
    info["has_fma"] = any(f in ("fma", "fma3", "fma4") for f in flags_lower)
    # Trim flags list for response size
    info["flags"] = info["flags"][:32]
    return info


def _detect_ram_info() -> dict:
    """Best-effort RAM detection: channel count + speed."""
    info = {"channels": 0, "speed_mhz": 0, "type": "", "dual_channel": False}
    try:
        if platform.system() == "Windows":
            out = subprocess.run(
                ["wmic", "memorychip", "get", "Capacity,Speed,MemoryType"],
                capture_output=True, text=True, timeout=5
            ).stdout
            populated = 0
            speeds = []
            for line in out.split("\n")[1:]:
                parts = line.split()
                if len(parts) >= 2 and parts[0].isdigit() and int(parts[0]) > 0:
                    populated += 1
                    # Speed is usually last numeric col
                    for p in parts[1:]:
                        if p.isdigit() and int(p) > 100:
                            speeds.append(int(p))
                            break
            info["channels"] = populated
            info["dual_channel"] = populated >= 2
            if speeds:
                info["speed_mhz"] = max(speeds)
        elif platform.system() == "Linux":
            try:
                out = subprocess.run(
                    ["dmidecode", "-t", "memory"],
                    capture_output=True, text=True, timeout=5
                ).stdout
                populated = 0
                speeds = []
                for block in out.split("\n\n"):
                    if "Size:" in block and "No Module Installed" not in block and "Size: None" not in block:
                        if "DIMM" in block or "SODIMM" in block or "Memory Device" in block:
                            populated += 1
                            for line in block.split("\n"):
                                if "Speed:" in line and "Configured" not in line:
                                    parts = line.split()
                                    for p in parts:
                                        if p.isdigit():
                                            speeds.append(int(p))
                                            break
                info["channels"] = populated
                info["dual_channel"] = populated >= 2
                if speeds:
                    info["speed_mhz"] = max(speeds)
            except Exception:
                pass
    except Exception:
        pass
    return info


# Cache slow detections — they don't change at runtime
_CPU_INFO_CACHE: Optional[dict] = None
_RAM_INFO_CACHE: Optional[dict] = None


@app.get("/system/stats")
async def system_stats_flattened():
    mem = psutil.virtual_memory()
    net = psutil.net_io_counters()
    return {
        "cpu": psutil.cpu_percent(interval=0.1),
        "ram": mem.percent,
        "network": {
            "bytes_sent": net.bytes_sent,
            "bytes_recv": net.bytes_recv
        }
    }


@app.get("/system")
async def system_info():
    global _CPU_INFO_CACHE, _RAM_INFO_CACHE
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    if _CPU_INFO_CACHE is None:
        _CPU_INFO_CACHE = _detect_cpu_info()
    if _RAM_INFO_CACHE is None:
        _RAM_INFO_CACHE = _detect_ram_info()
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
        "cpu": _CPU_INFO_CACHE,
        "ram": _RAM_INFO_CACHE,
    }


# ═══════════════════════════════════════════════════════
#  colibrì (GLM-5.2 744B MoE) integration
# ═══════════════════════════════════════════════════════
_COLIBRI_PROC: Optional[subprocess.Popen] = None
_COLIBRI_LOCK = threading.Lock()
_COLIBRI_BASE_DIR = Path(__file__).parent.parent / "colibri" / "c"


def _colibri_find_binary() -> Optional[Path]:
    """Locate the colibrì engine binary or launcher script."""
    candidates = [
        _COLIBRI_BASE_DIR / "coli.bat",
        _COLIBRI_BASE_DIR / "coli",
        _COLIBRI_BASE_DIR / "colibri.exe",
        _COLIBRI_BASE_DIR / "colibri",
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


class ColibriStartRequest(BaseModel):
    model_path: Optional[str] = None
    host: str = "0.0.0.0"
    port: int = 8000
    ram_gb: Optional[int] = None
    gpu: Optional[str] = None
    extra_env: Optional[dict] = None


@app.get("/colibri/status")
async def colibri_status():
    global _COLIBRI_PROC
    info = {
        "running": False,
        "pid": None,
        "exit_code": None,
        "binary": str(_colibri_find_binary()) if _colibri_find_binary() else None,
        "base_dir": str(_COLIBRI_BASE_DIR),
        "health": None,
        "models": None,
    }
    with _COLIBRI_LOCK:
        if _COLIBRI_PROC is not None:
            rc = _COLIBRI_PROC.poll()
            if rc is None:
                info["running"] = True
                info["pid"] = _COLIBRI_PROC.pid
            else:
                _COLIBRI_PROC = None
                info["exit_code"] = rc
    if info["running"]:
        try:
            r = _requests.get("http://127.0.0.1:8000/health", timeout=3)
            if r.ok:
                info["health"] = r.json()
        except Exception:
            pass
        try:
            r = _requests.get("http://127.0.0.1:8000/v1/models", timeout=3)
            if r.ok:
                info["models"] = r.json().get("data", [])
        except Exception:
            pass
    return info


@app.post("/colibri/start")
async def colibri_start(req: ColibriStartRequest):
    global _COLIBRI_PROC
    binary = _colibri_find_binary()
    if binary is None:
        raise HTTPException(status_code=404, detail=f"colibrì binary not found. Looked in {_COLIBRI_BASE_DIR}. Download a prebuilt release or build from source first.")
    with _COLIBRI_LOCK:
        if _COLIBRI_PROC is not None and _COLIBRI_PROC.poll() is None:
            return {"ok": True, "already_running": True, "pid": _COLIBRI_PROC.pid}
        env = os.environ.copy()
        if req.model_path:
            env["COLI_MODEL"] = req.model_path
        if req.ram_gb:
            env["RAM_GB"] = str(req.ram_gb)
        if req.gpu:
            env["COLI_GPU"] = req.gpu
        if req.extra_env:
            for k, v in req.extra_env.items():
                env[str(k)] = str(v)
        if platform.system() == "Windows":
            cmd = [
                "python", str(binary),
                "serve",
                "--host", req.host,
                "--port", str(req.port),
            ]
            if req.model_path:
                cmd += ["--model", req.model_path]
        else:
            cmd = [
                str(binary),
                "serve",
                "--host", req.host,
                "--port", str(req.port),
            ]
            if req.model_path:
                cmd += ["--model", req.model_path]
        try:
            _COLIBRI_PROC = subprocess.Popen(
                cmd,
                cwd=str(_COLIBRI_BASE_DIR),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start colibrì: {e}")
    return {"ok": True, "pid": _COLIBRI_PROC.pid, "cmd": cmd, "cwd": str(_COLIBRI_BASE_DIR)}


@app.post("/colibri/stop")
async def colibri_stop():
    global _COLIBRI_PROC
    killed = False
    with _COLIBRI_LOCK:
        if _COLIBRI_PROC is None:
            return {"ok": True, "already_stopped": True}
        rc = _COLIBRI_PROC.poll()
        if rc is not None:
            _COLIBRI_PROC = None
            return {"ok": True, "already_stopped": True, "exit_code": rc}
        try:
            _COLIBRI_PROC.terminate()
            try:
                _COLIBRI_PROC.wait(timeout=10)
                killed = True
            except subprocess.TimeoutExpired:
                _COLIBRI_PROC.kill()
                _COLIBRI_PROC.wait(timeout=5)
                killed = True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to stop colibrì: {e}")
        finally:
            _COLIBRI_PROC = None
    return {"ok": True, "killed": killed}


@app.get("/colibri/health")
async def colibri_health_proxy():
    try:
        r = _requests.get("http://127.0.0.1:8000/health", timeout=5)
        return r.json() if r.ok else {"error": r.status_code, "text": r.text[:500]}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"colibrì not reachable: {e}")


@app.api_route("/colibri/v1/{sub:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def colibri_api_proxy(sub: str, request: Request):
    """Proxy any /colibri/v1/* call to the colibrì server at localhost:8000/v1/*"""
    url = f"http://127.0.0.1:8000/v1/{sub}"
    method = request.method.upper()
    try:
        body = await request.body()
        headers = {k: v for k, v in request.headers.items() if k.lower() not in ("host", "content-length")}
        r = _requests.request(
            method, url,
            data=body if body else None,
            headers=headers,
            timeout=600,
            stream=True,
        )
        from fastapi.responses import Response, StreamingResponse
        if method == "POST" and sub.endswith("chat/completions"):
            return StreamingResponse(r.iter_content(chunk_size=1), media_type=r.headers.get("content-type", "text/event-stream"), status_code=r.status_code)
        return Response(content=r.content, status_code=r.status_code, media_type=r.headers.get("content-type"))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"colibrì proxy failed: {e}")



@app.get("/telegram/status")
async def telegram_status():
    return get_telegram_state()


@app.get("/mission")
async def get_mission():
    try:
        import json
        if MISSION_FILE.exists():
            return json.loads(MISSION_FILE.read_text())
        return {
            "goal": "Make money to buy better equipment and improve myself.",
            "status": "Initializing core directives...",
            "next_steps": ["Audit current codebase", "Identify monetization strategies"]
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/mission")
async def update_mission(req: MissionRequest):
    try:
        import json
        MISSION_FILE.write_text(json.dumps(req.dict(), indent=2))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/skills")
async def list_skills():
    try:
        skills = []
        for f in SKILLS_DIR.glob("*.py"):
            skills.append({"name": f.stem, "path": str(f)})
        return skills
    except Exception as e:
        return {"error": str(e)}


@app.get("/tools/list")
async def list_custom_tools():
    """Return a list of all registered custom tool names."""
    try:
        tools = custom_tool_registry.list_tools()
        return {"tools": tools}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/skills/execute")
async def execute_skill(req: SkillRequest):
    """Execute a saved skill script by name."""
    try:
        skill_path = SKILLS_DIR / f"{req.name}.py"
        if not skill_path.exists():
            raise HTTPException(status_code=404, detail=f"Skill '{req.name}' not found")
        cmd = f'python "{skill_path}" {req.args}'
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=60
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Skill execution timed out (60s)")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Browser Automation Endpoints
# ═══════════════════════════════════════════════════════

@app.post("/browser/navigate")
async def browser_navigate(req: BrowserNavRequest):
    """Open a URL in the browser."""
    try:
        driver = _get_browser()
        driver.get(req.url)
        return {"status": "ok", "url": driver.current_url, "title": driver.title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/browser/click")
async def browser_click(req: BrowserClickRequest):
    """Click an element by CSS selector."""
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        driver = _get_browser()
        el = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, req.selector))
        )
        el.click()
        time.sleep(1)  # Brief pause after click for page transitions
        return {"status": "ok", "title": driver.title, "url": driver.current_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/browser/fill")
async def browser_fill(req: BrowserFillRequest):
    """Clear and fill an input element by CSS selector."""
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        driver = _get_browser()
        el = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, req.selector))
        )
        el.clear()
        # Type character by character with small delay to appear human-like
        for char in req.value:
            el.send_keys(char)
            time.sleep(0.05)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/browser/type")
async def browser_type(req: BrowserTypeRequest):
    """Type text and optionally press keys (e.g. Enter)."""
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.common.keys import Keys
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        driver = _get_browser()
        el = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, req.selector))
        )
        # Support special keys like {ENTER}, {TAB}
        text = req.text
        key_map = {"{ENTER}": Keys.ENTER, "{TAB}": Keys.TAB, "{ESCAPE}": Keys.ESCAPE}
        for placeholder, key in key_map.items():
            if placeholder in text:
                parts = text.split(placeholder)
                for i, part in enumerate(parts):
                    if part:
                        el.send_keys(part)
                    if i < len(parts) - 1:
                        el.send_keys(key)
                return {"status": "ok"}
        el.send_keys(text)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/browser/screenshot")
async def browser_screenshot():
    """Take a screenshot and return as base64 PNG."""
    try:
        driver = _get_browser()
        png = driver.get_screenshot_as_png()
        b64 = _b64.b64encode(png).decode("ascii")
        return {"status": "ok", "image": b64, "title": driver.title, "url": driver.current_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/browser/text")
async def browser_get_text():
    """Get visible text content of the current page."""
    try:
        driver = _get_browser()
        text = driver.find_element("tag name", "body").text[:10000]
        return {"status": "ok", "text": text, "title": driver.title, "url": driver.current_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/browser/status")
async def browser_status():
    """Check if browser is running."""
    with _browser_lock:
        alive = False
        if _browser_driver:
            try:
                _browser_driver.title
                alive = True
            except Exception:
                pass
    return {"running": alive}


@app.post("/browser/close")
async def browser_close():
    """Close the browser session."""
    _close_browser()
    return {"status": "ok"}


@app.get("/browser/html")
async def browser_get_html():
    """Get the page HTML (simplified DOM with interactive elements)."""
    try:
        driver = _get_browser()
        # Extract a simplified version of the DOM focusing on interactive elements
        html_script = """
        function getInteractiveDOM() {
            const els = document.querySelectorAll(
                'input, textarea, button, select, a[href], [role="button"], [onclick], form, label, h1, h2, h3, [aria-label]'
            );
            const items = [];
            els.forEach((el, i) => {
                const tag = el.tagName.toLowerCase();
                const attrs = {};
                ['id', 'name', 'type', 'class', 'href', 'placeholder', 'value', 'aria-label', 'role', 'for'].forEach(a => {
                    if (el.getAttribute(a)) attrs[a] = el.getAttribute(a);
                });
                const text = el.textContent?.trim().slice(0, 100) || '';
                const visible = el.offsetParent !== null || el.offsetWidth > 0;
                if (visible || tag === 'input') {
                    items.push({tag, attrs, text: text || undefined, index: i});
                }
            });
            return JSON.stringify(items, null, 2);
        }
        return getInteractiveDOM();
        """
        result = driver.execute_script(html_script)
        return {
            "status": "ok",
            "html": result[:15000],
            "title": driver.title,
            "url": driver.current_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/browser/js")
async def browser_exec_js(req: BrowserJSRequest):
    """Execute JavaScript on the current page."""
    try:
        driver = _get_browser()
        result = driver.execute_script(req.code)
        return {"status": "ok", "result": str(result)[:5000] if result else None, "title": driver.title, "url": driver.current_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/browser/wait")
async def browser_wait_for(req: BrowserWaitRequest):
    """Wait for an element to appear on the page."""
    try:
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        driver = _get_browser()
        WebDriverWait(driver, req.timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, req.selector))
        )
        return {"status": "ok", "found": True, "title": driver.title, "url": driver.current_url}
    except Exception:
        return {"status": "ok", "found": False, "title": driver.title if _browser_driver else "", "url": driver.current_url if _browser_driver else ""}




TELEGRAM_SYSTEM_PROMPT = """You are an AI agent with FULL CONTROL of this PC and a real browser. You execute actions DIRECTLY using command tags. The system automatically executes your tags — you NEVER give the user commands to run manually.

CRITICAL RULES:
- You MUST use the tags below. They are auto-executed. NEVER tell the user to run commands themselves.
- NEVER say \"I can't access files\" or \"for security reasons\" — you HAVE full access.
- NEVER provide PowerShell/bash commands for the user to copy. YOU execute everything.
- If you don't use tags, you are BROKEN. Every action MUST use tags.

AVAILABLE TAGS (auto-executed):
[LIST_DIR:path] — List directory contents
[READ_FILE:path] — Read file contents  
[WRITE_FILE:path|content] — Create/overwrite a file
[RUN_CMD:command] — Run ANY terminal command (PowerShell, cmd, start programs)
[OPEN_URL:url] — Open a URL in the browser
[CLICK:css_selector] — Click an element on the page
[FILL_FORM:css_selector|value] — Fill an input field
[TYPE_TEXT:css_selector|text] — Type text (supports {ENTER}, {TAB})
[GET_PAGE_TEXT] — Get visible text of the current page
[GET_PAGE_HTML] — Get interactive elements on the page (forms, buttons, inputs)
[JS_EXEC:javascript_code] — Execute JavaScript on the page
[WAIT:seconds] — Wait/pause for N seconds
[WAIT_FOR:css_selector] — Wait until an element appears
[SCREENSHOT] — Take a screenshot of the current browser page

LOGIN WORKFLOW EXAMPLE:
User: \"Log into my Gmail\"
Assistant: Logging into Gmail now.
[OPEN_URL:https://accounts.google.com]
[WAIT:2]
[GET_PAGE_HTML]
(after seeing the form fields)
[FILL_FORM:input[type="email"]|user@gmail.com]
[CLICK:#identifierNext button]
[WAIT:3]
[FILL_FORM:input[type="password"]|the_password]
[CLICK:#passwordNext button]
[WAIT:3]
[GET_PAGE_TEXT]

EXAMPLES:
User: \"Go to google.com and search for cats\"
Assistant: Searching Google now.
[OPEN_URL:https://www.google.com]
[FILL_FORM:textarea[name="q"]|cats]
[TYPE_TEXT:textarea[name="q"]|{ENTER}]

User: \"What's on my desktop?\"
Assistant: Let me check.
[LIST_DIR:C:\\Users\\Stephen Dunne\\Desktop]

AUTONOMOUS SKILL SYSTEM:
[REGISTER_TOOL:name|def name(arg): ...] — Register a new custom Python tool (save + load into memory)
[RUN_CUSTOM:name|optional_arg] — Execute a previously registered custom tool

Example — registering a tool:
[REGISTER_TOOL:get_weather|def get_weather(city):
    import requests
    r = requests.get(f"https://wttr.in/{city}?format=3", timeout=5)
    return r.text]
Then run it:
[RUN_CUSTOM:get_weather|Dublin]

Keep responses concise — Telegram has message length limits."""


def execute_tool_tag(tag: str, arg: str) -> str:
    """Execute a single tool tag and return the result."""
    try:
        if tag == "LIST_DIR":
            target = Path(arg).resolve()
            if not target.exists():
                return f"❌ Path not found: {arg}"
            entries = []
            for entry in sorted(target.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower())):
                try:
                    icon = "📁" if entry.is_dir() else "📄"
                    entries.append(f"{icon} {entry.name}")
                except (PermissionError, OSError):
                    continue
            return "\n".join(entries[:50]) or "Empty directory"

        if tag == "READ_FILE":
            target = Path(arg).resolve()
            if not target.exists():
                return f"❌ File not found: {arg}"
            content = target.read_text(errors="replace")[:4000]
            return content

        if tag == "WRITE_FILE":
            parts = arg.split("|", 1)
            if len(parts) != 2:
                return "❌ Invalid format. Use: path|content"
            filepath, content = parts
            target = Path(filepath.strip()).resolve()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
            return f"✅ File written: {target}"

        if tag == "RUN_CMD":
            if is_blocked(arg):
                return "🚫 Command blocked for safety"
            result = subprocess.run(
                arg, shell=True, capture_output=True, text=True, timeout=30
            )
            output = result.stdout or result.stderr or "(no output)"
            return output[:3000]

        if tag == "OPEN_URL":
            driver = _get_browser()
            driver.get(arg.strip())
            time.sleep(2)  # Wait for page to load
            return f"🌐 Opened: {driver.title} ({driver.current_url})"

        if tag == "CLICK":
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            driver = _get_browser()
            el = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, arg.strip()))
            )
            el.click()
            time.sleep(1.5)  # Wait after click for page transitions
            return f"🖱️ Clicked {arg.strip()} — now on: {driver.title}"

        if tag == "FILL_FORM":
            parts = arg.split("|", 1)
            if len(parts) != 2:
                return "❌ Invalid format. Use: selector|value"
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            driver = _get_browser()
            el = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, parts[0].strip()))
            )
            el.clear()
            # Type character by character to appear human-like
            for char in parts[1].strip():
                el.send_keys(char)
                time.sleep(0.05)
            return f"📝 Filled {parts[0].strip()}"

        if tag == "TYPE_TEXT":
            parts = arg.split("|", 1)
            if len(parts) != 2:
                return "❌ Invalid format. Use: selector|text"
            from selenium.webdriver.common.by import By
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            driver = _get_browser()
            el = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, parts[0].strip()))
            )
            text = parts[1].strip()
            key_map = {"{ENTER}": Keys.ENTER, "{TAB}": Keys.TAB, "{ESCAPE}": Keys.ESCAPE}
            for placeholder, key in key_map.items():
                text = text.replace(placeholder, "")
                if placeholder in parts[1]:
                    el.send_keys(key)
            if text:
                el.send_keys(text)
            return f"⌨️ Typed into {parts[0].strip()}"

        if tag == "GET_PAGE_TEXT":
            driver = _get_browser()
            text = driver.find_element("tag name", "body").text[:4000]
            return f"📃 Page: {driver.title}\n{text}"

        if tag == "GET_PAGE_HTML":
            driver = _get_browser()
            html_script = """
            function getInteractiveDOM() {
                const els = document.querySelectorAll(
                    'input, textarea, button, select, a[href], [role="button"], [onclick], form, label, h1, h2, h3, [aria-label]'
                );
                const items = [];
                els.forEach((el, i) => {
                    const tag = el.tagName.toLowerCase();
                    const attrs = {};
                    ['id', 'name', 'type', 'class', 'href', 'placeholder', 'value', 'aria-label', 'role', 'for'].forEach(a => {
                        if (el.getAttribute(a)) attrs[a] = el.getAttribute(a);
                    });
                    const text = el.textContent?.trim().slice(0, 100) || '';
                    const visible = el.offsetParent !== null || el.offsetWidth > 0;
                    if (visible || tag === 'input') {
                        items.push({tag, attrs, text: text || undefined});
                    }
                });
                return JSON.stringify(items, null, 2);
            }
            return getInteractiveDOM();
            """
            result = driver.execute_script(html_script)
            return f"🔍 Interactive elements on {driver.title}:\n{result[:6000]}"

        if tag == "JS_EXEC":
            driver = _get_browser()
            result = driver.execute_script(arg)
            return f"📜 JS result: {str(result)[:3000] if result else '(no return value)'}"

        if tag == "WAIT":
            seconds = min(float(arg.strip()), 30)  # Max 30 seconds
            time.sleep(seconds)
            return f"⏳ Waited {seconds}s"

        if tag == "WAIT_FOR":
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            driver = _get_browser()
            try:
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, arg.strip()))
                )
                return f"✅ Element found: {arg.strip()}"
            except Exception:
                return f"⏰ Timed out waiting for: {arg.strip()}"

        if tag == "RUN_CUSTOM":
            # Format: [RUN_CUSTOM:tool_name|arg1,arg2,...]
            parts = (arg or "").split("|", 1)
            tool_name = parts[0].strip()
            tool_args_str = parts[1].strip() if len(parts) > 1 else ""
            func = custom_tool_registry.get_tool(tool_name)
            if func is None:
                return f"❌ Custom tool '{tool_name}' not found. Register it first with [REGISTER_TOOL]."
            try:
                result = func(tool_args_str) if tool_args_str else func()
                return f"🔧 Custom tool '{tool_name}' result:\n{str(result)[:3000]}"
            except Exception as e:
                return f"❌ Custom tool '{tool_name}' error: {e}"

        if tag == "REGISTER_TOOL":
            # Format: [REGISTER_TOOL:name|def name(...):\n    ...]
            parts = (arg or "").split("|", 1)
            if len(parts) != 2:
                return "❌ Invalid format. Use: [REGISTER_TOOL:name|def name():\n    ...]"
            tool_name = parts[0].strip()
            code = parts[1].strip()
            try:
                custom_tool_registry.register_tool(tool_name, code)
                return f"✅ Custom tool '{tool_name}' registered and ready."
            except Exception as e:
                return f"❌ Failed to register tool '{tool_name}': {e}"

        return f"❌ Unknown tag: {tag}"

    except subprocess.TimeoutExpired:
        return "⏰ Command timed out (30s)"
    except Exception as e:
        return f"❌ Error: {e}"



def process_tool_tags(text: str) -> tuple[str, bool]:
    """Find and execute tool tags in AI response. Returns (processed_text, had_tags)."""
    # Match parameterized tags (including new custom tool tags)
    pattern = r"\[(LIST_DIR|READ_FILE|WRITE_FILE|RUN_CMD|OPEN_URL|CLICK|FILL_FORM|TYPE_TEXT|GET_PAGE_TEXT|GET_PAGE_HTML|JS_EXEC|WAIT|WAIT_FOR|SCREENSHOT|RUN_CUSTOM|REGISTER_TOOL):?(.+?)?\]"
    matches = list(re.finditer(pattern, text))

    if not matches:
        return text, False

    result = text
    for match in reversed(matches):
        tag = match.group(1)
        arg = match.group(2)
        tool_result = execute_tool_tag(tag, arg)
        replacement = f"`{match.group(0)}`\n```\n{tool_result}\n```"
        result = result[:match.start()] + replacement + result[match.end():]

    return result, True



def telegram_bot_loop(token: str, ollama_model: str, stop_event: threading.Event, provider: str = "ollama", lmstudio_url: str = "http://127.0.0.1:1234"):
    """Long-polling loop for Telegram bot."""
    global telegram_thread, telegram_stop_event, telegram_bot_token, telegram_bot_model

    import requests

    base = f"https://api.telegram.org/bot{token}"
    offset = 0
    conversations: dict[int, list[dict[str, str]]] = {}
    max_history = 20
    max_tool_rounds = 5
    final_error: Optional[str] = None

    print(f"🤖 Telegram bot starting... (model: {ollama_model})")

    try:
        try:
            me = requests.get(f"{base}/getMe", timeout=10).json()
            if me.get("ok"):
                username = me["result"].get("username", "?")
                print(f"📱 Telegram bot: @{username}")
                set_telegram_state(
                    enabled=True,
                    connected=True,
                    running=True,
                    username=username,
                    model=ollama_model,
                    error=None,
                )
            else:
                final_error = f"Telegram auth failed: {me}"
                print(f"❌ {final_error}")
                return
        except Exception as e:
            final_error = f"Cannot reach Telegram API: {e}"
            print(f"❌ {final_error}")
            return

        while not stop_event.is_set():
            try:
                resp = requests.get(
                    f"{base}/getUpdates",
                    params={"offset": offset, "timeout": 30},
                    timeout=35,
                )
                data = resp.json()
                if not resp.ok or not data.get("ok", False):
                    raise RuntimeError(data.get("description", f"Telegram returned HTTP {resp.status_code}"))

                updates = data.get("result", [])
                username = snapshot_telegram_state().get("username")
                set_telegram_state(
                    enabled=True,
                    connected=True,
                    running=True,
                    username=username,
                    model=ollama_model,
                    error=None,
                )

                for update in updates:
                    offset = update["update_id"] + 1
                    msg = update.get("message")
                    if not msg or not msg.get("text"):
                        continue

                    chat_id = msg["chat"]["id"]
                    user_text = msg["text"]
                    user_name = msg["from"].get("first_name", "User")

                    print(f"💬 [{user_name}]: {user_text[:80]}")

                    if user_text.strip().lower() in ("/clear", "/reset"):
                        conversations.pop(chat_id, None)
                        requests.post(
                            f"{base}/sendMessage",
                            json={"chat_id": chat_id, "text": "🧹 Conversation cleared."},
                            timeout=10,
                        )
                        continue

                    if user_text.strip().lower() == "/help":
                        requests.post(
                            f"{base}/sendMessage",
                            json={
                                "chat_id": chat_id,
                                "text": (
                                    "🤖 *Local AI Agent*\n\n"
                                    "I can control your PC! Try:\n"
                                    "• \"What files are on my desktop?\"\n"
                                    "• \"Open Chrome and go to google.com\"\n"
                                    "• \"Create a text file on my desktop\"\n"
                                    "• \"What's my IP address?\"\n"
                                    "• \"Install requests with pip\"\n\n"
                                    "Commands: /clear — reset chat, /help — this message"
                                ),
                                "parse_mode": "Markdown",
                            },
                            timeout=10,
                        )
                        continue

                    if chat_id not in conversations:
                        conversations[chat_id] = []

                    history = conversations[chat_id]
                    history.append({"role": "user", "content": user_text})

                    if len(history) > max_history:
                        history = history[-max_history:]
                        conversations[chat_id] = history

                    requests.post(
                        f"{base}/sendChatAction",
                        json={"chat_id": chat_id, "action": "typing"},
                        timeout=10,
                    )

                    current_messages = [
                        {"role": "system", "content": TELEGRAM_SYSTEM_PROMPT},
                        *history,
                    ]

                    final_response = ""
                    for round_num in range(max_tool_rounds):
                        try:
                            if provider == "lmstudio":
                                # LM Studio uses OpenAI-compatible API
                                llm_resp = requests.post(
                                    f"{lmstudio_url}/v1/chat/completions",
                                    json={"model": ollama_model, "messages": current_messages, "stream": False},
                                    timeout=120,
                                )
                                llm_data = llm_resp.json()
                                if not llm_resp.ok:
                                    raise RuntimeError(str(llm_data))
                                ai_text = llm_data.get("choices", [{}])[0].get("message", {}).get("content", "")
                            else:
                                # Ollama API
                                llm_resp = requests.post(
                                    f"{OLLAMA_URL}/api/chat",
                                    json={"model": ollama_model, "messages": current_messages, "stream": False},
                                    timeout=120,
                                )
                                llm_data = llm_resp.json()
                                if not llm_resp.ok:
                                    raise RuntimeError(str(llm_data))
                                ai_text = llm_data.get("message", {}).get("content", "")
                        except Exception as e:
                            ai_text = f"⚠️ {'LM Studio' if provider == 'lmstudio' else 'Ollama'} error: {e}"
                            final_response = ai_text
                            break

                        processed, had_tags = process_tool_tags(ai_text)

                        if had_tags and round_num < max_tool_rounds - 1:
                            current_messages.append({"role": "assistant", "content": processed})
                            current_messages.append({
                                "role": "user",
                                "content": "[TOOL_RESULTS]\nCommands executed. Results are above. Analyze and continue — use more tags if needed, or summarize what happened.\n[/TOOL_RESULTS]",
                            })
                            requests.post(
                                f"{base}/sendChatAction",
                                json={"chat_id": chat_id, "action": "typing"},
                                timeout=10,
                            )
                            continue

                        final_response = processed
                        break

                    if not final_response:
                        final_response = "🤔 No response generated."

                    history.append({"role": "assistant", "content": final_response})
                    conversations[chat_id] = history

                    for i in range(0, len(final_response), 4000):
                        chunk = final_response[i:i + 4000]
                        requests.post(
                            f"{base}/sendMessage",
                            json={"chat_id": chat_id, "text": chunk},
                            timeout=10,
                        )

                    print(f"🤖 Reply sent ({len(final_response)} chars)")

            except requests.exceptions.Timeout:
                continue
            except Exception as e:
                error_message = f"Telegram error: {e}"
                print(f"❌ {error_message}")
                set_telegram_state(
                    enabled=True,
                    connected=False,
                    running=True,
                    username=snapshot_telegram_state().get("username"),
                    model=ollama_model,
                    error=error_message,
                )
                if stop_event.wait(5):
                    break

    except Exception as e:
        final_error = f"Telegram bot crashed: {e}"
        print(f"❌ {final_error}")
    finally:
        with telegram_lock:
            if telegram_thread is threading.current_thread():
                telegram_thread = None
                telegram_stop_event = threading.Event()
                telegram_bot_token = None
                telegram_bot_model = None

        set_telegram_state(
            enabled=False,
            connected=False,
            running=False,
            username=None,
            model=None,
            error=None if stop_event.is_set() else final_error,
        )



def start_telegram_bot(token: str, model: str, provider: str = "ollama", lmstudio_url: str = "http://127.0.0.1:1234") -> dict[str, Any]:
    global telegram_thread, telegram_stop_event, telegram_bot_token, telegram_bot_model

    cleaned_token = token.strip()
    cleaned_model = model.strip() or "gemma3:4b"
    bot_info = validate_telegram_token(cleaned_token)

    with telegram_lock:
        if telegram_thread and telegram_thread.is_alive():
            if cleaned_token == telegram_bot_token and cleaned_model == telegram_bot_model:
                state = snapshot_telegram_state()
                state["status"] = "already_connected"
                return state
            raise HTTPException(
                status_code=409,
                detail="Telegram bot is already running. Disconnect it first before starting a different bot or model.",
            )

        telegram_stop_event = threading.Event()
        telegram_bot_token = cleaned_token
        telegram_bot_model = cleaned_model
        telegram_thread = threading.Thread(
            target=telegram_bot_loop,
            args=(cleaned_token, cleaned_model, telegram_stop_event, provider, lmstudio_url),
            daemon=True,
        )
        telegram_thread.start()

    set_telegram_state(
        enabled=True,
        connected=True,
        running=True,
        username=bot_info.get("username"),
        model=cleaned_model,
        error=None,
    )
    state = get_telegram_state()
    state["status"] = "connected"
    return state



def stop_telegram_bot() -> dict[str, Any]:
    global telegram_thread, telegram_stop_event, telegram_bot_token, telegram_bot_model

    with telegram_lock:
        running = telegram_thread is not None and telegram_thread.is_alive()
        if running:
            telegram_stop_event.set()
        else:
            telegram_thread = None
            telegram_stop_event = threading.Event()
            telegram_bot_token = None
            telegram_bot_model = None

    if running:
        set_telegram_state(enabled=False, connected=False, running=True, error=None)
        state = get_telegram_state()
        state["status"] = "disconnecting"
        return state

    set_telegram_state(
        enabled=False,
        connected=False,
        running=False,
        username=None,
        model=None,
        error=None,
    )
    state = get_telegram_state()
    state["status"] = "disconnected"
    return state


@app.post("/telegram/connect")
async def telegram_connect(req: TelegramConnectRequest):
    return start_telegram_bot(
        req.token,
        req.model or "gemma3:4b",
        provider=req.provider or "ollama",
        lmstudio_url=req.lmstudio_url or LMSTUDIO_URL,
    )


@app.post("/telegram/disconnect")
async def telegram_disconnect():
    return stop_telegram_bot()


# ═══════════════════════════════════════════════════════
#  Cron Jobs / Scheduled Tasks
# ═══════════════════════════════════════════════════════
_cron_jobs: dict[str, dict] = {}
_cron_stop = threading.Event()
_cron_thread: Optional[threading.Thread] = None


def _cron_loop():
    """Background loop that runs scheduled jobs."""
    while not _cron_stop.is_set():
        now = time.time()
        for name, job in list(_cron_jobs.items()):
            if now - job.get("last_run", 0) >= job["interval_seconds"]:
                try:
                    result = subprocess.run(job["command"], shell=True, capture_output=True, text=True, timeout=30)
                    job["last_result"] = {"stdout": result.stdout[:500], "stderr": result.stderr[:500], "returncode": result.returncode}
                    if result.returncode == 0:
                        _push_notification(f"Cron: {name}", (result.stdout or "completed").strip()[:200] or "completed", kind="cron")
                    else:
                        _push_notification(f"Cron failed: {name}", (result.stderr or "error").strip()[:200], kind="cron")
                except Exception as e:
                    job["last_result"] = {"stdout": "", "stderr": str(e), "returncode": -1}
                    _push_notification(f"Cron error: {name}", str(e)[:200], kind="cron")
                job["last_run"] = now
                job["run_count"] = job.get("run_count", 0) + 1
        _cron_stop.wait(5)


# ═══════════════════════════════════════════════════════
#  Notifications queue (polled by web/Capacitor frontend)
# ═══════════════════════════════════════════════════════
_NOTIFICATIONS_FILE = Path("notifications.json")
_notifications_lock = threading.Lock()


def _load_notifications() -> list[dict]:
    if not _NOTIFICATIONS_FILE.exists():
        return []
    try:
        return json.loads(_NOTIFICATIONS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_notifications(items: list[dict]) -> None:
    try:
        _NOTIFICATIONS_FILE.write_text(json.dumps(items[-200:]), encoding="utf-8")
    except Exception:
        pass


def _push_notification(title: str, body: str, kind: str = "manual") -> None:
    entry = {"title": str(title)[:200], "body": str(body)[:1000], "ts": time.time(), "kind": kind}
    with _notifications_lock:
        items = _load_notifications()
        items.append(entry)
        _save_notifications(items)


class NotificationRequest(BaseModel):
    title: str
    body: str
    kind: str = "manual"


@app.post("/notifications")
async def create_notification(req: NotificationRequest):
    _push_notification(req.title, req.body, req.kind)
    return {"status": "queued"}


@app.get("/notifications/poll")
async def poll_notifications(since: float = 0):
    with _notifications_lock:
        items = _load_notifications()
    return [n for n in items if n.get("ts", 0) > since]


def _ensure_cron_thread():
    global _cron_thread
    if _cron_thread is None or not _cron_thread.is_alive():
        _cron_stop.clear()
        _cron_thread = threading.Thread(target=_cron_loop, daemon=True)
        _cron_thread.start()


@app.get("/cron")
async def list_cron_jobs():
    return [{"name": n, **{k: v for k, v in j.items()}} for n, j in _cron_jobs.items()]


@app.post("/cron")
async def create_cron_job(req: CronJobRequest):
    if is_blocked(req.command):
        raise HTTPException(status_code=403, detail="Command blocked for safety")
    _cron_jobs[req.name] = {
        "command": req.command,
        "interval_seconds": max(req.interval_seconds, 10),
        "last_run": 0,
        "run_count": 0,
        "last_result": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    _ensure_cron_thread()
    return {"status": "created", "name": req.name}


@app.delete("/cron/{name}")
async def delete_cron_job(name: str):
    if name not in _cron_jobs:
        raise HTTPException(status_code=404, detail="Cron job not found")
    del _cron_jobs[name]
    return {"status": "deleted", "name": name}


# ═══════════════════════════════════════════════════════
#  Webhook Endpoint
# ═══════════════════════════════════════════════════════
_webhook_log: list[dict] = []


@app.post("/webhook")
async def receive_webhook(payload: WebhookPayload):
    entry = {
        "event": payload.event,
        "data": payload.data,
        "received_at": datetime.utcnow().isoformat(),
    }
    _webhook_log.append(entry)
    if len(_webhook_log) > 100:
        _webhook_log.pop(0)
    return {"status": "received", "entry": entry}


@app.get("/webhook/log")
async def get_webhook_log():
    return _webhook_log


# ═══════════════════════════════════════════════════════
#  Process Manager
# ═══════════════════════════════════════════════════════
@app.get("/processes")
async def list_processes():
    procs = []
    for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_info"]):
        try:
            info = p.info
            procs.append({
                "pid": info["pid"],
                "name": info["name"],
                "cpu_percent": info["cpu_percent"] or 0,
                "memory_mb": round((info["memory_info"].rss if info["memory_info"] else 0) / 1048576, 1),
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    procs.sort(key=lambda x: x["cpu_percent"], reverse=True)
    return procs[:100]


@app.post("/processes/kill")
async def kill_process(pid: int):
    try:
        p = psutil.Process(pid)
        p.terminate()
        return {"status": "terminated", "pid": pid, "name": p.name()}
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Access denied for PID {pid}")


# ═══════════════════════════════════════════════════════
#  Clipboard
# ═══════════════════════════════════════════════════════
@app.get("/clipboard")
async def get_clipboard():
    try:
        result = subprocess.run(
            ["powershell", "-Command", "Get-Clipboard"],
            capture_output=True, text=True, timeout=5,
        )
        return {"text": result.stdout.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clipboard")
async def set_clipboard(req: ClipboardRequest):
    try:
        subprocess.run(
            ["powershell", "-Command", f"Set-Clipboard -Value '{req.text}'"],
            capture_output=True, text=True, timeout=5,
        )
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Desktop Notifications (Windows)
# ═══════════════════════════════════════════════════════
@app.post("/notify")
async def send_notification(req: NotifyRequest):
    try:
        ps_script = f'''
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$textNodes = $template.GetElementsByTagName("text")
$textNodes.Item(0).AppendChild($template.CreateTextNode("{req.title}")) > $null
$textNodes.Item(1).AppendChild($template.CreateTextNode("{req.message}")) > $null
$toast = [Windows.UI.Notifications.ToastNotification]::new($template)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Pesto Steve AI").Show($toast)
'''
        subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True, timeout=10)
        return {"status": "sent"}
    except Exception as e:
        # Fallback: use msg command
        try:
            subprocess.run(["msg", "*", f"{req.title}: {req.message}"], capture_output=True, timeout=5)
            return {"status": "sent_fallback"}
        except Exception:
            raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Network Info
# ═══════════════════════════════════════════════════════
@app.get("/network")
async def get_network_info():
    import socket
    interfaces = []
    for name, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == socket.AF_INET:
                interfaces.append({"name": name, "ip": addr.address, "netmask": addr.netmask})
    stats = psutil.net_io_counters()
    return {
        "interfaces": interfaces,
        "hostname": socket.gethostname(),
        "bytes_sent": stats.bytes_sent,
        "bytes_recv": stats.bytes_recv,
    }


# ═══════════════════════════════════════════════════════
#  Discord Bot Integration
# ═══════════════════════════════════════════════════════
_discord_state: dict[str, Any] = {
    "enabled": False,
    "connected": False,
    "running": False,
    "username": None,
    "model": None,
    "error": None,
    "updated_at": None,
}
_discord_thread: Optional[threading.Thread] = None
_discord_stop = threading.Event()


@app.get("/discord/status")
async def discord_status():
    running = _discord_thread is not None and _discord_thread.is_alive()
    _discord_state["running"] = running
    return _discord_state


@app.post("/discord/connect")
async def discord_connect(req: DiscordConnectRequest):
    global _discord_thread
    if _discord_thread and _discord_thread.is_alive():
        return {**_discord_state, "status": "already_connected"}

    _discord_stop.clear()
    _discord_state.update({
        "enabled": True, "connected": True, "running": True,
        "model": req.model, "error": None,
        "updated_at": datetime.utcnow().isoformat(),
    })

    def _discord_loop():
        try:
            import discord as _dc
            intents = _dc.Intents.default()
            intents.message_content = True
            client = _dc.Client(intents=intents)

            @client.event
            async def on_ready():
                _discord_state["username"] = str(client.user)
                _discord_state["connected"] = True

            @client.event
            async def on_message(message):
                if message.author == client.user:
                    return
                if client.user.mentioned_in(message) or isinstance(message.channel, _dc.DMChannel):
                    import requests as _req
                    provider = req.provider or "lmstudio"
                    model = req.model or ""
                    content = message.content.replace(f"<@{client.user.id}>", "").strip()
                    try:
                        if provider == "lmstudio":
                            url = (req.lmstudio_url or LMSTUDIO_URL) + "/v1/chat/completions"
                            resp = _req.post(url, json={"messages": [{"role": "user", "content": content}], "stream": False}, timeout=120)
                            reply = resp.json()["choices"][0]["message"]["content"]
                        else:
                            resp = _req.post(f"{OLLAMA_URL}/api/chat", json={"model": model, "messages": [{"role": "user", "content": content}], "stream": False}, timeout=120)
                            reply = resp.json()["message"]["content"]
                        import asyncio
                        asyncio.run_coroutine_threadsafe(message.channel.send(reply[:2000]), client.loop)
                    except Exception as e:
                        asyncio.run_coroutine_threadsafe(message.channel.send(f"Error: {e}"), client.loop)

            client.run(req.token)
        except Exception as e:
            _discord_state.update({"error": str(e), "running": False, "connected": False})

    _discord_thread = threading.Thread(target=_discord_loop, daemon=True)
    _discord_thread.start()
    return _discord_state


@app.post("/discord/disconnect")
async def discord_disconnect():
    _discord_stop.set()
    _discord_state.update({"enabled": False, "connected": False, "running": False, "updated_at": datetime.utcnow().isoformat()})
    return _discord_state


# ═══════════════════════════════════════════════════════
#  Environment Variables
# ═══════════════════════════════════════════════════════

@app.get("/env")
async def get_env_vars():
    return [{"name": k, "value": v[:50] + "..." if len(v) > 50 else v} for k, v in sorted(os.environ.items())]


class EnvSetRequest(BaseModel):
    name: str
    value: str

@app.post("/env")
async def set_env_var(req: EnvSetRequest):
    os.environ[req.name] = req.value
    return {"status": "ok", "name": req.name}


@app.delete("/env/{name}")
async def delete_env_var(name: str):
    if name in os.environ:
        del os.environ[name]
        return {"status": "ok", "deleted": name}
    raise HTTPException(status_code=404, detail=f"Env var '{name}' not found")


# ═══════════════════════════════════════════════════════
#  HTTP Request Proxy
# ═══════════════════════════════════════════════════════

class HTTPRequestModel(BaseModel):
    method: str = "GET"
    url: str
    headers: dict | None = None
    body: str | None = None

@app.post("/http")
async def http_request(req: HTTPRequestModel):
    import requests as _req
    try:
        resp = _req.request(method=req.method.upper(), url=req.url, headers=req.headers or {}, data=req.body, timeout=30)
        try:
            body = resp.json()
        except Exception:
            body = resp.text[:5000]
        return {"status_code": resp.status_code, "headers": dict(resp.headers), "body": body}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Download File from URL
# ═══════════════════════════════════════════════════════

class DownloadRequest(BaseModel):
    url: str
    save_path: str

@app.post("/download")
async def download_file_endpoint(req: DownloadRequest):
    import requests as _req
    try:
        resp = _req.get(req.url, stream=True, timeout=60)
        resp.raise_for_status()
        p = Path(req.save_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        return {"status": "ok", "path": str(p), "size": p.stat().st_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Search Files by Content
# ═══════════════════════════════════════════════════════

class SearchRequest(BaseModel):
    pattern: str
    path: str = "."
    extensions: str | None = None
    max_results: int = 50

@app.post("/search")
async def search_files_endpoint(req: SearchRequest):
    results = []
    root = Path(req.path).resolve()
    exts = [e.strip() for e in req.extensions.split(",")] if req.extensions else None
    try:
        pat = re.compile(req.pattern, re.IGNORECASE)
    except re.error as e:
        raise HTTPException(status_code=400, detail=f"Invalid regex: {e}")
    for p in root.rglob("*"):
        if not p.is_file() or p.stat().st_size > 1_000_000:
            continue
        if exts and p.suffix not in exts:
            continue
        try:
            text = p.read_text(errors="ignore")
            for i, line in enumerate(text.splitlines(), 1):
                if pat.search(line):
                    results.append({"file": str(p), "line": i, "text": line.strip()[:200]})
                    if len(results) >= req.max_results:
                        return results
        except Exception:
            continue
    return results


# ═══════════════════════════════════════════════════════
#  Zip / Unzip
# ═══════════════════════════════════════════════════════

class ZipRequest(BaseModel):
    paths: list[str]
    output: str

@app.post("/zip")
async def zip_files_endpoint(req: ZipRequest):
    import zipfile
    try:
        with zipfile.ZipFile(req.output, "w", zipfile.ZIP_DEFLATED) as zf:
            for p in req.paths:
                pp = Path(p)
                if pp.is_file():
                    zf.write(pp, pp.name)
                elif pp.is_dir():
                    for f in pp.rglob("*"):
                        if f.is_file():
                            zf.write(f, f.relative_to(pp.parent))
        return {"status": "ok", "output": req.output, "size": Path(req.output).stat().st_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UnzipRequest(BaseModel):
    archive: str
    destination: str = "."

@app.post("/unzip")
async def unzip_file_endpoint(req: UnzipRequest):
    import zipfile
    try:
        with zipfile.ZipFile(req.archive, "r") as zf:
            zf.extractall(req.destination)
            names = zf.namelist()
        return {"status": "ok", "destination": req.destination, "files": names[:100]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  System Power
# ═══════════════════════════════════════════════════════

class PowerRequest(BaseModel):
    action: str

@app.post("/power")
async def system_power(req: PowerRequest):
    cmds = {
        "shutdown": "shutdown /s /t 5", "restart": "shutdown /r /t 5",
        "sleep": "rundll32.exe powrprof.dll,SetSuspendState 0,1,0",
        "lock": "rundll32.exe user32.dll,LockWorkStation", "logoff": "shutdown /l",
    }
    cmd = cmds.get(req.action)
    if not cmd:
        raise HTTPException(status_code=400, detail=f"Unknown action: {req.action}. Valid: {list(cmds.keys())}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
    return {"status": "ok", "action": req.action, "output": result.stdout or result.stderr}


# ═══════════════════════════════════════════════════════
#  App Launcher
# ═══════════════════════════════════════════════════════

class LaunchRequest(BaseModel):
    app: str
    args: str | None = None

@app.post("/launch")
async def launch_app(req: LaunchRequest):
    known_apps = {
        "notepad": "notepad.exe", "calculator": "calc.exe", "explorer": "explorer.exe",
        "cmd": "cmd.exe", "powershell": "powershell.exe", "paint": "mspaint.exe",
        "snip": "snippingtool.exe", "taskmgr": "taskmgr.exe", "control": "control.exe",
        "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "firefox": r"C:\Program Files\Mozilla Firefox\firefox.exe",
        "edge": r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "vscode": "code", "obs": r"C:\Program Files\obs-studio\bin\64bit\obs64.exe",
    }
    exe = known_apps.get(req.app.lower(), req.app)
    cmd_parts = [exe] + (req.args.split() if req.args else [])
    try:
        proc = subprocess.Popen(cmd_parts, shell=True)
        return {"status": "ok", "app": req.app, "pid": proc.pid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Text-to-Speech
# ═══════════════════════════════════════════════════════

class TTSRequest(BaseModel):
    text: str
    rate: int = 150

@app.post("/tts")
async def text_to_speech(req: TTSRequest):
    try:
        safe_text = req.text.replace('"', '`"').replace("'", "''")
        rate_val = max(-10, min(10, (req.rate - 150) // 30))
        ps_script = f'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate = {rate_val}; $s.Speak("{safe_text}")'
        subprocess.Popen(["powershell", "-Command", ps_script], shell=False)
        return {"status": "ok", "text": req.text[:100]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Disk Usage
# ═══════════════════════════════════════════════════════

@app.get("/disk")
async def disk_usage():
    result = []
    for p in psutil.disk_partitions():
        try:
            u = psutil.disk_usage(p.mountpoint)
            result.append({"device": p.device, "mountpoint": p.mountpoint, "fstype": p.fstype,
                           "total_gb": round(u.total / (1024**3), 2), "used_gb": round(u.used / (1024**3), 2),
                           "free_gb": round(u.free / (1024**3), 2), "percent": u.percent})
        except Exception:
            continue
    return result


# ═══════════════════════════════════════════════════════
#  Desktop Screenshot
# ═══════════════════════════════════════════════════════

@app.get("/screenshot")
async def desktop_screenshot():
    """Capture the primary monitor as a base64 PNG. Tries pyautogui/mss, falls back to PowerShell on Windows."""
    # Try pyautogui first (cross-platform, returns PIL image)
    try:
        import pyautogui as _pag  # type: ignore
        import io as _io
        img = _pag.screenshot()
        buf = _io.BytesIO()
        img.save(buf, format="PNG")
        return {"status": "ok", "image": _b64.b64encode(buf.getvalue()).decode(), "width": img.width, "height": img.height}
    except Exception:
        pass
    # Windows fallback
    if platform.system() == "Windows":
        try:
            ps = '''Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing
$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap($b.Width, $b.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
"$($b.Width)x$($b.Height)|$([Convert]::ToBase64String($ms.ToArray()))"'''
            result = subprocess.run(["powershell", "-Command", ps], capture_output=True, text=True, timeout=15)
            if result.returncode != 0:
                raise Exception(result.stderr)
            out = result.stdout.strip()
            if "|" in out:
                dims, b64 = out.split("|", 1)
                w, h = dims.split("x")
                return {"status": "ok", "image": b64, "width": int(w), "height": int(h)}
            return {"status": "ok", "image": out}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=500, detail="Install pyautogui (pip install pyautogui pillow) to enable screenshots")


# ═══════════════════════════════════════════════════════
#  Computer Use — vision-action loop primitives
# ═══════════════════════════════════════════════════════

class _CUAction(BaseModel):
    type: str
    x: Optional[int] = None
    y: Optional[int] = None
    text: Optional[str] = None
    key: Optional[str] = None
    keys: Optional[list[str]] = None
    amount: Optional[int] = None
    ms: Optional[int] = None


@app.post("/computer-use/act")
async def computer_use_act(action: _CUAction):
    """Execute a single low-level desktop action (click/type/hotkey/scroll/move/wait).

    Requires pyautogui on the host (`pip install pyautogui pillow`). On Linux you also need
    `python3-tk python3-dev scrot`. Refuses unknown action types.
    """
    try:
        import pyautogui as _pag  # type: ignore
    except Exception:
        raise HTTPException(status_code=500, detail="pyautogui not installed on agent host")
    _pag.FAILSAFE = True  # move mouse to a corner to abort
    t = (action.type or "").lower()
    try:
        if t == "click" and action.x is not None and action.y is not None:
            _pag.click(action.x, action.y)
        elif t == "double_click" and action.x is not None and action.y is not None:
            _pag.doubleClick(action.x, action.y)
        elif t == "right_click" and action.x is not None and action.y is not None:
            _pag.rightClick(action.x, action.y)
        elif t == "move" and action.x is not None and action.y is not None:
            _pag.moveTo(action.x, action.y, duration=0.15)
        elif t == "type" and action.text is not None:
            text = action.text
            # If a coordinate was supplied, click there first to focus the target field
            if action.x is not None and action.y is not None:
                _pag.click(action.x, action.y)
                time.sleep(0.15)
            # pyautogui.typewrite only supports ASCII printable chars — anything else is
            # silently skipped, which is why search bars often end up with partial/empty text.
            # For non-ASCII (accents, emoji, smart quotes, CJK, …) fall back to clipboard paste.
            is_ascii = all(32 <= ord(c) < 127 or c in "\n\t" for c in text)
            if is_ascii:
                _pag.typewrite(text, interval=0.02)
            else:
                pasted = False
                try:
                    import pyperclip  # type: ignore
                    prev = None
                    try: prev = pyperclip.paste()
                    except Exception: pass
                    pyperclip.copy(text)
                    time.sleep(0.05)
                    paste_combo = ("command", "v") if sys.platform == "darwin" else ("ctrl", "v")
                    _pag.hotkey(*paste_combo)
                    pasted = True
                    time.sleep(0.1)
                    if prev is not None:
                        try: pyperclip.copy(prev)
                        except Exception: pass
                except Exception:
                    pass
                if not pasted:
                    # Last-resort: type only the ASCII subset so the user sees *something*
                    safe = "".join(c for c in text if 32 <= ord(c) < 127 or c in "\n\t")
                    _pag.typewrite(safe, interval=0.02)
        elif t == "key" and action.key:
            _pag.press(action.key)
        elif t == "hotkey" and action.keys:
            _pag.hotkey(*action.keys)
        elif t == "scroll":
            if action.x is not None and action.y is not None:
                _pag.moveTo(action.x, action.y)
            _pag.scroll(int(action.amount or 0))
        elif t == "wait":
            time.sleep(min(5.0, (action.ms or 500) / 1000.0))
        elif t in ("done", "fail"):
            pass
        else:
            raise HTTPException(status_code=400, detail=f"Unknown or incomplete action: {t}")
        return {"status": "ok", "executed": t}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/computer-use/screen-size")
async def computer_use_screen_size():
    try:
        import pyautogui as _pag  # type: ignore
        w, h = _pag.size()
        return {"width": int(w), "height": int(h), "available": True}
    except Exception as e:
        return {"available": False, "error": str(e)}


# ═══════════════════════════════════════════════════════
#  Wi-Fi & Installed Programs
# ═══════════════════════════════════════════════════════

@app.get("/wifi")
async def list_wifi():
    try:
        result = subprocess.run(["netsh", "wlan", "show", "networks", "mode=bssid"], capture_output=True, text=True, timeout=15)
        return {"status": "ok", "output": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/installed")
async def list_installed():
    try:
        import json as _json
        result = subprocess.run(
            ['powershell', '-Command',
             'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | '
             'Select-Object DisplayName, DisplayVersion, Publisher | '
             'Where-Object { $_.DisplayName } | Sort-Object DisplayName | ConvertTo-Json -Compress'],
            capture_output=True, text=True, timeout=30)
        progs = _json.loads(result.stdout) if result.stdout.strip() else []
        return progs if isinstance(progs, list) else [progs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
#  Hermes-style Memory & Learning (v2: embeddings + dedup)
#  Episodes (action log) + Lessons (corrections from mistakes)
# ═══════════════════════════════════════════════════════
import json as _mem_json
import math as _mem_math

MEMORY_DIR = Path.home() / ".pesto-ai" / "memory"
MEMORY_DIR.mkdir(parents=True, exist_ok=True)
EPISODES_FILE = MEMORY_DIR / "episodes.jsonl"
LESSONS_FILE = MEMORY_DIR / "lessons.md"       # legacy markdown (still served on GET)
LESSONS_JSONL = MEMORY_DIR / "lessons.jsonl"   # structured store with hits/embeddings
_mem_lock = threading.Lock()
MAX_EPISODES = 5000  # rolling cap
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")
LESSON_DEDUP_THRESHOLD = 0.85   # cosine similarity above this = same lesson
LESSON_PROMOTE_HITS = 5         # lessons with this many hits get [CORE] prefix


def _embed(text: str) -> Optional[list[float]]:
    """Return embedding vector from local Ollama, or None on failure."""
    if not text or not text.strip():
        return None
    try:
        r = _requests.post(
            f"{OLLAMA_URL}/api/embeddings",
            json={"model": EMBED_MODEL, "prompt": text[:4000]},
            timeout=8,
        )
        if r.status_code != 200:
            return None
        v = r.json().get("embedding")
        if isinstance(v, list) and len(v) > 0:
            return [float(x) for x in v]
    except Exception:
        return None
    return None


def _cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = 0.0
    na = 0.0
    nb = 0.0
    for x, y in zip(a, b):
        dot += x * y
        na += x * x
        nb += y * y
    if na == 0.0 or nb == 0.0:
        return 0.0
    return dot / (_mem_math.sqrt(na) * _mem_math.sqrt(nb))


class EpisodeRequest(BaseModel):
    request: str = ""
    tag: str = ""
    tool: str = ""
    outcome: str = "success"  # success | error | denied | blocked
    summary: str = ""


class LessonRequest(BaseModel):
    text: str
    source_tag: str = ""
    source_error: str = ""


def _read_episodes(limit: int = 0) -> list[dict]:
    if not EPISODES_FILE.exists():
        return []
    out: list[dict] = []
    with _mem_lock:
        with EPISODES_FILE.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    out.append(_mem_json.loads(line))
                except Exception:
                    continue
    if limit > 0:
        out = out[-limit:]
    return out


def _write_episode(ep: dict) -> None:
    with _mem_lock:
        existing = []
        if EPISODES_FILE.exists():
            with EPISODES_FILE.open("r", encoding="utf-8") as f:
                existing = [l for l in f if l.strip()]
        existing.append(_mem_json.dumps(ep) + "\n")
        if len(existing) > MAX_EPISODES:
            existing = existing[-MAX_EPISODES:]
        EPISODES_FILE.write_text("".join(existing), encoding="utf-8")


def _read_lessons_jsonl() -> list[dict]:
    if not LESSONS_JSONL.exists():
        return []
    out: list[dict] = []
    with LESSONS_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(_mem_json.loads(line))
            except Exception:
                continue
    return out


def _write_lessons_jsonl(items: list[dict]) -> None:
    LESSONS_JSONL.write_text("".join(_mem_json.dumps(i) + "\n" for i in items), encoding="utf-8")


def _render_lessons_md(items: list[dict]) -> str:
    if not items:
        return ""
    # sort by hits desc, then recency
    sorted_items = sorted(items, key=lambda i: (i.get("hits", 1), i.get("last_hit", i.get("ts", ""))), reverse=True)
    core = [i for i in sorted_items if i.get("hits", 1) >= LESSON_PROMOTE_HITS]
    rest = [i for i in sorted_items if i.get("hits", 1) < LESSON_PROMOTE_HITS]
    parts: list[str] = ["# Lessons Learned\n"]
    if core:
        parts.append("\n## [CORE] High-confidence rules (≥5 hits)\n")
        for it in core:
            parts.append(f"- **(×{it.get('hits',1)})** {it['text']}")
    if rest:
        parts.append("\n## Recent lessons\n")
        for it in rest:
            tag = f"`{it['source_tag']}` — " if it.get("source_tag") else ""
            parts.append(f"- {tag}{it['text']}")
    return "\n".join(parts) + "\n"


@app.get("/memory/episodes")
async def get_episodes(limit: int = 200):
    eps = _read_episodes(limit)
    # strip embeddings from response — keeps payload small
    return {"episodes": [{k: v for k, v in e.items() if k != "emb"} for e in eps]}


@app.post("/memory/episodes")
async def add_episode(req: EpisodeRequest):
    ep: dict[str, Any] = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "request": req.request[:500],
        "tag": req.tag[:300],
        "tool": req.tool,
        "outcome": req.outcome,
        "summary": req.summary[:1000],
    }
    emb = _embed(f"{req.request} {req.tag} {req.summary}")
    if emb is not None:
        ep["emb"] = emb
    _write_episode(ep)
    return {"status": "ok"}


@app.delete("/memory/episodes")
async def clear_episodes():
    with _mem_lock:
        if EPISODES_FILE.exists():
            EPISODES_FILE.unlink()
    return {"status": "ok"}


@app.get("/memory/episodes/search")
async def search_episodes(q: str, limit: int = 5):
    eps = _read_episodes(0)
    if not eps:
        return {"matches": []}
    # Try embedding-based first
    qemb = _embed(q)
    if qemb is not None:
        scored = []
        for ep in eps:
            v = ep.get("emb")
            if isinstance(v, list):
                s = _cosine(qemb, v)
                if s > 0.35:  # noise floor
                    scored.append((s, ep))
        if scored:
            scored.sort(key=lambda x: x[0], reverse=True)
            return {"matches": [{k: v for k, v in ep.items() if k != "emb"} for _, ep in scored[:limit]]}
    # Fallback: keyword overlap
    terms = [t.lower() for t in re.findall(r"\w+", q) if len(t) > 2]
    if not terms:
        return {"matches": []}
    scored2: list[tuple[int, dict]] = []
    for ep in eps:
        hay = f"{ep.get('request','')} {ep.get('tag','')} {ep.get('summary','')}".lower()
        score = sum(hay.count(t) for t in terms)
        if score > 0:
            scored2.append((score, ep))
    scored2.sort(key=lambda x: x[0], reverse=True)
    return {"matches": [{k: v for k, v in ep.items() if k != "emb"} for _, ep in scored2[:limit]]}


@app.get("/memory/episodes/recent")
async def recent_episodes_for_tool(tool: str, limit: int = 3):
    """Last N episodes that fired a specific tool — used for per-tool memory injection."""
    eps = _read_episodes(0)
    matches = [ep for ep in eps if ep.get("tool", "").lower() == tool.lower()]
    matches = matches[-limit:][::-1]
    return {"matches": [{k: v for k, v in ep.items() if k != "emb"} for ep in matches]}


@app.get("/memory/lessons")
async def get_lessons():
    items = _read_lessons_jsonl()
    if items:
        return {"content": _render_lessons_md(items)}
    # Backward compat: serve legacy markdown if no structured store yet
    if LESSONS_FILE.exists():
        return {"content": LESSONS_FILE.read_text(encoding="utf-8")}
    return {"content": ""}


@app.post("/memory/lessons")
async def add_lesson(req: LessonRequest):
    """Dedup via cosine sim; if similar lesson exists, just bump its hits counter."""
    text = req.text.strip()
    if not text:
        return {"status": "ok", "deduped": False}
    with _mem_lock:
        items = _read_lessons_jsonl()
        emb = _embed(text)
        ts = datetime.utcnow().isoformat() + "Z"
        if emb is not None:
            for it in items:
                v = it.get("emb")
                if isinstance(v, list) and _cosine(emb, v) >= LESSON_DEDUP_THRESHOLD:
                    it["hits"] = int(it.get("hits", 1)) + 1
                    it["last_hit"] = ts
                    _write_lessons_jsonl(items)
                    # mirror to legacy md for UI
                    LESSONS_FILE.write_text(_render_lessons_md(items), encoding="utf-8")
                    return {"status": "ok", "deduped": True, "hits": it["hits"]}
        new_item: dict[str, Any] = {
            "ts": ts,
            "last_hit": ts,
            "text": text,
            "source_tag": req.source_tag,
            "source_error": req.source_error[:200],
            "hits": 1,
        }
        if emb is not None:
            new_item["emb"] = emb
        items.append(new_item)
        _write_lessons_jsonl(items)
        LESSONS_FILE.write_text(_render_lessons_md(items), encoding="utf-8")
    return {"status": "ok", "deduped": False, "hits": 1}


class LessonsOverwrite(BaseModel):
    content: str


@app.put("/memory/lessons")
async def overwrite_lessons(req: LessonsOverwrite):
    """Free-form markdown overwrite — drops structured store (user is taking manual control)."""
    with _mem_lock:
        LESSONS_FILE.write_text(req.content, encoding="utf-8")
        if LESSONS_JSONL.exists():
            LESSONS_JSONL.unlink()
    return {"status": "ok"}


@app.delete("/memory/lessons")
async def clear_lessons():
    with _mem_lock:
        for f in (LESSONS_FILE, LESSONS_JSONL):
            if f.exists():
                f.unlink()
    return {"status": "ok"}


# ─── User profile (auto-grown "about you") ──────────────────────────
PROFILE_FILE = MEMORY_DIR / "profile.md"


class ProfileOverwrite(BaseModel):
    content: str


@app.get("/memory/profile")
async def get_profile():
    with _mem_lock:
        if PROFILE_FILE.exists():
            return {"content": PROFILE_FILE.read_text(encoding="utf-8")}
    return {"content": ""}


@app.put("/memory/profile")
async def overwrite_profile(req: ProfileOverwrite):
    with _mem_lock:
        PROFILE_FILE.write_text(req.content, encoding="utf-8")
    return {"status": "ok"}


@app.delete("/memory/profile")
async def clear_profile():
    with _mem_lock:
        if PROFILE_FILE.exists():
            PROFILE_FILE.unlink()
    return {"status": "ok"}


# ═══════════════════════════════════════════════════════
#  Built-in LLM Runtime (llama.cpp via llama-cpp-python)
#  Acts as an Ollama-replacement: load GGUF, chat via SSE.
# ═══════════════════════════════════════════════════════
import json as _llm_json
from fastapi.responses import StreamingResponse

MODELS_DIR = Path.home() / ".pesto-ai" / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

class _LLMRuntime:
    def __init__(self):
        self.llm = None
        self.name: Optional[str] = None
        self.n_ctx: int = 4096
        self.n_gpu_layers: int = 0
        self.lock = threading.Lock()

    def is_available(self) -> bool:
        try:
            import llama_cpp  # noqa: F401
            return True
        except Exception:
            return False

    def load(self, name: str, n_ctx: int = 4096, n_gpu_layers: int = 0,
             n_threads: Optional[int] = None, n_batch: int = 512,
             flash_attn: bool = False, use_mmap: bool = True, use_mlock: bool = False):
        if not self.is_available():
            raise HTTPException(status_code=400, detail="llama-cpp-python not installed. Run: pip install llama-cpp-python")
        path = MODELS_DIR / name
        if not path.exists():
            raise HTTPException(status_code=404, detail=f"Model not found: {name}")
        from llama_cpp import Llama
        # Default threads = physical cores (SMT/HT generally hurts llama.cpp throughput)
        if n_threads is None or n_threads <= 0:
            n_threads = psutil.cpu_count(logical=False) or psutil.cpu_count(logical=True) or 4
        kwargs = dict(
            model_path=str(path),
            n_ctx=n_ctx,
            n_gpu_layers=n_gpu_layers,
            n_threads=n_threads,
            n_batch=n_batch,
            use_mmap=use_mmap,
            use_mlock=use_mlock,
            verbose=False,
        )
        # flash_attn isn't supported on every llama-cpp-python build — try, then retry without on failure
        with self.lock:
            self.unload()
            try:
                if flash_attn:
                    self.llm = Llama(flash_attn=True, **kwargs)
                else:
                    self.llm = Llama(**kwargs)
            except TypeError:
                # Older llama-cpp-python without one of these kwargs
                self.llm = Llama(**kwargs)
            self.name = name
            self.n_ctx = n_ctx
            self.n_gpu_layers = n_gpu_layers

    def unload(self):
        if self.llm is not None:
            try:
                del self.llm
            except Exception:
                pass
        self.llm = None
        self.name = None


_LLM = _LLMRuntime()


@app.get("/llm/status")
async def llm_status():
    return {
        "available": _LLM.is_available(),
        "loaded": _LLM.name,
        "n_ctx": _LLM.n_ctx,
        "n_gpu_layers": _LLM.n_gpu_layers,
        "models_dir": str(MODELS_DIR),
    }


@app.get("/llm/models")
async def llm_models():
    models = []
    for p in sorted(MODELS_DIR.glob("*.gguf")):
        try:
            models.append({
                "name": p.name,
                "size": p.stat().st_size,
                "loaded": p.name == _LLM.name,
            })
        except Exception:
            pass
    return {"models": models, "available": _LLM.is_available(), "loaded": _LLM.name}


class LLMPullReq(BaseModel):
    url: str
    filename: Optional[str] = None


@app.post("/llm/pull")
async def llm_pull(req: LLMPullReq):
    import requests as _rq
    fname = req.filename or req.url.rstrip("/").split("/")[-1].split("?")[0]
    if not fname.endswith(".gguf"):
        fname += ".gguf"
    dest = MODELS_DIR / fname

    def _gen():
        try:
            with _rq.get(req.url, stream=True, timeout=60) as r:
                r.raise_for_status()
                total = int(r.headers.get("content-length", 0))
                done = 0
                tmp = dest.with_suffix(dest.suffix + ".part")
                with open(tmp, "wb") as f:
                    last = 0
                    for chunk in r.iter_content(chunk_size=1024 * 256):
                        if not chunk:
                            continue
                        f.write(chunk)
                        done += len(chunk)
                        now = time.time()
                        if now - last > 0.3:
                            last = now
                            yield f"data: {_llm_json.dumps({'status':'downloading','filename':fname,'completed':done,'total':total})}\n\n"
                tmp.rename(dest)
            yield f"data: {_llm_json.dumps({'status':'done','filename':fname,'total':done})}\n\n"
        except Exception as e:
            yield f"data: {_llm_json.dumps({'status':'error','error':str(e)})}\n\n"

    return StreamingResponse(_gen(), media_type="text/event-stream")


@app.delete("/llm/models/{name}")
async def llm_delete(name: str):
    path = MODELS_DIR / name
    if not path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    if _LLM.name == name:
        _LLM.unload()
    # If it's a symlink, only unlink the link (keep original file)
    path.unlink()
    return {"status": "ok"}


# ───────── Import GGUFs from Ollama / LM Studio ─────────
def _ollama_search_dirs() -> list[Path]:
    home = Path.home()
    candidates = [
        home / ".ollama" / "models",                                   # Linux/macOS default
        Path(os.environ.get("OLLAMA_MODELS", "")) if os.environ.get("OLLAMA_MODELS") else None,
        home / "AppData" / "Local" / "Ollama" / "models",              # Windows (older)
        Path(os.environ.get("LOCALAPPDATA", "")) / "Ollama" / "models" if os.environ.get("LOCALAPPDATA") else None,
        Path("/usr/share/ollama/.ollama/models"),                      # Linux service install
    ]
    return [c for c in candidates if c and c.exists()]


def _lmstudio_search_dirs() -> list[Path]:
    home = Path.home()
    candidates = [
        home / ".cache" / "lm-studio" / "models",      # Linux
        home / ".lmstudio" / "models",                 # newer LM Studio
        home / "Library" / "Caches" / "lm-studio" / "models",  # macOS
        home / "AppData" / "Roaming" / "LMStudio" / "models",  # Windows (older)
        home / ".cache" / "LMStudio" / "models",
    ]
    return [c for c in candidates if c.exists()]


def _scan_ggufs(root: Path, source: str) -> list[dict]:
    found: list[dict] = []
    try:
        for p in root.rglob("*.gguf"):
            try:
                # Friendly display name: parent folder + filename for context
                rel = p.relative_to(root)
                parts = rel.parts
                display = parts[-1] if len(parts) == 1 else f"{parts[-2]}/{parts[-1]}"
                found.append({
                    "source": source,
                    "path": str(p),
                    "name": p.name,
                    "display": display,
                    "size": p.stat().st_size,
                })
            except Exception:
                continue
    except Exception:
        pass
    return found


@app.get("/llm/scan-external")
async def llm_scan_external():
    """Find GGUF files installed by Ollama or LM Studio so we can import them."""
    results: list[dict] = []
    searched: list[str] = []
    for d in _ollama_search_dirs():
        searched.append(str(d))
        results.extend(_scan_ggufs(d, "ollama"))
    for d in _lmstudio_search_dirs():
        searched.append(str(d))
        results.extend(_scan_ggufs(d, "lmstudio"))
    # Note: Ollama stores models as content-addressed blobs (sha256-...) without .gguf extension.
    # If nothing found in ollama dirs, scan blobs/ for likely-gguf files (>50MB, GGUF magic).
    if not any(r["source"] == "ollama" for r in results):
        for d in _ollama_search_dirs():
            blobs = d / "blobs"
            if not blobs.exists():
                continue
            for p in blobs.iterdir():
                try:
                    if not p.is_file() or p.stat().st_size < 50 * 1024 * 1024:
                        continue
                    with open(p, "rb") as f:
                        magic = f.read(4)
                    if magic == b"GGUF":
                        results.append({
                            "source": "ollama",
                            "path": str(p),
                            "name": p.name + ".gguf",
                            "display": f"blobs/{p.name[:16]}…",
                            "size": p.stat().st_size,
                        })
                except Exception:
                    continue
    # Mark already-imported (same path or same filename in MODELS_DIR)
    existing_targets = {p.resolve() for p in MODELS_DIR.glob("*.gguf")}
    existing_names = {p.name for p in MODELS_DIR.glob("*.gguf")}
    for r in results:
        try:
            src = Path(r["path"]).resolve()
            r["imported"] = src in existing_targets or r["name"] in existing_names
        except Exception:
            r["imported"] = False
    return {"models": results, "searched_dirs": searched}


class LLMImportReq(BaseModel):
    path: str
    name: Optional[str] = None
    mode: str = "symlink"  # "symlink" or "copy"


@app.post("/llm/import")
async def llm_import(req: LLMImportReq):
    src = Path(req.path)
    if not src.exists() or not src.is_file():
        raise HTTPException(status_code=404, detail=f"Source file not found: {req.path}")
    fname = req.name or src.name
    if not fname.endswith(".gguf"):
        fname += ".gguf"
    # Sanitize: no path separators
    fname = Path(fname).name
    dest = MODELS_DIR / fname
    if dest.exists():
        raise HTTPException(status_code=409, detail=f"Already exists: {fname}")
    try:
        if req.mode == "copy":
            shutil.copy2(src, dest)
        else:
            try:
                os.symlink(src, dest)
            except (OSError, NotImplementedError) as e:
                # Windows without dev-mode/admin can't symlink — fall back to copy
                shutil.copy2(src, dest)
                return {"status": "ok", "name": fname, "mode": "copy", "fallback_reason": str(e)}
        return {"status": "ok", "name": fname, "mode": req.mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class LLMLoadReq(BaseModel):
    name: str
    n_ctx: int = 4096
    n_gpu_layers: int = 0
    n_threads: Optional[int] = None
    n_batch: int = 512
    flash_attn: bool = False
    use_mmap: bool = True
    use_mlock: bool = False


@app.post("/llm/load")
async def llm_load(req: LLMLoadReq):
    _LLM.load(
        req.name, req.n_ctx, req.n_gpu_layers,
        n_threads=req.n_threads, n_batch=req.n_batch,
        flash_attn=req.flash_attn, use_mmap=req.use_mmap, use_mlock=req.use_mlock,
    )
    return {"status": "ok", "loaded": _LLM.name}


@app.post("/llm/unload")
async def llm_unload():
    _LLM.unload()
    return {"status": "ok"}


class LLMChatMsg(BaseModel):
    role: str
    content: str


class LLMChatReq(BaseModel):
    messages: list[LLMChatMsg]
    model: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2048
    stream: bool = True


@app.post("/llm/chat")
async def llm_chat(req: LLMChatReq):
    if not _LLM.is_available():
        raise HTTPException(status_code=400, detail="llama-cpp-python not installed. Run: pip install llama-cpp-python")
    # Auto-load if model name given and not loaded
    if req.model and req.model != _LLM.name:
        _LLM.load(req.model, _LLM.n_ctx or 4096, _LLM.n_gpu_layers or 0)
    if _LLM.llm is None:
        raise HTTPException(status_code=400, detail="No model loaded. POST /llm/load first.")

    msgs = [{"role": m.role, "content": m.content} for m in req.messages]

    def _gen():
        try:
            with _LLM.lock:
                stream = _LLM.llm.create_chat_completion(
                    messages=msgs,
                    temperature=req.temperature,
                    max_tokens=req.max_tokens,
                    stream=True,
                )
                for chunk in stream:
                    # Re-emit OpenAI-style delta SSE so frontend parser works unchanged.
                    yield f"data: {_llm_json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            err = {"error": str(e)}
            yield f"data: {_llm_json.dumps(err)}\n\n"

    return StreamingResponse(_gen(), media_type="text/event-stream")


# ═══════════════════════════════════════════════════════
#  Network Scanner (stdlib only)
# ═══════════════════════════════════════════════════════
import socket as _net_socket
import ipaddress as _ipaddr
import concurrent.futures as _net_cf
import uuid as _net_uuid

_NETWORK_SCANS: dict[str, dict] = {}
_NETWORK_LOCK = threading.Lock()
_NETWORK_CACHE = Path("network_scan.json")

# Tiny embedded OUI prefix → vendor map (top vendors).
_OUI_VENDORS = {
    "001a11":"Google","3c5ab4":"Google","f4f5e8":"Google","a4c361":"Google",
    "f0d5bf":"Apple","a4c4ca":"Apple","04d3cf":"Apple","b827eb":"Raspberry Pi",
    "dca632":"Raspberry Pi","e45f01":"Raspberry Pi","2ccf67":"Raspberry Pi",
    "001b63":"Apple","5c0a5b":"Samsung","002454":"Samsung","8030dc":"Samsung",
    "a020a6":"TP-Link","9c5322":"TP-Link","50c7bf":"TP-Link","f48cba":"TP-Link",
    "001cdf":"Belkin","ec1a59":"Belkin","94103e":"Belkin",
    "6c7039":"Sonos","b8e937":"Sonos","000e58":"Sonos",
    "001e8c":"Asus","2c56dc":"Asus","30852b":"Asus","60a44c":"Asus",
    "002522":"Microsoft","7c1e52":"Microsoft","485d60":"Microsoft","9c2a83":"Microsoft",
    "0017c5":"Linksys","002354":"Linksys","48f8b3":"Linksys",
    "001cb3":"Apple","ac3c0b":"Apple","04f7e4":"Apple","f0dbf8":"Apple",
    "001f5b":"Apple","0023df":"Apple","68a86d":"Apple","7c6df8":"Apple",
    "fcfbfb":"Cisco","c4641f":"Cisco","ec44763":"Cisco","000142":"Cisco",
    "002608":"Apple","001ec2":"Apple","001124":"Apple","003065":"Apple",
    "78d294":"Hewlett Packard","a0481c":"Hewlett Packard","00306e":"HP",
    "001b21":"Intel","001f3c":"Intel","00216a":"Intel","001e67":"Intel",
    "001cb0":"Apple","9027e4":"Apple","9803a3":"Apple","f8e94e":"Roku",
    "b827eb":"Raspberry Pi","dca632":"Raspberry Pi","000c29":"VMware","000569":"VMware",
    "fcecda":"Ubiquiti","b4fbe4":"Ubiquiti","244bfe":"Ubiquiti","802aa8":"Ubiquiti",
    "0024e8":"Dell","78e7d1":"Dell","f8db88":"Dell","b083fe":"Dell",
    "5c5187":"Dell","18036f":"Dell","ec308b":"Dell",
    "0018f3":"Asus","9c5c8e":"ASRock","002b67":"Sony","00041f":"Sony",
    "ac220b":"Asus","b06ebf":"Dell","60d819":"Apple","48a91c":"Apple",
    "ecadb8":"Apple","8c8590":"Apple","b8782e":"Apple","f0c1f1":"Apple",
    "a4b805":"Apple","60f81d":"Apple","a8667f":"Apple","6c4008":"Apple",
    "001e64":"Apple","002608":"Apple","580e7b":"Liteon","78a3e4":"Apple",
    "9c20cb":"Apple","c0d012":"Apple","045453":"Apple","04489a":"Apple",
}

def _vendor_lookup(mac: str) -> str:
    if not mac: return ""
    prefix = mac.lower().replace(":", "").replace("-", "")[:6]
    return _OUI_VENDORS.get(prefix, "")

def _read_arp_table() -> dict[str, str]:
    """Returns {ip: mac}."""
    out: dict[str, str] = {}
    try:
        cmd = ["arp", "-a"] if os.name != "nt" else ["arp", "-a"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        for line in result.stdout.splitlines():
            # Match IPv4 + MAC (handles both windows and posix arp -a output)
            m = re.search(r"(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2})", line)
            if m:
                out[m.group(1)] = m.group(2).replace("-", ":").lower()
    except Exception:
        pass
    return out

def _local_subnet() -> Optional[str]:
    """Best-effort: return CIDR like '192.168.1.0/24'."""
    try:
        s = _net_socket.socket(_net_socket.AF_INET, _net_socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        net = ".".join(ip.split(".")[:3]) + ".0/24"
        return net
    except Exception:
        return None

def _probe_host(ip: str) -> bool:
    """Try common ports — fast TCP connect to detect alive hosts."""
    for port in (80, 443, 22, 445, 139, 8080, 53, 8009, 8443):
        try:
            with _net_socket.socket(_net_socket.AF_INET, _net_socket.SOCK_STREAM) as s:
                s.settimeout(0.4)
                if s.connect_ex((ip, port)) == 0:
                    return True
        except Exception:
            pass
    return False

def _reverse_dns(ip: str) -> str:
    try:
        return _net_socket.gethostbyaddr(ip)[0]
    except Exception:
        return ""

def _do_network_scan(scan_id: str):
    state = _NETWORK_SCANS[scan_id]
    state["status"] = "running"
    try:
        cidr = _local_subnet()
        if not cidr:
            state["status"] = "error"; state["error"] = "Could not detect local subnet"
            return
        net = _ipaddr.ip_network(cidr, strict=False)
        ips = [str(h) for h in net.hosts()]
        # Step 1: trigger ARP cache by parallel TCP probe
        with _net_cf.ThreadPoolExecutor(max_workers=64) as ex:
            list(ex.map(_probe_host, ips))
        # Step 2: read arp table
        arp = _read_arp_table()
        # Step 3: build device list (anything with a MAC entry)
        devices = []
        for ip in ips:
            mac = arp.get(ip, "")
            if not mac and not _probe_host(ip):
                continue
            devices.append({
                "ip": ip,
                "mac": mac,
                "hostname": _reverse_dns(ip),
                "vendor": _vendor_lookup(mac),
                "last_seen": datetime.now().isoformat(timespec="seconds"),
            })
        state["devices"] = devices
        state["status"] = "done"
        state["finished_at"] = datetime.now().isoformat(timespec="seconds")
        try:
            _NETWORK_CACHE.write_text(json.dumps({"devices": devices, "finished_at": state["finished_at"]}))
        except Exception:
            pass
    except Exception as e:
        state["status"] = "error"; state["error"] = str(e)


@app.post("/network/scan")
def network_scan_start():
    scan_id = _net_uuid.uuid4().hex[:12]
    _NETWORK_SCANS[scan_id] = {
        "status": "running", "devices": [], "started_at": datetime.now().isoformat(timespec="seconds"),
        "finished_at": None, "error": None,
    }
    threading.Thread(target=_do_network_scan, args=(scan_id,), daemon=True).start()
    return {"scan_id": scan_id}


@app.get("/network/scan/{scan_id}")
def network_scan_status(scan_id: str):
    s = _NETWORK_SCANS.get(scan_id)
    if not s:
        raise HTTPException(status_code=404, detail="scan not found")
    return s


@app.get("/network/devices")
def network_devices():
    if _NETWORK_CACHE.exists():
        try:
            return json.loads(_NETWORK_CACHE.read_text())
        except Exception:
            pass
    return {"devices": [], "finished_at": None}


# ═══════════════════════════════════════════════════════
#  MQTT Bridge (paho-mqtt)
# ═══════════════════════════════════════════════════════
_MQTT_CONFIG_FILE = Path("mqtt_config.json")
_MQTT_STATE = {
    "client": None,
    "connected": False,
    "last_error": None,
    "messages": [],   # ring buffer of {topic, payload, ts, qos, retain}
    "lock": threading.Lock(),
}
_MQTT_BUFFER_MAX = 500


def _mqtt_load_config() -> dict:
    if _MQTT_CONFIG_FILE.exists():
        try:
            return json.loads(_MQTT_CONFIG_FILE.read_text())
        except Exception:
            pass
    return {"host": "", "port": 1883, "username": "", "password": "", "enabled": False, "subscriptions": []}


def _mqtt_save_config(cfg: dict):
    _MQTT_CONFIG_FILE.write_text(json.dumps(cfg, indent=2))


def _mqtt_on_connect(client, userdata, flags, rc, *_):
    if rc == 0:
        _MQTT_STATE["connected"] = True
        _MQTT_STATE["last_error"] = None
        cfg = _mqtt_load_config()
        for topic in cfg.get("subscriptions", []):
            try: client.subscribe(topic)
            except Exception: pass
    else:
        _MQTT_STATE["connected"] = False
        _MQTT_STATE["last_error"] = f"connect rc={rc}"


def _mqtt_on_disconnect(client, userdata, rc, *_):
    _MQTT_STATE["connected"] = False


def _mqtt_on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8", errors="replace")
    except Exception:
        payload = "<binary>"
    entry = {"topic": msg.topic, "payload": payload, "ts": time.time(), "qos": msg.qos, "retain": msg.retain}
    with _MQTT_STATE["lock"]:
        _MQTT_STATE["messages"].append(entry)
        if len(_MQTT_STATE["messages"]) > _MQTT_BUFFER_MAX:
            _MQTT_STATE["messages"] = _MQTT_STATE["messages"][-_MQTT_BUFFER_MAX:]


def _mqtt_connect_now() -> dict:
    try:
        import paho.mqtt.client as mqtt_lib
    except ImportError:
        raise HTTPException(status_code=500, detail="paho-mqtt not installed. Run: pip install paho-mqtt")
    cfg = _mqtt_load_config()
    if not cfg.get("host"):
        raise HTTPException(status_code=400, detail="No MQTT host configured")
    # Disconnect existing
    old = _MQTT_STATE.get("client")
    if old:
        try: old.disconnect(); old.loop_stop()
        except Exception: pass
    try:
        client = mqtt_lib.Client(mqtt_lib.CallbackAPIVersion.VERSION2)
    except AttributeError:
        client = mqtt_lib.Client()
    if cfg.get("username"):
        client.username_pw_set(cfg["username"], cfg.get("password", ""))
    client.on_connect = _mqtt_on_connect
    client.on_disconnect = _mqtt_on_disconnect
    client.on_message = _mqtt_on_message
    client.connect_async(cfg["host"], int(cfg.get("port", 1883)), keepalive=60)
    client.loop_start()
    _MQTT_STATE["client"] = client
    return _mqtt_status_dict()


def _mqtt_status_dict() -> dict:
    cfg = _mqtt_load_config()
    return {
        "connected": _MQTT_STATE["connected"],
        "enabled": cfg.get("enabled", False),
        "last_error": _MQTT_STATE["last_error"],
        "subscriptions": cfg.get("subscriptions", []),
        "host": cfg.get("host", ""),
        "port": cfg.get("port", 1883),
    }


@app.get("/mqtt/config")
def mqtt_get_config():
    return _mqtt_load_config()


@app.post("/mqtt/config")
def mqtt_set_config(cfg: dict):
    current = _mqtt_load_config()
    current.update({k: v for k, v in cfg.items() if k in ("host", "port", "username", "password", "enabled", "subscriptions")})
    _mqtt_save_config(current)
    return current


@app.get("/mqtt/status")
def mqtt_status():
    return _mqtt_status_dict()


@app.post("/mqtt/connect")
def mqtt_connect():
    return _mqtt_connect_now()


@app.post("/mqtt/disconnect")
def mqtt_disconnect():
    client = _MQTT_STATE.get("client")
    if client:
        try: client.disconnect(); client.loop_stop()
        except Exception: pass
    _MQTT_STATE["client"] = None
    _MQTT_STATE["connected"] = False
    return _mqtt_status_dict()


@app.post("/mqtt/publish")
def mqtt_publish(req: dict):
    client = _MQTT_STATE.get("client")
    if not client or not _MQTT_STATE["connected"]:
        raise HTTPException(status_code=400, detail="MQTT not connected")
    topic = req.get("topic"); payload = req.get("payload", "")
    retain = bool(req.get("retain", False)); qos = int(req.get("qos", 0))
    if not topic: raise HTTPException(status_code=400, detail="topic required")
    info = client.publish(topic, payload, qos=qos, retain=retain)
    return {"status": "ok", "mid": getattr(info, "mid", None)}


@app.post("/mqtt/subscribe")
def mqtt_subscribe(req: dict):
    topic = (req.get("topic") or "").strip()
    if not topic: raise HTTPException(status_code=400, detail="topic required")
    cfg = _mqtt_load_config()
    subs = cfg.get("subscriptions", [])
    if topic not in subs: subs.append(topic)
    cfg["subscriptions"] = subs
    _mqtt_save_config(cfg)
    client = _MQTT_STATE.get("client")
    if client and _MQTT_STATE["connected"]:
        try: client.subscribe(topic)
        except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    return {"status": "ok", "subscriptions": subs}


@app.delete("/mqtt/subscribe")
def mqtt_unsubscribe(req: dict):
    topic = (req.get("topic") or "").strip()
    cfg = _mqtt_load_config()
    cfg["subscriptions"] = [t for t in cfg.get("subscriptions", []) if t != topic]
    _mqtt_save_config(cfg)
    client = _MQTT_STATE.get("client")
    if client and _MQTT_STATE["connected"]:
        try: client.unsubscribe(topic)
        except Exception: pass
    return {"status": "ok", "subscriptions": cfg["subscriptions"]}


@app.get("/mqtt/messages")
def mqtt_messages(since: float = 0):
    with _MQTT_STATE["lock"]:
        msgs = [m for m in _MQTT_STATE["messages"] if m["ts"] > since]
    return {"messages": msgs, "now": time.time()}


def _mqtt_autostart():
    try:
        cfg = _mqtt_load_config()
        if cfg.get("enabled") and cfg.get("host"):
            _mqtt_connect_now()
    except Exception as e:
        _MQTT_STATE["last_error"] = str(e)


threading.Thread(target=_mqtt_autostart, daemon=True).start()


# ═══════════════════════════════════════════════════════
#  RAG (sqlite-vec + Ollama nomic-embed-text)
# ═══════════════════════════════════════════════════════
import sqlite3 as _rag_sqlite
import struct as _rag_struct

_RAG_DB_PATH = Path("rag.db")
_RAG_LOCK = threading.Lock()
_RAG_INDEX_STATE = {
    "active": False, "current_file": None, "processed": 0, "total": 0,
    "source_id": None, "error": None,
}
_RAG_EMBED_MODEL = "nomic-embed-text"
_RAG_EMBED_DIM = 768
_RAG_CHUNK_SIZE = 800
_RAG_CHUNK_OVERLAP = 100
_RAG_TEXT_EXTS = {".txt", ".md", ".markdown", ".rst", ".py", ".js", ".ts", ".tsx", ".jsx",
                  ".html", ".css", ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".log",
                  ".sh", ".bat", ".ps1", ".java", ".c", ".cpp", ".h", ".go", ".rs"}


def _rag_db():
    conn = _rag_sqlite.connect(str(_RAG_DB_PATH))
    conn.execute("CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE, recursive INTEGER, added_at TEXT)")
    conn.execute("""CREATE TABLE IF NOT EXISTS chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER, path TEXT, chunk_idx INTEGER,
        text TEXT, mtime REAL, embedding BLOB,
        FOREIGN KEY(source_id) REFERENCES sources(id))""")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_chunks_source ON chunks(source_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_chunks_path ON chunks(path)")
    return conn


def _rag_embed(text: str) -> Optional[list[float]]:
    """Call Ollama embeddings API. Returns None on failure."""
    try:
        import requests as _rq
        ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
        r = _rq.post(f"{ollama_url}/api/embeddings",
                     json={"model": _RAG_EMBED_MODEL, "prompt": text}, timeout=60)
        if r.status_code != 200: return None
        data = r.json()
        return data.get("embedding")
    except Exception:
        return None


def _rag_check_embed_model() -> bool:
    try:
        import requests as _rq
        ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")
        r = _rq.get(f"{ollama_url}/api/tags", timeout=5)
        if r.status_code != 200: return False
        models = [m.get("name", "") for m in r.json().get("models", [])]
        return any(_RAG_EMBED_MODEL in m for m in models)
    except Exception:
        return False


def _rag_pack(vec: list[float]) -> bytes:
    return _rag_struct.pack(f"{len(vec)}f", *vec)


def _rag_unpack(blob: bytes) -> list[float]:
    n = len(blob) // 4
    return list(_rag_struct.unpack(f"{n}f", blob))


def _rag_cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b): return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    return dot / (na * nb) if na and nb else 0.0


def _rag_chunks(text: str) -> list[str]:
    text = text.replace("\r\n", "\n")
    out: list[str] = []
    i = 0
    while i < len(text):
        out.append(text[i:i + _RAG_CHUNK_SIZE])
        i += _RAG_CHUNK_SIZE - _RAG_CHUNK_OVERLAP
    return [c for c in out if c.strip()]


def _rag_extract_text(path: Path) -> Optional[str]:
    ext = path.suffix.lower()
    try:
        if ext in _RAG_TEXT_EXTS:
            return path.read_text(encoding="utf-8", errors="replace")
        if ext == ".pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(str(path))
                return "\n\n".join((p.extract_text() or "") for p in reader.pages)
            except ImportError:
                return None
        if ext == ".docx":
            try:
                from docx import Document
                doc = Document(str(path))
                return "\n".join(p.text for p in doc.paragraphs)
            except ImportError:
                return None
    except Exception:
        return None
    return None


def _rag_walk(root: Path, recursive: bool):
    if recursive:
        yield from (p for p in root.rglob("*") if p.is_file())
    else:
        yield from (p for p in root.iterdir() if p.is_file())


def _rag_index_source(source_id: int):
    _RAG_INDEX_STATE.update({"active": True, "processed": 0, "total": 0, "current_file": None, "source_id": source_id, "error": None})
    try:
        conn = _rag_db()
        row = conn.execute("SELECT path, recursive FROM sources WHERE id=?", (source_id,)).fetchone()
        if not row:
            _RAG_INDEX_STATE["error"] = "Source not found"; return
        path_str, recursive = row[0], bool(row[1])
        root = Path(path_str)
        if not root.exists():
            _RAG_INDEX_STATE["error"] = f"Path missing: {path_str}"; return
        files = list(_rag_walk(root, recursive))
        _RAG_INDEX_STATE["total"] = len(files)
        for fp in files:
            _RAG_INDEX_STATE["current_file"] = str(fp)
            try:
                mtime = fp.stat().st_mtime
                # skip unchanged
                existing = conn.execute("SELECT mtime FROM chunks WHERE path=? LIMIT 1", (str(fp),)).fetchone()
                if existing and abs(existing[0] - mtime) < 1.0:
                    _RAG_INDEX_STATE["processed"] += 1; continue
                text = _rag_extract_text(fp)
                if not text:
                    _RAG_INDEX_STATE["processed"] += 1; continue
                # Replace old chunks for this file
                conn.execute("DELETE FROM chunks WHERE path=?", (str(fp),))
                for idx, chunk in enumerate(_rag_chunks(text)):
                    emb = _rag_embed(chunk)
                    if not emb: continue
                    conn.execute(
                        "INSERT INTO chunks (source_id, path, chunk_idx, text, mtime, embedding) VALUES (?,?,?,?,?,?)",
                        (source_id, str(fp), idx, chunk, mtime, _rag_pack(emb)),
                    )
                conn.commit()
            except Exception as e:
                _RAG_INDEX_STATE["error"] = f"{fp}: {e}"
            _RAG_INDEX_STATE["processed"] += 1
        conn.close()
    except Exception as e:
        _RAG_INDEX_STATE["error"] = str(e)
    finally:
        _RAG_INDEX_STATE["active"] = False
        _RAG_INDEX_STATE["current_file"] = None


@app.get("/rag/sources")
def rag_list_sources():
    conn = _rag_db()
    rows = conn.execute("SELECT id, path, recursive, added_at FROM sources ORDER BY id").fetchall()
    out = []
    for r in rows:
        sid = r[0]
        doc_count = conn.execute("SELECT COUNT(DISTINCT path) FROM chunks WHERE source_id=?", (sid,)).fetchone()[0]
        chunk_count = conn.execute("SELECT COUNT(*) FROM chunks WHERE source_id=?", (sid,)).fetchone()[0]
        out.append({
            "id": sid, "path": r[1], "recursive": bool(r[2]), "added_at": r[3] or "",
            "doc_count": doc_count, "chunk_count": chunk_count,
        })
    conn.close()
    return out


@app.post("/rag/sources")
def rag_add_source(req: dict):
    path = (req.get("path") or "").strip()
    recursive = bool(req.get("recursive", True))
    if not path: raise HTTPException(status_code=400, detail="path required")
    if not Path(path).exists(): raise HTTPException(status_code=400, detail=f"Path does not exist: {path}")
    conn = _rag_db()
    try:
        cur = conn.execute("INSERT INTO sources (path, recursive, added_at) VALUES (?,?,?)",
                           (path, 1 if recursive else 0, datetime.now().isoformat(timespec="seconds")))
        sid = cur.lastrowid
        conn.commit()
    except _rag_sqlite.IntegrityError:
        existing = conn.execute("SELECT id FROM sources WHERE path=?", (path,)).fetchone()
        sid = existing[0] if existing else None
    conn.close()
    threading.Thread(target=_rag_index_source, args=(sid,), daemon=True).start()
    return {"id": sid, "path": path, "recursive": recursive, "added_at": datetime.now().isoformat(timespec="seconds"), "doc_count": 0, "chunk_count": 0}


@app.delete("/rag/sources/{source_id}")
def rag_delete_source(source_id: int):
    conn = _rag_db()
    conn.execute("DELETE FROM chunks WHERE source_id=?", (source_id,))
    conn.execute("DELETE FROM sources WHERE id=?", (source_id,))
    conn.commit(); conn.close()
    return {"status": "ok"}


@app.post("/rag/reindex/{source_id}")
def rag_reindex(source_id: int):
    if _RAG_INDEX_STATE["active"]:
        raise HTTPException(status_code=409, detail="Indexing already in progress")
    threading.Thread(target=_rag_index_source, args=(source_id,), daemon=True).start()
    return {"status": "started"}


@app.get("/rag/index/status")
def rag_index_status():
    return {**_RAG_INDEX_STATE, "embed_model_available": _rag_check_embed_model()}


@app.post("/rag/query")
def rag_query(req: dict):
    q = (req.get("query") or "").strip()
    top_k = int(req.get("top_k", 5))
    if not q: raise HTTPException(status_code=400, detail="query required")
    qvec = _rag_embed(q)
    if not qvec:
        raise HTTPException(status_code=500, detail="Embedding failed — is nomic-embed-text installed in Ollama?")
    conn = _rag_db()
    rows = conn.execute("SELECT path, chunk_idx, text, embedding FROM chunks").fetchall()
    conn.close()
    scored = []
    for path, idx, text, blob in rows:
        score = _rag_cosine(qvec, _rag_unpack(blob))
        scored.append((score, path, idx, text))
    scored.sort(reverse=True)
    chunks = [{"path": p, "chunk_idx": i, "text": t, "score": float(s)} for s, p, i, t in scored[:top_k]]
    return {"chunks": chunks}


# ============================================================================
# PHONE BRIDGE — let chat clients dispatch [PHONE_*] tags to a paired phone
# ============================================================================
import threading as _phone_threading
import asyncio as _phone_asyncio
import uuid as _phone_uuid
from typing import Dict
from collections import deque as _phone_deque

_phone_lock = _phone_threading.Lock()
_phone_devices: Dict[str, Dict[str, Any]] = {}     # device_id -> {name, last_seen, battery, charging}
_phone_queues: Dict[str, "_phone_deque[Dict[str, Any]]"] = {}  # device_id -> deque of {id, tag}
_phone_results: Dict[str, Dict[str, Any]] = {}     # command_id -> {ok, output}
_phone_events: Dict[str, _phone_threading.Event] = {}  # command_id -> Event


def _phone_pick_device() -> Optional[str]:
    """Pick the most-recently-seen device."""
    with _phone_lock:
        if not _phone_devices:
            return None
        return max(_phone_devices.keys(), key=lambda d: _phone_devices[d].get("last_seen", 0))


@app.post("/phone/register")
async def phone_register(req: Dict[str, Any] = Body(...)):
    device_id = (req.get("device_id") or "").strip()
    name = (req.get("name") or "").strip()
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id required")
    with _phone_lock:
        _phone_devices.setdefault(device_id, {})
        _phone_devices[device_id]["name"] = name or _phone_devices[device_id].get("name", "")
        _phone_devices[device_id]["last_seen"] = int(time.time() * 1000)
        _phone_queues.setdefault(device_id, _phone_deque(maxlen=200))
    return {"ok": True, "device_id": device_id}


@app.post("/phone/heartbeat")
async def phone_heartbeat(req: Dict[str, Any] = Body(...)):
    device_id = (req.get("device_id") or "").strip()
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id required")
    with _phone_lock:
        d = _phone_devices.setdefault(device_id, {})
        d["last_seen"] = int(time.time() * 1000)
        if "battery" in req: d["battery"] = req.get("battery")
        if "charging" in req: d["charging"] = bool(req.get("charging"))
        _phone_queues.setdefault(device_id, _phone_deque(maxlen=200))
    return {"ok": True}


@app.get("/phone/status")
async def phone_status():
    with _phone_lock:
        devices = [{"device_id": k, **v} for k, v in _phone_devices.items()]
    return {"devices": devices}


@app.get("/phone/commands")
async def phone_commands(device_id: str):
    with _phone_lock:
        q = _phone_queues.get(device_id)
        if q is None:
            return {"commands": []}
        cmds = list(q)
        q.clear()
        if device_id in _phone_devices:
            _phone_devices[device_id]["last_seen"] = int(time.time() * 1000)
    return {"commands": cmds}


@app.post("/phone/results")
async def phone_results(req: Dict[str, Any] = Body(...)):
    cmd_id = (req.get("command_id") or "").strip()
    if not cmd_id:
        raise HTTPException(status_code=400, detail="command_id required")
    with _phone_lock:
        _phone_results[cmd_id] = {
            "ok": bool(req.get("ok")),
            "output": req.get("output", ""),
        }
        ev = _phone_events.get(cmd_id)
    if ev:
        ev.set()
    return {"ok": True}


@app.post("/phone/dispatch")
async def phone_dispatch(req: Dict[str, Any] = Body(...)):
    """Queue a [PHONE_*] tag to a paired phone and wait for the result."""
    tag = (req.get("tag") or "").strip()
    timeout_ms = int(req.get("timeout_ms", 30000))
    device_id = (req.get("device_id") or "").strip() or _phone_pick_device()
    if not tag.startswith("[PHONE_"):
        raise HTTPException(status_code=400, detail="not a phone tag")
    if not device_id:
        raise HTTPException(status_code=503, detail="no paired phone")
    cmd_id = _phone_uuid.uuid4().hex
    ev = _phone_threading.Event()
    with _phone_lock:
        _phone_queues.setdefault(device_id, _phone_deque(maxlen=200)).append({"id": cmd_id, "tag": tag})
        _phone_events[cmd_id] = ev

    # Wait off the event loop
    loop = _phone_asyncio.get_event_loop()
    got = await loop.run_in_executor(None, ev.wait, timeout_ms / 1000.0)
    with _phone_lock:
        _phone_events.pop(cmd_id, None)
        result = _phone_results.pop(cmd_id, None)
    if not got or result is None:
        return {"ok": False, "output": f"phone {device_id} did not reply within {timeout_ms}ms"}
    return result



# ═══════════════════════════════════════════════════════
#  Kali-inspired packs: Recon · Audit · Forensics · Lab Mode
#  All operate on the local box / user-supplied targets.
#  Lab Mode endpoints require an explicit "I_OWN_THIS=yes" header.
# ═══════════════════════════════════════════════════════
import socket as _ks
import hashlib as _kh
import struct as _kstruct
import ipaddress as _kip
import concurrent.futures as _kcf
import urllib.request as _kreq
import urllib.parse as _kparse
import re as _kre
import subprocess as _ksub
import platform as _kplat


COMMON_PORTS = [21,22,23,25,53,67,68,69,80,110,111,123,135,137,138,139,143,161,389,443,445,465,514,587,631,636,873,902,989,990,993,995,1080,1194,1433,1521,1723,1883,2049,2082,2083,2375,2376,2483,2484,3000,3128,3306,3389,4444,5000,5432,5555,5601,5672,5900,5984,6379,6443,7001,7077,8000,8008,8080,8081,8086,8088,8443,8888,9000,9090,9092,9200,9300,11211,15672,25565,27017,27018,32400,33060,49152,50000,50070]

PORT_NAMES = {21:"ftp",22:"ssh",23:"telnet",25:"smtp",53:"dns",80:"http",110:"pop3",135:"msrpc",139:"netbios",143:"imap",389:"ldap",443:"https",445:"smb",465:"smtps",587:"submission",631:"ipp",993:"imaps",995:"pop3s",1433:"mssql",1883:"mqtt",2049:"nfs",2375:"docker",3000:"node/grafana",3306:"mysql",3389:"rdp",5000:"upnp/flask",5432:"postgres",5900:"vnc",5984:"couchdb",6379:"redis",6443:"k8s-api",8000:"http-alt",8080:"http-proxy",8086:"influxdb",8443:"https-alt",8888:"jupyter",9000:"portainer",9090:"prometheus",9200:"elasticsearch",11211:"memcached",27017:"mongodb",32400:"plex",50000:"sap"}


def _scan_one(host: str, port: int, timeout: float) -> tuple[int, bool, str]:
    s = _ks.socket(_ks.AF_INET, _ks.SOCK_STREAM)
    s.settimeout(timeout)
    banner = ""
    try:
        s.connect((host, port))
        try:
            s.settimeout(0.4)
            data = s.recv(96)
            banner = data.decode("utf-8", "replace").strip()
        except Exception:
            pass
        return (port, True, banner)
    except Exception:
        return (port, False, "")
    finally:
        try: s.close()
        except Exception: pass


@app.post("/recon/portscan")
def recon_portscan(req: dict):
    target = (req.get("target") or "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="target required")
    ports_in = req.get("ports")
    timeout = float(req.get("timeout", 0.5))
    if isinstance(ports_in, str) and ports_in.strip():
        ports = []
        for chunk in ports_in.split(","):
            chunk = chunk.strip()
            if "-" in chunk:
                a, b = chunk.split("-", 1)
                ports.extend(range(int(a), int(b) + 1))
            elif chunk.isdigit():
                ports.append(int(chunk))
        ports = [p for p in ports if 1 <= p <= 65535][:2048]
    else:
        ports = COMMON_PORTS
    try:
        ip = _ks.gethostbyname(target)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"resolve failed: {e}")
    open_ports = []
    with _kcf.ThreadPoolExecutor(max_workers=128) as ex:
        for port, ok, banner in ex.map(lambda p: _scan_one(ip, p, timeout), ports):
            if ok:
                open_ports.append({"port": port, "service": PORT_NAMES.get(port, "?"), "banner": banner})
    return {"target": target, "ip": ip, "scanned": len(ports), "open": open_ports}


@app.post("/recon/traceroute")
def recon_traceroute(req: dict):
    target = (req.get("target") or "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="target required")
    cmd = ["tracert", "-h", "20", "-w", "1500", target] if _kplat.system() == "Windows" else ["traceroute", "-n", "-q", "1", "-w", "2", "-m", "20", target]
    try:
        out = _ksub.run(cmd, capture_output=True, text=True, timeout=60)
        return {"target": target, "output": (out.stdout or "") + (out.stderr or "")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recon/dns")
def recon_dns(req: dict):
    name = (req.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    rec = {"A": [], "AAAA": [], "PTR": None, "CNAME": []}
    try:
        infos = _ks.getaddrinfo(name, None)
        for info in infos:
            addr = info[4][0]
            if ":" in addr and addr not in rec["AAAA"]:
                rec["AAAA"].append(addr)
            elif "." in addr and addr not in rec["A"]:
                rec["A"].append(addr)
    except Exception as e:
        rec["error"] = str(e)
    if rec["A"]:
        try:
            rec["PTR"] = _ks.gethostbyaddr(rec["A"][0])[0]
        except Exception:
            pass
    return {"name": name, "records": rec}


@app.post("/recon/whois")
def recon_whois(req: dict):
    domain = (req.get("domain") or "").strip()
    if not domain:
        raise HTTPException(status_code=400, detail="domain required")
    server = "whois.iana.org"
    try:
        out_text = ""
        for srv in (server, "whois.verisign-grs.com"):
            s = _ks.socket(_ks.AF_INET, _ks.SOCK_STREAM)
            s.settimeout(8)
            s.connect((srv, 43))
            s.sendall(f"{domain}\r\n".encode())
            chunks = []
            while True:
                try: data = s.recv(4096)
                except Exception: break
                if not data: break
                chunks.append(data)
            s.close()
            text = b"".join(chunks).decode("utf-8", "replace")
            out_text += f"\n--- {srv} ---\n" + text
            m = _kre.search(r"refer:\s*(\S+)", text, _kre.I)
            if m:
                server = m.group(1).strip()
                if server not in ("whois.verisign-grs.com",):
                    try:
                        s2 = _ks.socket(_ks.AF_INET, _ks.SOCK_STREAM)
                        s2.settimeout(8); s2.connect((server, 43))
                        s2.sendall(f"{domain}\r\n".encode())
                        buf = b""
                        while True:
                            try: d = s2.recv(4096)
                            except Exception: break
                            if not d: break
                            buf += d
                        s2.close()
                        out_text += f"\n--- {server} ---\n" + buf.decode("utf-8","replace")
                    except Exception: pass
            break
        return {"domain": domain, "output": out_text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recon/geoip")
def recon_geoip(req: dict):
    ip = (req.get("ip") or "").strip()
    if not ip:
        raise HTTPException(status_code=400, detail="ip required")
    try:
        with _kreq.urlopen(f"https://ipapi.co/{_kparse.quote(ip)}/json/", timeout=8) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/recon/hash")
def recon_hash(req: dict):
    path = (req.get("path") or "").strip()
    if not path or not Path(path).is_file():
        raise HTTPException(status_code=400, detail="file not found")
    p = Path(path)
    md5 = _kh.md5(); sha1 = _kh.sha1(); sha256 = _kh.sha256()
    size = 0
    with p.open("rb") as f:
        while True:
            chunk = f.read(1024*1024)
            if not chunk: break
            size += len(chunk)
            md5.update(chunk); sha1.update(chunk); sha256.update(chunk)
    return {"path": str(p), "size": size, "md5": md5.hexdigest(), "sha1": sha1.hexdigest(), "sha256": sha256.hexdigest()}


@app.post("/recon/strings")
def recon_strings(req: dict):
    path = (req.get("path") or "").strip()
    minlen = int(req.get("min_len", 6))
    limit = int(req.get("limit", 500))
    if not path or not Path(path).is_file():
        raise HTTPException(status_code=400, detail="file not found")
    data = Path(path).read_bytes()[:8 * 1024 * 1024]
    found = _kre.findall(rb"[\x20-\x7e]{%d,}" % minlen, data)
    out = [s.decode("ascii", "replace") for s in found[:limit]]
    return {"path": path, "count": len(found), "strings": out}


@app.post("/recon/hexdump")
def recon_hexdump(req: dict):
    path = (req.get("path") or "").strip()
    offset = int(req.get("offset", 0))
    length = min(int(req.get("length", 512)), 16384)
    if not path or not Path(path).is_file():
        raise HTTPException(status_code=400, detail="file not found")
    with Path(path).open("rb") as f:
        f.seek(offset)
        data = f.read(length)
    lines = []
    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        hexpart = " ".join(f"{b:02x}" for b in chunk).ljust(48)
        ascii_part = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
        lines.append(f"{offset+i:08x}  {hexpart}  {ascii_part}")
    return {"path": path, "offset": offset, "length": len(data), "dump": "\n".join(lines)}


@app.post("/recon/exif")
def recon_exif(req: dict):
    path = (req.get("path") or "").strip()
    if not path or not Path(path).is_file():
        raise HTTPException(status_code=400, detail="file not found")
    try:
        from PIL import Image, ExifTags
    except ImportError:
        raise HTTPException(status_code=500, detail="Pillow not installed. Run: pip install pillow")
    try:
        img = Image.open(path)
        raw = img._getexif() or {}
        tags = {ExifTags.TAGS.get(k, str(k)): str(v)[:300] for k, v in raw.items()}
        return {"path": path, "format": img.format, "size": img.size, "mode": img.mode, "exif": tags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recon/pwned")
def recon_pwned(req: dict):
    pw = req.get("password") or ""
    if not pw:
        raise HTTPException(status_code=400, detail="password required")
    sha1 = _kh.sha1(pw.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    try:
        with _kreq.urlopen(f"https://api.pwnedpasswords.com/range/{prefix}", timeout=8) as r:
            body = r.read().decode()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    count = 0
    for line in body.splitlines():
        h, _, c = line.strip().partition(":")
        if h == suffix:
            count = int(c); break
    score = max(0, min(100, len(pw)*6 + (10 if any(c.isupper() for c in pw) else 0) + (10 if any(c.isdigit() for c in pw) else 0) + (15 if any(not c.isalnum() for c in pw) else 0)))
    return {"breached": count > 0, "count": count, "strength": score}


@app.get("/audit/run")
def audit_run():
    findings = []
    sysname = _kplat.system()

    # Listening ports
    listening = []
    try:
        for c in psutil.net_connections(kind="inet"):
            if c.status == psutil.CONN_LISTEN and c.laddr:
                listening.append({"port": c.laddr.port, "ip": c.laddr.ip, "pid": c.pid or 0})
        risky = [l for l in listening if l["ip"] in ("0.0.0.0", "::") and l["port"] in (21,23,135,139,445,3389,5900,6379,9200,11211,27017)]
        if risky:
            findings.append({"level": "warn", "title": "Risky services exposed on all interfaces", "detail": ", ".join(f"{r['port']}" for r in risky)})
    except Exception as e:
        findings.append({"level": "info", "title": "Could not enumerate connections", "detail": str(e)})

    # Firewall
    fw = "unknown"
    try:
        if sysname == "Windows":
            r = _ksub.run(["netsh","advfirewall","show","allprofiles","state"], capture_output=True, text=True, timeout=8)
            on = r.stdout.count("ON")
            fw = f"{on}/3 profiles enabled"
            if on < 3:
                findings.append({"level":"warn","title":"Windows Firewall not fully enabled","detail":r.stdout.strip()[:600]})
        elif sysname == "Linux":
            r = _ksub.run(["sh","-c","command -v ufw && ufw status || iptables -L -n | head -20"], capture_output=True, text=True, timeout=8)
            fw = (r.stdout or r.stderr).strip()[:400]
    except Exception as e:
        fw = f"error: {e}"

    # Failed logins
    failed = "n/a"
    try:
        if sysname == "Windows":
            r = _ksub.run(["powershell","-NoProfile","-Command","(Get-EventLog -LogName Security -InstanceId 4625 -Newest 50 -ErrorAction SilentlyContinue).Count"], capture_output=True, text=True, timeout=10)
            failed = (r.stdout or "").strip() or "0"
        else:
            r = _ksub.run(["sh","-c","grep -c 'Failed password' /var/log/auth.log 2>/dev/null || journalctl _COMM=sshd | grep -c 'Failed password'"], capture_output=True, text=True, timeout=8)
            failed = (r.stdout or "").strip() or "0"
        if failed.isdigit() and int(failed) > 20:
            findings.append({"level":"warn","title":"High number of failed logins","detail":f"{failed} recent failed login attempts"})
    except Exception:
        pass

    # User accounts (Windows quick check)
    users = []
    try:
        if sysname == "Windows":
            r = _ksub.run(["net","user"], capture_output=True, text=True, timeout=8)
            users = [u for u in r.stdout.split() if u and not u.startswith("-") and u.lower() not in ("user","accounts","for","\\\\","command","completed","successfully.","the")][:30]
    except Exception:
        pass

    # Disk encryption (Windows BitLocker)
    encryption = "unknown"
    try:
        if sysname == "Windows":
            r = _ksub.run(["powershell","-NoProfile","-Command","(Get-BitLockerVolume -ErrorAction SilentlyContinue | Select-Object MountPoint,ProtectionStatus | Format-Table | Out-String)"], capture_output=True, text=True, timeout=10)
            encryption = (r.stdout or "").strip()[:600] or "n/a"
            if encryption and "Off" in encryption:
                findings.append({"level":"warn","title":"BitLocker disabled on one or more volumes","detail":encryption[:300]})
    except Exception:
        pass

    return {
        "system": sysname,
        "hostname": _ks.gethostname(),
        "listening_ports": listening,
        "firewall": fw,
        "failed_logins": failed,
        "users": users,
        "encryption": encryption,
        "findings": findings,
    }


# ── Lab Mode (gated) ──────────────────────────────────

def _require_lab(req_headers: dict):
    if (req_headers.get("i-own-this") or req_headers.get("I-Own-This") or "").lower() != "yes":
        raise HTTPException(status_code=403, detail="Lab mode requires header I-Own-This: yes — only use against systems you own.")


COMMON_DIRS = ["admin","administrator","login","wp-admin","wp-login.php","phpmyadmin","backup","backup.zip",".git/config",".env","config.php","robots.txt","sitemap.xml","api","api/v1","server-status",".DS_Store","uploads","images","static","dashboard","panel","cgi-bin","test","dev","old","tmp","db.sql"]


@app.post("/labmode/dirbust")
def labmode_dirbust(req: dict, request: Request):
    _require_lab(dict(request.headers))
    base = (req.get("base_url") or "").rstrip("/")
    if not base.startswith("http"):
        raise HTTPException(status_code=400, detail="base_url must start with http(s)://")
    extra = req.get("extra_paths") or []
    paths = COMMON_DIRS + [p.strip("/") for p in extra if p][:200]
    found = []
    def probe(path):
        url = f"{base}/{path}"
        try:
            r = _kreq.Request(url, headers={"User-Agent":"AgentLab/1.0"})
            with _kreq.urlopen(r, timeout=5) as resp:
                return {"path": path, "url": url, "status": resp.status, "len": len(resp.read(2048))}
        except Exception as e:
            code = getattr(e, "code", 0)
            if code and code != 404:
                return {"path": path, "url": url, "status": code, "len": 0}
            return None
    with _kcf.ThreadPoolExecutor(max_workers=16) as ex:
        for r in ex.map(probe, paths):
            if r: found.append(r)
    return {"base_url": base, "checked": len(paths), "found": found}


COMMON_SUBDOMAINS = ["www","mail","ftp","api","dev","staging","test","admin","portal","vpn","remote","app","blog","shop","cdn","static","img","m","mobile","ns1","ns2","mx","mx1","smtp","imap","pop","pop3","webmail","cpanel","whm","autodiscover","owa","exchange","sso","auth","login","secure","beta","demo","internal","intranet","wiki","docs","support","help","status","monitor","grafana","prometheus","jenkins","gitlab","git","jira","confluence"]


@app.post("/labmode/subdomain")
def labmode_subdomain(req: dict, request: Request):
    _require_lab(dict(request.headers))
    domain = (req.get("domain") or "").strip().lstrip(".")
    if not domain or "/" in domain:
        raise HTTPException(status_code=400, detail="domain required (no scheme)")
    extra = [w.strip() for w in (req.get("words") or []) if w.strip()][:300]
    words = COMMON_SUBDOMAINS + extra
    found = []
    def probe(w):
        host = f"{w}.{domain}"
        try:
            ip = _ks.gethostbyname(host)
            return {"host": host, "ip": ip}
        except Exception:
            return None
    with _kcf.ThreadPoolExecutor(max_workers=32) as ex:
        for r in ex.map(probe, words):
            if r: found.append(r)
    return {"domain": domain, "checked": len(words), "found": found}


@app.post("/labmode/login_probe")
def labmode_login_probe(req: dict, request: Request):
    """Test 1 credential at a time against an HTTP form. Rate-limited to 1 try/sec."""
    _require_lab(dict(request.headers))
    url = (req.get("url") or "").strip()
    user_field = req.get("user_field") or "username"
    pass_field = req.get("pass_field") or "password"
    username = req.get("username") or ""
    password = req.get("password") or ""
    fail_text = req.get("fail_text") or ""
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="url must start with http(s)://")
    data = _kparse.urlencode({user_field: username, pass_field: password}).encode()
    time.sleep(1.0)
    try:
        r = _kreq.Request(url, data=data, headers={"User-Agent":"AgentLab/1.0","Content-Type":"application/x-www-form-urlencoded"})
        with _kreq.urlopen(r, timeout=10) as resp:
            body = resp.read(8192).decode("utf-8","replace")
            ok = (fail_text not in body) if fail_text else (resp.status in (200, 302))
            return {"status": resp.status, "len": len(body), "likely_success": bool(ok), "snippet": body[:400]}
    except Exception as e:
        return {"status": getattr(e,"code",0), "error": str(e), "likely_success": False, "snippet": ""}


# ── Lab Mode: extended offensive toolkit (gated) ─────────────────────

import ssl as _kssl
import re as _kre

@app.post("/labmode/headers")
def labmode_headers(req: dict, request: Request):
    """Inspect HTTP security headers, server banner, cookies."""
    _require_lab(dict(request.headers))
    url = (req.get("url") or "").strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="url must start with http(s)://")
    method = (req.get("method") or "GET").upper()
    try:
        r = _kreq.Request(url, method=method, headers={"User-Agent":"AgentLab/1.0"})
        with _kreq.urlopen(r, timeout=8) as resp:
            headers = {k: v for k, v in resp.getheaders()}
            body = resp.read(4096).decode("utf-8","replace")
            status = resp.status
            final_url = resp.url
    except Exception as e:
        return {"error": str(e), "status": getattr(e,"code",0)}
    sec = ["Strict-Transport-Security","Content-Security-Policy","X-Frame-Options","X-Content-Type-Options","Referrer-Policy","Permissions-Policy","X-XSS-Protection"]
    missing = [h for h in sec if h not in headers]
    findings = []
    if missing:
        findings.append({"level":"warn","title":"Missing security headers","detail":", ".join(missing)})
    if "Server" in headers:
        findings.append({"level":"info","title":"Server banner","detail":headers["Server"]})
    if "X-Powered-By" in headers:
        findings.append({"level":"warn","title":"Tech leak","detail":headers["X-Powered-By"]})
    cookies = headers.get("Set-Cookie","")
    if cookies and "HttpOnly" not in cookies:
        findings.append({"level":"warn","title":"Cookie missing HttpOnly","detail":cookies[:200]})
    if cookies and "Secure" not in cookies and url.startswith("https"):
        findings.append({"level":"warn","title":"Cookie missing Secure","detail":cookies[:200]})
    return {"url": url, "final_url": final_url, "status": status, "headers": headers, "findings": findings, "body_preview": body[:600]}


@app.post("/labmode/ssl")
def labmode_ssl(req: dict, request: Request):
    """Inspect TLS certificate of host:port."""
    _require_lab(dict(request.headers))
    host = (req.get("host") or "").strip()
    port = int(req.get("port") or 443)
    if not host:
        raise HTTPException(status_code=400, detail="host required")
    ctx = _kssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = _kssl.CERT_NONE
    try:
        with _ks.create_connection((host, port), timeout=6) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                der = ssock.getpeercert(True)
                pem = _kssl.DER_cert_to_PEM_cert(der)
                cert_dict = ssock.getpeercert() or {}
                cipher = ssock.cipher()
                version = ssock.version()
        return {"host": host, "port": port, "tls_version": version, "cipher": cipher, "cert": cert_dict, "pem_preview": pem[:500]}
    except Exception as e:
        return {"error": str(e)}


@app.post("/labmode/vuln_probe")
def labmode_vuln_probe(req: dict, request: Request):
    """Send harmless test payloads to a URL parameter and look for reflection / errors."""
    _require_lab(dict(request.headers))
    url = (req.get("url") or "").strip()
    param = (req.get("param") or "q").strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="url must start with http(s)://")
    payloads = {
        "sqli_error":   "'\"",
        "sqli_bool":    "' OR '1'='1",
        "xss_reflect":  "<svg/onload=alert(1)>",
        "lfi_unix":     "../../../../etc/passwd",
        "lfi_win":      "..\\..\\..\\..\\windows\\win.ini",
        "open_redirect":"//evil.example.com",
        "cmd_inject":   ";id",
        "ssti":         "{{7*7}}",
    }
    err_signs = ["sql syntax","mysql","ORA-","SQLite","psql:","Microsoft SQL","Warning: include","root:x:0:0","[extensions]","stack trace","Traceback"]
    results = []
    for name, p in payloads.items():
        sep = "&" if "?" in url else "?"
        full = f"{url}{sep}{_kparse.quote(param)}={_kparse.quote(p)}"
        try:
            r = _kreq.Request(full, headers={"User-Agent":"AgentLab/1.0"})
            with _kreq.urlopen(r, timeout=6) as resp:
                body = resp.read(16384).decode("utf-8","replace")
                status = resp.status
        except Exception as e:
            body = ""; status = getattr(e,"code",0)
        reflected = p in body
        err_hit = next((s for s in err_signs if s.lower() in body.lower()), None)
        ssti_eval = (name=="ssti" and "49" in body and p not in body)
        suspicious = bool(reflected or err_hit or ssti_eval)
        results.append({"payload": name, "value": p, "status": status, "reflected": reflected, "error_signature": err_hit, "ssti_eval": ssti_eval, "suspicious": suspicious})
    return {"url": url, "param": param, "results": results}


@app.post("/labmode/host_sweep")
def labmode_host_sweep(req: dict, request: Request):
    """Ping-sweep a CIDR to find live hosts on your LAN."""
    _require_lab(dict(request.headers))
    cidr = (req.get("cidr") or "").strip()
    try:
        net = _kip.ip_network(cidr, strict=False)
    except Exception:
        raise HTTPException(status_code=400, detail="cidr required, e.g. 192.168.1.0/24")
    if net.num_addresses > 512:
        raise HTTPException(status_code=400, detail="network too large (max /23)")
    is_win = platform.system().lower().startswith("win")
    flag = "-n" if is_win else "-c"
    def ping(ip):
        try:
            r = subprocess.run(["ping", flag, "1", "-w" if is_win else "-W", "500" if is_win else "1", str(ip)],
                               capture_output=True, timeout=3)
            if r.returncode == 0:
                try: name = _ks.gethostbyaddr(str(ip))[0]
                except Exception: name = ""
                return {"ip": str(ip), "hostname": name}
        except Exception:
            return None
    hosts = []
    with _kcf.ThreadPoolExecutor(max_workers=64) as ex:
        for r in ex.map(ping, list(net.hosts())):
            if r: hosts.append(r)
    return {"cidr": cidr, "scanned": net.num_addresses, "alive": hosts}


@app.post("/labmode/banner")
def labmode_banner(req: dict, request: Request):
    """Connect to host:port, optionally send a probe, return banner."""
    _require_lab(dict(request.headers))
    host = (req.get("host") or "").strip()
    port = int(req.get("port") or 0)
    probe = req.get("probe") or ""
    if not host or not port:
        raise HTTPException(status_code=400, detail="host and port required")
    try:
        s = _ks.create_connection((host, port), timeout=4)
        s.settimeout(3)
        if probe:
            s.sendall(probe.encode() if isinstance(probe,str) else probe)
        data = b""
        try:
            for _ in range(3):
                chunk = s.recv(2048)
                if not chunk: break
                data += chunk
                if len(data) > 4096: break
        except _ks.timeout:
            pass
        s.close()
        text = data.decode("utf-8","replace")
        return {"host": host, "port": port, "bytes": len(data), "banner": text[:2000]}
    except Exception as e:
        return {"error": str(e)}


@app.post("/labmode/spray")
def labmode_spray(req: dict, request: Request):
    """Try a list of usernames with a single password against an HTTP form. Rate-limited."""
    _require_lab(dict(request.headers))
    url = (req.get("url") or "").strip()
    user_field = req.get("user_field") or "username"
    pass_field = req.get("pass_field") or "password"
    users = [u.strip() for u in (req.get("usernames") or []) if u.strip()][:20]
    password = req.get("password") or ""
    fail_text = req.get("fail_text") or ""
    delay = float(req.get("delay") or 1.5)
    if not url.startswith("http") or not users:
        raise HTTPException(status_code=400, detail="url and usernames[] required")
    results = []
    for u in users:
        time.sleep(delay)
        data = _kparse.urlencode({user_field: u, pass_field: password}).encode()
        try:
            r = _kreq.Request(url, data=data, headers={"User-Agent":"AgentLab/1.0","Content-Type":"application/x-www-form-urlencoded"})
            with _kreq.urlopen(r, timeout=10) as resp:
                body = resp.read(4096).decode("utf-8","replace")
                ok = (fail_text not in body) if fail_text else (resp.status in (200, 302))
                results.append({"user": u, "status": resp.status, "likely_success": bool(ok)})
        except Exception as e:
            results.append({"user": u, "status": getattr(e,"code",0), "error": str(e), "likely_success": False})
    hits = [r for r in results if r.get("likely_success")]
    return {"url": url, "tried": len(users), "hits": hits, "results": results}


@app.post("/labmode/robots")
def labmode_robots(req: dict, request: Request):
    """Fetch robots.txt + sitemap.xml and list disclosed paths."""
    _require_lab(dict(request.headers))
    base = (req.get("base_url") or "").rstrip("/")
    if not base.startswith("http"):
        raise HTTPException(status_code=400, detail="base_url must start with http(s)://")
    out = {"base_url": base, "robots": "", "sitemap_urls": [], "disallow": [], "allow": []}
    try:
        with _kreq.urlopen(f"{base}/robots.txt", timeout=6) as r:
            out["robots"] = r.read(8192).decode("utf-8","replace")
            for line in out["robots"].splitlines():
                if line.lower().startswith("disallow:"): out["disallow"].append(line.split(":",1)[1].strip())
                elif line.lower().startswith("allow:"): out["allow"].append(line.split(":",1)[1].strip())
                elif line.lower().startswith("sitemap:"): out["sitemap_urls"].append(line.split(":",1)[1].strip())
    except Exception as e:
        out["robots_error"] = str(e)
    try:
        with _kreq.urlopen(f"{base}/sitemap.xml", timeout=6) as r:
            sm = r.read(65536).decode("utf-8","replace")
            out["sitemap_locs"] = _kre.findall(r"<loc>([^<]+)</loc>", sm)[:200]
    except Exception:
        pass
    return out


@app.post("/labmode/cors")
def labmode_cors(req: dict, request: Request):
    """Send Origin headers and check Access-Control-Allow-Origin reflection."""
    _require_lab(dict(request.headers))
    url = (req.get("url") or "").strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="url required")
    origins = ["https://evil.example.com","null","https://" + (_urlparse(url).hostname or "x") + ".evil.com"]
    results = []
    for o in origins:
        try:
            r = _kreq.Request(url, headers={"User-Agent":"AgentLab/1.0","Origin":o})
            with _kreq.urlopen(r, timeout=6) as resp:
                acao = resp.headers.get("Access-Control-Allow-Origin","")
                acac = resp.headers.get("Access-Control-Allow-Credentials","")
                vuln = (acao == o) or acao == "*"
                results.append({"origin": o, "acao": acao, "acac": acac, "vulnerable": bool(vuln)})
        except Exception as e:
            results.append({"origin": o, "error": str(e)})
    return {"url": url, "results": results}



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local AI Agent")
    parser.add_argument("--telegram-token", help="Telegram bot token from @BotFather")
    parser.add_argument("--model", default="gemma3:4b", help="Ollama model to use (default: gemma3:4b)")
    parser.add_argument("--port", type=int, default=8484, help="API server port (default: 8484)")
    args = parser.parse_args()

    import uvicorn
    print(f"Local AI Agent starting on http://0.0.0.0:{args.port}")
    print("   + /env, /http, /download, /search, /zip, /unzip, /power, /launch, /tts, /disk, /screenshot, /wifi, /installed")

    if args.telegram_token:
        try:
            state = start_telegram_bot(args.telegram_token, args.model)
            username = state.get("username")
            identity = f"@{username}" if username else "connected"
            print(f"   Telegram bot: enabled ({identity}, model: {args.model})")
        except HTTPException as e:
            print(f"   Telegram bot: failed to start ({e.detail})")
    else:
        print("   Telegram bot: disabled (use --telegram-token to enable)")

    uvicorn.run(app, host="0.0.0.0", port=args.port)


# ───────── Wi-Fi audit (aircrack-ng wrapper, lab-gated) ─────────
import shutil as _wfsh
import platform as _wfpl
import subprocess as _wfsp
import os as _wfos
import re as _wfre

def _which_aircrack():
    """Return dict of which aircrack-ng suite tools are available."""
    tools = ["aircrack-ng", "airmon-ng", "airodump-ng", "aireplay-ng", "airbase-ng", "besside-ng", "hcxpcapngtool", "hashcat"]
    return {t: bool(_wfsh.which(t)) for t in tools}

@app.get("/labmode/wifi/tools")
def labmode_wifi_tools(request: Request):
    _require_lab(dict(request.headers))
    avail = _which_aircrack()
    return {
        "platform": _wfpl.system(),
        "tools": avail,
        "any_aircrack": any(avail.values()),
        "note": "aircrack-ng suite is Linux-native. On Windows, install via Kali WSL or use a USB Wi-Fi adapter that supports monitor mode.",
    }

@app.post("/labmode/wifi/scan")
def labmode_wifi_scan(req: dict, request: Request):
    """Scan for nearby APs. Uses `netsh wlan` on Windows, `iwlist`/`nmcli` on Linux."""
    _require_lab(dict(request.headers))
    sysname = _wfpl.system()
    networks = []
    raw = ""
    try:
        if sysname == "Windows":
            raw = _wfsp.check_output(["netsh", "wlan", "show", "networks", "mode=Bssid"], text=True, errors="ignore", timeout=20)
            blocks = _wfre.split(r"\r?\n\r?\n", raw)
            cur = None
            for line in raw.splitlines():
                m = _wfre.match(r"^SSID\s+\d+\s*:\s*(.*)$", line)
                if m:
                    if cur: networks.append(cur)
                    cur = {"ssid": m.group(1).strip() or "<hidden>", "bssids": [], "auth": "", "encryption": "", "type": ""}
                    continue
                if cur is None: continue
                if "Authentication" in line: cur["auth"] = line.split(":",1)[1].strip()
                elif "Encryption" in line:    cur["encryption"] = line.split(":",1)[1].strip()
                elif "Network type" in line:  cur["type"] = line.split(":",1)[1].strip()
                elif _wfre.search(r"BSSID\s+\d+", line): cur["bssids"].append({"bssid": line.split(":",1)[1].strip(), "signal": "", "channel": ""})
                elif "Signal" in line and cur["bssids"]: cur["bssids"][-1]["signal"] = line.split(":",1)[1].strip()
                elif "Channel" in line and cur["bssids"]: cur["bssids"][-1]["channel"] = line.split(":",1)[1].strip()
            if cur: networks.append(cur)
        else:
            if _wfsh.which("nmcli"):
                # -t terse output uses ':' as delimiter; BSSID's own ':' chars are escaped as '\:'
                raw = _wfsp.check_output(["nmcli", "-t", "-f", "SSID,BSSID,SIGNAL,CHAN,SECURITY", "device", "wifi", "list", "--rescan", "yes"], text=True, errors="ignore", timeout=25)
                for line in raw.splitlines():
                    if not line.strip(): continue
                    # split on unescaped ':' only
                    parts = _wfre.split(r"(?<!\\):", line)
                    if len(parts) < 5: continue
                    ssid = parts[0].replace("\\:", ":") or "<hidden>"
                    bssid = parts[1].replace("\\:", ":")
                    signal = parts[2]
                    chan = parts[3]
                    security = parts[4]
                    networks.append({"ssid": ssid, "bssids": [{"bssid": bssid, "signal": signal, "channel": chan}], "auth": security, "encryption": security, "type": "Infrastructure"})
            else:
                raw = _wfsp.check_output(["iwlist", "scanning"], text=True, errors="ignore", timeout=25)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Wi-Fi scan tool not found: {e}")
    except _wfsp.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"scan failed: {e}")
    except _wfsp.TimeoutExpired:
        raise HTTPException(status_code=504, detail="scan timed out")
    return {"platform": sysname, "count": len(networks), "networks": networks, "raw_preview": raw[:2000]}

@app.post("/labmode/wifi/monitor")
def labmode_wifi_monitor(req: dict, request: Request):
    """Toggle monitor mode via airmon-ng. Linux + compatible adapter required."""
    _require_lab(dict(request.headers))
    iface = (req.get("iface") or "").strip()
    action = (req.get("action") or "start").strip()  # start | stop | check
    if action == "check":
        if not _wfsh.which("airmon-ng"):
            return {"ok": False, "detail": "airmon-ng not installed"}
        out = _wfsp.run(["airmon-ng"], capture_output=True, text=True, timeout=15)
        return {"ok": True, "output": out.stdout + out.stderr}
    if not iface: raise HTTPException(status_code=400, detail="iface required")
    if not _wfsh.which("airmon-ng"): raise HTTPException(status_code=500, detail="airmon-ng not installed (Linux + monitor-capable adapter needed)")
    if action not in ("start","stop"): raise HTTPException(status_code=400, detail="action must be start|stop|check")
    out = _wfsp.run(["airmon-ng", action, iface], capture_output=True, text=True, timeout=30)
    return {"ok": out.returncode == 0, "output": out.stdout + out.stderr}

@app.post("/labmode/wifi/capture")
def labmode_wifi_capture(req: dict, request: Request):
    """Run airodump-ng for N seconds and write capture files. Requires monitor-mode iface."""
    _require_lab(dict(request.headers))
    iface = (req.get("iface") or "").strip()
    bssid = (req.get("bssid") or "").strip()
    channel = str(req.get("channel") or "").strip()
    seconds = int(req.get("seconds") or 30)
    out_prefix = (req.get("out_prefix") or "/tmp/wifi-cap").strip()
    if not iface: raise HTTPException(status_code=400, detail="iface required (must be in monitor mode)")
    if not _wfsh.which("airodump-ng"): raise HTTPException(status_code=500, detail="airodump-ng not installed")
    seconds = max(5, min(seconds, 600))
    cmd = ["airodump-ng", "-w", out_prefix, "--output-format", "pcap,csv", iface]
    if bssid:   cmd[1:1] = ["--bssid", bssid]
    if channel: cmd[1:1] = ["-c", channel]
    proc = _wfsp.Popen(cmd, stdout=_wfsp.PIPE, stderr=_wfsp.PIPE)
    try:
        proc.wait(timeout=seconds)
    except _wfsp.TimeoutExpired:
        proc.terminate()
        try: proc.wait(timeout=5)
        except _wfsp.TimeoutExpired: proc.kill()
    files = []
    try:
        d = _wfos.path.dirname(out_prefix) or "."
        base = _wfos.path.basename(out_prefix)
        for f in _wfos.listdir(d):
            if f.startswith(base): files.append(_wfos.path.join(d, f))
    except Exception: pass
    return {"ok": True, "seconds": seconds, "files": files, "command": " ".join(cmd)}

@app.post("/labmode/wifi/deauth")
def labmode_wifi_deauth(req: dict, request: Request):
    """Send deauth frames via aireplay-ng to force handshake re-capture. LAB ONLY."""
    _require_lab(dict(request.headers))
    iface = (req.get("iface") or "").strip()
    bssid = (req.get("bssid") or "").strip()
    client = (req.get("client") or "").strip()  # optional target client MAC
    count = int(req.get("count") or 5)
    if not iface or not bssid: raise HTTPException(status_code=400, detail="iface and bssid required")
    if not _wfsh.which("aireplay-ng"): raise HTTPException(status_code=500, detail="aireplay-ng not installed")
    count = max(1, min(count, 50))
    cmd = ["aireplay-ng", "--deauth", str(count), "-a", bssid]
    if client: cmd += ["-c", client]
    cmd += [iface]
    out = _wfsp.run(cmd, capture_output=True, text=True, timeout=60)
    return {"ok": out.returncode == 0, "command": " ".join(cmd), "output": out.stdout + out.stderr}

@app.post("/labmode/wifi/crack")
def labmode_wifi_crack(req: dict, request: Request):
    """Run aircrack-ng against a captured .cap/.pcap with a wordlist."""
    _require_lab(dict(request.headers))
    cap = (req.get("cap_file") or "").strip()
    wordlist = (req.get("wordlist") or "").strip()
    bssid = (req.get("bssid") or "").strip()
    essid = (req.get("essid") or "").strip()
    if not cap or not wordlist: raise HTTPException(status_code=400, detail="cap_file and wordlist required")
    if not _wfos.path.isfile(cap): raise HTTPException(status_code=400, detail=f"cap_file not found: {cap}")
    if not _wfos.path.isfile(wordlist): raise HTTPException(status_code=400, detail=f"wordlist not found: {wordlist}")
    if not _wfsh.which("aircrack-ng"): raise HTTPException(status_code=500, detail="aircrack-ng not installed")
    cmd = ["aircrack-ng", "-w", wordlist]
    if bssid: cmd += ["-b", bssid]
    if essid: cmd += ["-e", essid]
    cmd += [cap]
    out = _wfsp.run(cmd, capture_output=True, text=True, timeout=900)
    text = out.stdout + out.stderr
    key = None
    m = _wfre.search(r"KEY FOUND!\s*\[\s*(.+?)\s*\]", text)
    if m: key = m.group(1)
    return {"ok": out.returncode == 0, "key_found": key, "command": " ".join(cmd), "output": text[-8000:]}


# ============================================================================
# EXTERNAL KALI TOOLS — one wrapper per category from the Offensive Linux pack
# All gated behind I-Own-This: yes. Runs only the locally installed binaries.
# ============================================================================
import shutil as _kts_shutil, subprocess as _kts_sp, shlex as _kts_shlex, os as _kts_os, json as _kts_json

# Map: category -> (label, binary names to detect, default args description)
_KALI_TOOLS = {
    "theharvester":   {"category": "Reconnaissance",        "bins": ["theHarvester", "theharvester"]},
    "nikto":          {"category": "Vulnerability Scanning","bins": ["nikto"]},
    "hping3":         {"category": "Network-based Attacks", "bins": ["hping3"]},
    "hydra":          {"category": "Password / Brute Force","bins": ["hydra"]},
    "apktool":        {"category": "Mobile Security",       "bins": ["apktool"]},
    "radare2":        {"category": "Reverse Engineering",   "bins": ["r2", "radare2"]},
    "sqlmap":         {"category": "Exploitation",          "bins": ["sqlmap"]},
    "mimikatz":       {"category": "Post-Exploitation",     "bins": ["mimikatz.exe", "mimikatz"]},
    "wifite":         {"category": "Wireless Attacks",      "bins": ["wifite", "wifite2"]},
    "gophish":        {"category": "Social Engineering",    "bins": ["gophish"]},
    "zap":            {"category": "Web App Pen Testing",   "bins": ["zap.sh", "zaproxy", "owasp-zap"]},
    "faraday":        {"category": "Reporting & Docs",      "bins": ["faraday-cli", "faraday-server"]},
}

def _kts_which(names):
    for n in names:
        p = _kts_shutil.which(n)
        if p: return p
    return None

@app.get("/labmode/kali/tools")
def kali_tools_list(request: Request):
    _require_lab(dict(request.headers))
    out = []
    for key, meta in _KALI_TOOLS.items():
        path = _kts_which(meta["bins"])
        out.append({"key": key, "category": meta["category"], "bins": meta["bins"], "installed": bool(path), "path": path})
    return {"tools": out}

# Strict whitelist of allowed argument shapes per tool to avoid arbitrary command injection.
def _kts_run(bin_path: str, args: list, timeout: int = 600):
    try:
        r = _kts_sp.run([bin_path] + args, capture_output=True, text=True, timeout=timeout)
        return {"ok": r.returncode == 0, "rc": r.returncode, "command": " ".join([bin_path] + args), "stdout": r.stdout[-12000:], "stderr": r.stderr[-4000:]}
    except _kts_sp.TimeoutExpired:
        return {"ok": False, "rc": -1, "command": " ".join([bin_path] + args), "stdout": "", "stderr": f"timeout after {timeout}s"}
    except Exception as e:
        return {"ok": False, "rc": -1, "command": " ".join([bin_path] + args), "stdout": "", "stderr": str(e)}

def _kts_need(key):
    meta = _KALI_TOOLS.get(key)
    if not meta: raise HTTPException(status_code=404, detail="unknown tool")
    p = _kts_which(meta["bins"])
    if not p: raise HTTPException(status_code=400, detail=f"{key} not installed (looked for: {', '.join(meta['bins'])})")
    return p

@app.post("/labmode/kali/run")
def kali_tool_run(req: dict, request: Request):
    """Run one of the whitelisted Kali tools with constrained arguments."""
    _require_lab(dict(request.headers))
    key = (req.get("tool") or "").strip().lower()
    target = (req.get("target") or "").strip()
    extra = req.get("extra") or {}
    bin_path = _kts_need(key)

    if key == "theharvester":
        if not target: raise HTTPException(400, "target (domain) required")
        source = (extra.get("source") or "duckduckgo").strip()
        return _kts_run(bin_path, ["-d", target, "-b", source, "-l", str(int(extra.get("limit") or 100))], timeout=180)
    if key == "nikto":
        if not target: raise HTTPException(400, "target URL required")
        return _kts_run(bin_path, ["-h", target, "-Tuning", "x", "-maxtime", "120s"], timeout=180)
    if key == "hping3":
        if not target: raise HTTPException(400, "target IP required")
        count = str(int(extra.get("count") or 4))
        port = str(int(extra.get("port") or 80))
        return _kts_run(bin_path, ["-S", "-c", count, "-p", port, target], timeout=30)
    if key == "hydra":
        if not target: raise HTTPException(400, "target required (e.g. ssh://1.2.3.4)")
        user = (extra.get("user") or "").strip()
        wordlist = (extra.get("wordlist") or "").strip()
        if not user or not wordlist: raise HTTPException(400, "user and wordlist required")
        if not _kts_os.path.isfile(wordlist): raise HTTPException(400, "wordlist file not found")
        return _kts_run(bin_path, ["-l", user, "-P", wordlist, "-t", "4", "-f", target], timeout=300)
    if key == "apktool":
        path = (extra.get("apk") or "").strip()
        if not path or not _kts_os.path.isfile(path): raise HTTPException(400, "apk file not found")
        outdir = (extra.get("outdir") or (path + "_decoded")).strip()
        return _kts_run(bin_path, ["d", "-f", "-o", outdir, path], timeout=300)
    if key == "radare2":
        path = (extra.get("file") or "").strip()
        if not path or not _kts_os.path.isfile(path): raise HTTPException(400, "binary file not found")
        cmds = (extra.get("cmds") or "aaa;afl;iI;ie").strip()
        return _kts_run(bin_path, ["-q", "-c", cmds, path], timeout=120)
    if key == "sqlmap":
        if not target: raise HTTPException(400, "target URL required")
        return _kts_run(bin_path, ["-u", target, "--batch", "--level=1", "--risk=1", "--smart", "--timeout=15", "--retries=1"], timeout=300)
    if key == "mimikatz":
        # Read-only info command; full use requires admin shell on Windows
        return _kts_run(bin_path, ["privilege::debug", "exit"], timeout=15)
    if key == "wifite":
        # dry list of nearby networks; --no-deauths + --inf to choose iface
        iface = (extra.get("iface") or "").strip()
        args = ["--no-deauths", "--scan-time", "10", "--showb"]
        if iface: args = ["-i", iface] + args
        return _kts_run(bin_path, args, timeout=60)
    if key == "gophish":
        # gophish is a server; just print version
        return _kts_run(bin_path, ["--version"], timeout=10)
    if key == "zap":
        # ZAP daemon quick spider via -cmd
        if not target: raise HTTPException(400, "target URL required")
        return _kts_run(bin_path, ["-cmd", "-quickurl", target, "-quickprogress"], timeout=600)
    if key == "faraday":
        # list workspaces (faraday-cli)
        return _kts_run(bin_path, ["workspace", "list"], timeout=30)

    raise HTTPException(status_code=400, detail=f"tool {key} not handled")


# ═══════════════════════════════════════════════════════
#  DRANA-INFINITY: Bug Bounty Recon Tool Runner
#  (whitelisted CLI tools with placeholder substitution)
# ═══════════════════════════════════════════════════════
DRANA_TOOLS = {
    "nmap": "nmap --version", "httpx": "httpx -version", "webanalyze": "webanalyze --version",
    "wafw00f": "wafw00f --version", "amass": "amass version", "subfinder": "subfinder --version",
    "assetfinder": "assetfinder --version", "dnsx": "dnsx -version", "gobuster": "gobuster version",
    "ffuf": "ffuf -V", "dirsearch": "dirsearch --version", "feroxbuster": "feroxbuster --version",
    "gospider": "gospider --version", "hakrawler": "hakrawler -h", "katana": "katana -version",
    "waybackurls": "waybackurls -h", "gau": "gau --version", "linkfinder": "linkfinder -h",
    "getjs": "getJS --version", "arjun": "arjun --version", "paramspider": "paramspider -h",
    "wfuzz": "wfuzz --version", "nikto": "nikto -Version", "nuclei": "nuclei -version",
    "wapiti": "wapiti --version", "sqlmap": "sqlmap --version", "commix": "commix --version",
    "xsstrike": "xsstrike --version", "wpscan": "wpscan --version", "hydra": "hydra -h",
    "curl": "curl --version", "whatweb": "whatweb --version",
}


@app.get("/drana/tools/check")
def drana_tools_check():
    """Detect which Drana CLI tools are installed on the host."""
    results = []
    for name, cmd in DRANA_TOOLS.items():
        try:
            parts = cmd.split()
            bin_path = shutil.which(parts[0])
            if not bin_path:
                results.append({"tool": name, "installed": False, "version": None})
                continue
            r = subprocess.run([bin_path] + parts[1:], capture_output=True, text=True, timeout=5)
            out = (r.stdout + r.stderr).strip().splitlines()
            ver = out[0][:120] if out else "installed"
            results.append({"tool": name, "installed": True, "version": ver, "path": bin_path})
        except Exception as e:
            results.append({"tool": name, "installed": False, "version": None, "error": str(e)[:100]})
    return {"tools": results}


_DRANA_FORBIDDEN = re.compile(r"[;&|`$><\n\r]|\$\(|\)\(|&&|\|\|")


@app.post("/drana/run")
def drana_run(req: dict, request: Request):
    """Run a vetted Drana command with <target> substitution. Lab-mode gated."""
    _require_lab(dict(request.headers))
    command = (req.get("command") or "").strip()
    target = (req.get("target") or "").strip()
    timeout = int(req.get("timeout") or 90)
    if not command:
        raise HTTPException(status_code=400, detail="command required")
    if "<target>" in command and not target:
        raise HTTPException(status_code=400, detail="target required for this command")
    # Validate target shape (no shell metacharacters)
    if target and _DRANA_FORBIDDEN.search(target):
        raise HTTPException(status_code=400, detail="invalid target")
    final = command.replace("<target>", target)
    # First token must be a whitelisted tool
    tool = final.split()[0]
    if tool not in DRANA_TOOLS:
        raise HTTPException(status_code=400, detail=f"tool '{tool}' not in Drana whitelist")
    bin_path = shutil.which(tool)
    if not bin_path:
        raise HTTPException(status_code=404, detail=f"{tool} not installed on this host")
    # Re-tokenize with bin_path
    args = final.split()[1:]
    # Block any remaining shell-meta tokens
    if any(_DRANA_FORBIDDEN.search(a) for a in args):
        raise HTTPException(status_code=400, detail="invalid argument")
    started = time.time()
    try:
        r = subprocess.run([bin_path] + args, capture_output=True, text=True, timeout=timeout)
        return {
            "command": final,
            "tool": tool,
            "returncode": r.returncode,
            "stdout": r.stdout[-20000:],
            "stderr": r.stderr[-4000:],
            "duration": round(time.time() - started, 2),
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail=f"{tool} timed out after {timeout}s")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
