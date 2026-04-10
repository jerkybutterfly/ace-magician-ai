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
    """Lazily start a Chrome browser session."""
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
        opts = Options()
        opts.add_argument("--start-maximized")
        opts.add_argument("--disable-blink-features=AutomationControlled")
        opts.add_experimental_option("excludeSwitches", ["enable-automation"])
        _browser_driver = webdriver.Chrome(options=opts)
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


app = FastAPI(title="Local AI Agent", version="3.0.0")

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
        el = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, req.selector))
        )
        el.click()
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
        el = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, req.selector))
        )
        el.clear()
        el.send_keys(req.value)
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
        el = WebDriverWait(driver, 10).until(
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
            return f"🌐 Opened: {driver.title} ({driver.current_url})"

        if tag == "CLICK":
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            driver = _get_browser()
            el = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, arg.strip()))
            )
            el.click()
            return f"🖱️ Clicked {arg.strip()} — now on: {driver.title}"

        if tag == "FILL_FORM":
            parts = arg.split("|", 1)
            if len(parts) != 2:
                return "❌ Invalid format. Use: selector|value"
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            driver = _get_browser()
            el = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, parts[0].strip()))
            )
            el.clear()
            el.send_keys(parts[1].strip())
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
            el = WebDriverWait(driver, 10).until(
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

        return f"❌ Unknown tag: {tag}"

    except subprocess.TimeoutExpired:
        return "⏰ Command timed out (30s)"
    except Exception as e:
        return f"❌ Error: {e}"



def process_tool_tags(text: str) -> tuple[str, bool]:
    """Find and execute tool tags in AI response. Returns (processed_text, had_tags)."""
    # Match parameterized tags
    pattern = r"\[(LIST_DIR|READ_FILE|WRITE_FILE|RUN_CMD|OPEN_URL|CLICK|FILL_FORM|TYPE_TEXT|GET_PAGE_TEXT):?(.+?)?\]"
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local AI Agent")
    parser.add_argument("--telegram-token", help="Telegram bot token from @BotFather")
    parser.add_argument("--model", default="gemma3:4b", help="Ollama model to use (default: gemma3:4b)")
    parser.add_argument("--port", type=int, default=8484, help="API server port (default: 8484)")
    args = parser.parse_args()

    import uvicorn

    print(f"🤖 Local AI Agent starting on http://0.0.0.0:{args.port}")
    print("   Endpoints: /terminal, /files, /system, /browser/*, /telegram/*")

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
