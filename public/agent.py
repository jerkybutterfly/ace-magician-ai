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
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import psutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/skills/execute")
async def execute_skill(req: SkillRequest):
    try:
        skill_path = SKILLS_DIR / f"{req.name}.py"
        if not skill_path.exists():
            raise HTTPException(status_code=404, detail=f"Skill '{req.name}' not found")
        
        # Run the skill as a separate process
        cmd = f"python \"{skill_path}\" {req.args}"
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=60
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
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

        return f"❌ Unknown tag: {tag}"

    except subprocess.TimeoutExpired:
        return "⏰ Command timed out (30s)"
    except Exception as e:
        return f"❌ Error: {e}"



def process_tool_tags(text: str) -> tuple[str, bool]:
    """Find and execute tool tags in AI response. Returns (processed_text, had_tags)."""
    # Match parameterized tags
    pattern = r"\[(LIST_DIR|READ_FILE|WRITE_FILE|RUN_CMD|OPEN_URL|CLICK|FILL_FORM|TYPE_TEXT|GET_PAGE_TEXT|GET_PAGE_HTML|JS_EXEC|WAIT|WAIT_FOR|SCREENSHOT):?(.+?)?\]"
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
    try:
        ps = '''Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing
$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap($b.Width, $b.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
[Convert]::ToBase64String($ms.ToArray())'''
        result = subprocess.run(["powershell", "-Command", ps], capture_output=True, text=True, timeout=15)
        if result.returncode != 0:
            raise Exception(result.stderr)
        return {"status": "ok", "image": result.stdout.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
#  Hermes-style Memory & Learning
#  Episodes (action log) + Lessons (corrections from mistakes)
# ═══════════════════════════════════════════════════════
import json as _mem_json

MEMORY_DIR = Path.home() / ".pesto-ai" / "memory"
MEMORY_DIR.mkdir(parents=True, exist_ok=True)
EPISODES_FILE = MEMORY_DIR / "episodes.jsonl"
LESSONS_FILE = MEMORY_DIR / "lessons.md"
_mem_lock = threading.Lock()
MAX_EPISODES = 5000  # rolling cap


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


@app.get("/memory/episodes")
async def get_episodes(limit: int = 200):
    return {"episodes": _read_episodes(limit)}


@app.post("/memory/episodes")
async def add_episode(req: EpisodeRequest):
    ep = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "request": req.request[:500],
        "tag": req.tag[:300],
        "tool": req.tool,
        "outcome": req.outcome,
        "summary": req.summary[:1000],
    }
    _write_episode(ep)
    return {"status": "ok", "episode": ep}


@app.delete("/memory/episodes")
async def clear_episodes():
    with _mem_lock:
        if EPISODES_FILE.exists():
            EPISODES_FILE.unlink()
    return {"status": "ok"}


@app.get("/memory/episodes/search")
async def search_episodes(q: str, limit: int = 5):
    eps = _read_episodes(0)
    terms = [t.lower() for t in re.findall(r"\w+", q) if len(t) > 2]
    if not terms:
        return {"matches": []}
    scored: list[tuple[int, dict]] = []
    for ep in eps:
        hay = f"{ep.get('request','')} {ep.get('tag','')} {ep.get('summary','')}".lower()
        score = sum(hay.count(t) for t in terms)
        if score > 0:
            scored.append((score, ep))
    scored.sort(key=lambda x: x[0], reverse=True)
    return {"matches": [ep for _, ep in scored[:limit]]}


@app.get("/memory/lessons")
async def get_lessons():
    if not LESSONS_FILE.exists():
        return {"content": ""}
    return {"content": LESSONS_FILE.read_text(encoding="utf-8")}


@app.post("/memory/lessons")
async def add_lesson(req: LessonRequest):
    with _mem_lock:
        existing = LESSONS_FILE.read_text(encoding="utf-8") if LESSONS_FILE.exists() else "# Lessons Learned\n\n"
        ts = datetime.utcnow().isoformat() + "Z"
        entry = f"\n- **{ts}** — {req.text}"
        if req.source_tag:
            entry += f"\n  - Tag: `{req.source_tag}`"
        if req.source_error:
            err = req.source_error.replace("\n", " ")[:200]
            entry += f"\n  - Error: {err}"
        LESSONS_FILE.write_text(existing + entry + "\n", encoding="utf-8")
    return {"status": "ok"}


class LessonsOverwrite(BaseModel):
    content: str


@app.put("/memory/lessons")
async def overwrite_lessons(req: LessonsOverwrite):
    with _mem_lock:
        LESSONS_FILE.write_text(req.content, encoding="utf-8")
    return {"status": "ok"}


@app.delete("/memory/lessons")
async def clear_lessons():
    with _mem_lock:
        if LESSONS_FILE.exists():
            LESSONS_FILE.unlink()
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local AI Agent")
    parser.add_argument("--telegram-token", help="Telegram bot token from @BotFather")
    parser.add_argument("--model", default="gemma3:4b", help="Ollama model to use (default: gemma3:4b)")
    parser.add_argument("--port", type=int, default=8484, help="API server port (default: 8484)")
    args = parser.parse_args()

    import uvicorn
    print(f"🤖 Local AI Agent starting on http://0.0.0.0:{args.port}")
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
