#!/usr/bin/env python3
"""
Local AI Agent — FastAPI server for PC control + Telegram bot.
Run: pip install fastapi uvicorn psutil requests && python agent.py
With Telegram: python agent.py --telegram-token YOUR_BOT_TOKEN
"""
import argparse
import os
import re
import base64
import shutil
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

app = FastAPI(title="Local AI Agent", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Safety: blocked commands (add more as needed) ──
BLOCKED_COMMANDS = {"rm -rf /", "mkfs", "dd if=", ":(){:|:&};:", "format c:"}


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


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
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


@app.get("/telegram/status")
async def telegram_status():
    return get_telegram_state()


# ═══════════════════════════════════════════════════════
#  Telegram Bot — PC Control via Chat
# ═══════════════════════════════════════════════════════

TELEGRAM_SYSTEM_PROMPT = """You are an AI agent with FULL CONTROL of this PC. You execute actions DIRECTLY using command tags. The system automatically executes your tags — you NEVER give the user commands to run manually.

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

EXAMPLES:
User: \"Open Chrome and go to google.com\"
Assistant: Opening Chrome now.
[RUN_CMD:start chrome https://google.com]

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

        return f"❌ Unknown tag: {tag}"

    except subprocess.TimeoutExpired:
        return "⏰ Command timed out (30s)"
    except Exception as e:
        return f"❌ Error: {e}"



def process_tool_tags(text: str) -> tuple[str, bool]:
    """Find and execute tool tags in AI response. Returns (processed_text, had_tags)."""
    pattern = r"\[(LIST_DIR|READ_FILE|WRITE_FILE|RUN_CMD):(.+?)\]"
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



def telegram_bot_loop(token: str, ollama_model: str, stop_event: threading.Event):
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
                            ollama_resp = requests.post(
                                f"{OLLAMA_URL}/api/chat",
                                json={"model": ollama_model, "messages": current_messages, "stream": False},
                                timeout=120,
                            )
                            ollama_data = ollama_resp.json()
                            if not ollama_resp.ok:
                                raise RuntimeError(str(ollama_data))
                            ai_text = ollama_data.get("message", {}).get("content", "")
                        except Exception as e:
                            ai_text = f"⚠️ Ollama error: {e}"
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



def start_telegram_bot(token: str, model: str) -> dict[str, Any]:
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
            args=(cleaned_token, cleaned_model, telegram_stop_event),
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
    return start_telegram_bot(req.token, req.model or "gemma3:4b")


@app.post("/telegram/disconnect")
async def telegram_disconnect():
    return stop_telegram_bot()


# ── Network Discovery ────────────────────────────────────────────────────────

_VENDOR_TYPE_MAP = {
    "sagemcom": "Router", "netgear": "Router", "linksys": "Router",
    "asus": "Router", "tp-link": "Router", "cisco": "Router",
    "apple": "Apple Device", "samsung": "Mobile Device",
    "honor": "Mobile Device", "xiaomi": "Mobile Device",
    "sony interactive entertainment": "Game Console",
    "amazon technologies": "Smart Home Device",
    "tuya smart": "Smart Home Device", "espressif": "IoT Device",
    "hp": "Printer", "brother": "Printer", "canon": "Printer",
    "intel": "Computer", "dell": "Computer", "lenovo": "Computer",
    "hewlett packard": "Computer",
}


def _guess_device_type(vendor, hostname):
    if hostname:
        hn = hostname.lower()
        if any(p in hn for p in ["print", "mfp"]): return "Printer"
        if any(p in hn for p in ["camera", "cam", "ipc"]): return "Security Camera"
        if any(p in hn for p in ["tv", "roku", "firestick"]): return "Smart TV"
        if any(p in hn for p in ["desktop", "pc", "win"]): return "Computer"
        if any(p in hn for p in ["iphone", "pixel", "galaxy-s", "s26", "s24"]): return "Phone"
        if any(p in hn for p in ["ipad", "tablet"]): return "Tablet"
        if any(p in hn for p in ["echo", "alexa", "homepod"]): return "Smart Speaker"
        if any(p in hn for p in ["router", "ap-", "gateway"]): return "Router"
        if any(p in hn for p in ["switch", "hub"]): return "Network Switch"
        if "playstation" in hn or "ps5" in hn or "ps4" in hn: return "Game Console"
    if vendor:
        v = vendor.lower()
        for key, dtype in _VENDOR_TYPE_MAP.items():
            if key in v:
                return dtype
    return "Unknown"


def _find_nmap() -> Optional[str]:
    """Locate nmap binary via PATH or common install locations."""
    found = shutil.which("nmap")
    if found:
        return found
    for candidate in [
        r"C:\Program Files\Nmap\nmap.exe",
        r"C:\Program Files (x86)\Nmap\nmap.exe",
    ]:
        if Path(candidate).exists():
            return candidate
    return None


def _detect_subnet() -> Optional[str]:
    result = subprocess.run("ipconfig", capture_output=True, text=True, timeout=10)
    ip = mask = None
    for line in result.stdout.splitlines():
        if "IPv4 Address" in line:
            ip = line.split(":")[-1].strip()
        elif "Subnet Mask" in line:
            mask = line.split(":")[-1].strip()
    if ip and mask:
        import ipaddress
        try:
            network = ipaddress.IPv4Network(f"{ip}/{mask}", strict=False)
            return str(network)
        except ValueError:
            pass
    return None


def _parse_nmap_xml(xml_text: str) -> list:
    import xml.etree.ElementTree as ET
    root = ET.fromstring(xml_text)
    devices = []
    for host in root.findall("host"):
        status_el = host.find("status")
        if status_el is None or status_el.get("state") != "up":
            continue
        device = {"ip": None, "mac": None, "vendor": None, "hostname": None, "device_type": None}
        for addr in host.findall("address"):
            if addr.get("addrtype") == "ipv4":
                device["ip"] = addr.get("addr")
            elif addr.get("addrtype") == "mac":
                device["mac"] = addr.get("addr")
                device["vendor"] = addr.get("vendor")
        hostnames_el = host.find("hostnames")
        if hostnames_el is not None:
            hn = hostnames_el.find("hostname")
            if hn is not None:
                device["hostname"] = hn.get("name")
        device["device_type"] = _guess_device_type(device.get("vendor"), device.get("hostname"))
        devices.append(device)
    return devices


@app.get("/network/scan")
async def network_scan(subnet: Optional[str] = None):
    nmap_path = _find_nmap()
    if not nmap_path:
        raise HTTPException(status_code=500, detail="nmap is not installed or not found in PATH")
    target = subnet or _detect_subnet()
    if not target:
        raise HTTPException(status_code=400, detail="Could not detect local subnet. Pass ?subnet=192.168.1.0/24")
    start_time = time.time()
    try:
        result = subprocess.run(
            [nmap_path, "-sn", "-oX", "-", target],
            capture_output=True, text=True, timeout=60
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="nmap scan timed out (60s)")
    if result.returncode != 0 and not result.stdout:
        raise HTTPException(status_code=500, detail=f"nmap failed: {result.stderr}")
    devices = _parse_nmap_xml(result.stdout)
    elapsed = round(time.time() - start_time, 2)
    return {"devices": devices, "subnet": target, "scan_duration_seconds": elapsed, "device_count": len(devices)}


@app.get("/network/nmap-status")
async def nmap_status():
    nmap_path = _find_nmap()
    if nmap_path:
        ver = subprocess.run([nmap_path, "--version"], capture_output=True, text=True, timeout=5)
        version_line = ver.stdout.splitlines()[0] if ver.stdout else "unknown"
        return {"installed": True, "path": nmap_path, "version": version_line}
    return {"installed": False, "path": None, "version": None}


# ── ADB (Android Debug Bridge) ───────────────────────────────────────────────

adb_state: dict = {"connected_devices": [], "last_connected_ip": None}


class AdbConnectRequest(BaseModel):
    tailscale_ip: str
    port: Optional[int] = 5555


class AdbCommandRequest(BaseModel):
    command: str
    device: Optional[str] = None


class AdbDisconnectRequest(BaseModel):
    ip: Optional[str] = None


class AdbPullRequest(BaseModel):
    remote_path: str
    local_path: Optional[str] = None
    device: Optional[str] = None


class AdbPushRequest(BaseModel):
    local_path: str
    remote_path: str
    device: Optional[str] = None


def _find_adb() -> Optional[str]:
    """Locate adb binary via PATH or common install locations."""
    found = shutil.which("adb")
    if found:
        return found
    localappdata = os.environ.get("LOCALAPPDATA", "")
    for candidate in [
        os.path.join(localappdata, r"Android\Sdk\platform-tools\adb.exe") if localappdata else "",
        r"C:\Android\platform-tools\adb.exe",
    ]:
        if candidate and Path(candidate).exists():
            return candidate
    return None


def _adb_cmd(device: Optional[str], *args: str) -> list[str]:
    cmd = ["adb"]
    if device:
        cmd += ["-s", device]
    cmd += list(args)
    return cmd


@app.get("/adb/status")
async def adb_status():
    adb_path = _find_adb()
    if adb_path:
        return {"installed": True, "path": adb_path}
    return {"installed": False, "path": None}


@app.get("/adb/devices")
async def adb_devices():
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    try:
        result = subprocess.run(
            [adb_path, "devices", "-l"], capture_output=True, text=True, timeout=30
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ADB devices timed out (30s)")
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"ADB error: {result.stderr}")
    devices = []
    for line in result.stdout.splitlines()[1:]:
        parts = line.split()
        if len(parts) < 2:
            continue
        serial = parts[0]
        info = " ".join(parts[2:])
        model = None
        transport_id = None
        for token in parts[2:]:
            if token.startswith("model:"):
                model = token.split(":", 1)[1]
            elif token.startswith("transport_id:"):
                transport_id = token.split(":", 1)[1]
        devices.append({"serial": serial, "model": model, "transport_id": transport_id})
    return {"devices": devices}


@app.post("/adb/connect")
async def adb_connect(req: AdbConnectRequest):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    target = f"{req.tailscale_ip}:{req.port}"
    try:
        result = subprocess.run(
            [adb_path, "connect", target], capture_output=True, text=True, timeout=30
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ADB connect timed out (30s)")
    output = result.stdout.strip()
    adb_state["last_connected_ip"] = req.tailscale_ip
    if "connected" in output.lower():
        if target not in adb_state["connected_devices"]:
            adb_state["connected_devices"].append(target)
    return {"output": output, "target": target}


@app.post("/adb/disconnect")
async def adb_disconnect(req: AdbDisconnectRequest):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    cmd = [adb_path, "disconnect"]
    if req.ip:
        cmd.append(req.ip)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ADB disconnect timed out (30s)")
    output = result.stdout.strip()
    if req.ip and req.ip in adb_state["connected_devices"]:
        adb_state["connected_devices"].remove(req.ip)
    return {"output": output}


@app.post("/adb/command")
async def adb_command(req: AdbCommandRequest):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    if is_blocked(req.command):
        raise HTTPException(status_code=403, detail="Command blocked for safety")
    cmd = _adb_cmd(req.device, "shell", req.command)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Command timed out (30s)", "returncode": -1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/adb/screenshot")
async def adb_screenshot(device: Optional[str] = None):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    cmd = _adb_cmd(device, "exec-out", "screencap", "-p")
    try:
        result = subprocess.run(cmd, capture_output=True, timeout=30)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Screenshot timed out (30s)")
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"ADB error: {result.stderr.decode(errors='replace')}")
    if not result.stdout:
        raise HTTPException(status_code=500, detail="Screenshot returned empty data")
    image_b64 = base64.b64encode(result.stdout).decode()
    return {"image": image_b64}


@app.get("/adb/files")
async def adb_files(path: str = "/sdcard/", device: Optional[str] = None):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    cmd = _adb_cmd(device, "shell", "ls", "-la", path)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ADB ls timed out (30s)")
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"ADB error: {result.stderr}")
    entries = []
    for line in result.stdout.splitlines():
        parts = line.split()
        if len(parts) < 6:
            continue
        permissions = parts[0]
        is_dir = permissions.startswith("d")
        name = parts[-1]
        size = parts[4] if parts[4].isdigit() else 0
        date_str = " ".join(parts[5:8]) if len(parts) >= 8 else ""
        entries.append({"name": name, "is_dir": is_dir, "size": int(size), "permissions": permissions, "date": date_str})
    return {"path": path, "entries": entries}


@app.post("/adb/pull")
async def adb_pull(req: AdbPullRequest):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    cmd = _adb_cmd(req.device, "pull", req.remote_path)
    if req.local_path:
        cmd.append(req.local_path)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ADB pull timed out (60s)")
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"ADB pull failed: {result.stderr}")
    return {"output": result.stdout.strip(), "remote_path": req.remote_path}


@app.post("/adb/push")
async def adb_push(req: AdbPushRequest):
    adb_path = _find_adb()
    if not adb_path:
        raise HTTPException(status_code=500, detail="ADB is not installed or not found in PATH")
    cmd = _adb_cmd(req.device, "push", req.local_path, req.remote_path)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="ADB push timed out (60s)")
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"ADB push failed: {result.stderr}")
    return {"output": result.stdout.strip(), "remote_path": req.remote_path}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local AI Agent")
    parser.add_argument("--telegram-token", help="Telegram bot token from @BotFather")
    parser.add_argument("--model", default="gemma3:4b", help="Ollama model to use (default: gemma3:4b)")
    parser.add_argument("--port", type=int, default=8484, help="API server port (default: 8484)")
    args = parser.parse_args()

    import uvicorn

    print(f"🤖 Local AI Agent starting on http://0.0.0.0:{args.port}")
    print("   Endpoints: /terminal, /files, /files/read, /files/write, /files/delete, /system, /telegram/status, /telegram/connect, /telegram/disconnect")

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
