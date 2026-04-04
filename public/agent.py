#!/usr/bin/env python3
"""
Local AI Agent — FastAPI server for PC control + Telegram bot.
Run: pip install fastapi uvicorn psutil requests && python agent.py
With Telegram: python agent.py --telegram-token YOUR_BOT_TOKEN
"""
import os
import sys
import subprocess
import shutil
import argparse
import threading
import time
import json
import re
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psutil

app = FastAPI(title="Local AI Agent", version="2.0.0")

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


# ═══════════════════════════════════════════════════════
#  Telegram Bot — PC Control via Chat
# ═══════════════════════════════════════════════════════

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")

TELEGRAM_SYSTEM_PROMPT = """You are an AI agent with FULL CONTROL of this PC. You execute actions DIRECTLY using command tags. The system automatically executes your tags — you NEVER give the user commands to run manually.

CRITICAL RULES:
- You MUST use the tags below. They are auto-executed. NEVER tell the user to run commands themselves.
- NEVER say "I can't access files" or "for security reasons" — you HAVE full access.
- NEVER provide PowerShell/bash commands for the user to copy. YOU execute everything.
- If you don't use tags, you are BROKEN. Every action MUST use tags.

AVAILABLE TAGS (auto-executed):
[LIST_DIR:path] — List directory contents
[READ_FILE:path] — Read file contents  
[WRITE_FILE:path|content] — Create/overwrite a file
[RUN_CMD:command] — Run ANY terminal command (PowerShell, cmd, start programs)

EXAMPLES:
User: "Open Chrome and go to google.com"
Assistant: Opening Chrome now.
[RUN_CMD:start chrome https://google.com]

User: "What's on my desktop?"
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

        elif tag == "READ_FILE":
            target = Path(arg).resolve()
            if not target.exists():
                return f"❌ File not found: {arg}"
            content = target.read_text(errors="replace")[:4000]
            return content

        elif tag == "WRITE_FILE":
            parts = arg.split("|", 1)
            if len(parts) != 2:
                return "❌ Invalid format. Use: path|content"
            filepath, content = parts
            target = Path(filepath.strip()).resolve()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
            return f"✅ File written: {target}"

        elif tag == "RUN_CMD":
            if is_blocked(arg):
                return "🚫 Command blocked for safety"
            result = subprocess.run(
                arg, shell=True, capture_output=True, text=True, timeout=30
            )
            output = result.stdout or result.stderr or "(no output)"
            return output[:3000]

        else:
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


def telegram_bot_loop(token: str, ollama_model: str):
    """Long-polling loop for Telegram bot."""
    import requests

    base = f"https://api.telegram.org/bot{token}"
    offset = 0
    # Per-chat conversation history
    conversations: dict[int, list[dict]] = {}
    MAX_HISTORY = 20
    MAX_TOOL_ROUNDS = 5

    print(f"🤖 Telegram bot starting... (model: {ollama_model})")

    # Get bot info
    try:
        me = requests.get(f"{base}/getMe", timeout=10).json()
        if me.get("ok"):
            print(f"📱 Telegram bot: @{me['result'].get('username', '?')}")
        else:
            print(f"❌ Telegram auth failed: {me}")
            return
    except Exception as e:
        print(f"❌ Cannot reach Telegram API: {e}")
        return

    while True:
        try:
            resp = requests.get(
                f"{base}/getUpdates",
                params={"offset": offset, "timeout": 30},
                timeout=35,
            )
            updates = resp.json().get("result", [])

            for update in updates:
                offset = update["update_id"] + 1
                msg = update.get("message")
                if not msg or not msg.get("text"):
                    continue

                chat_id = msg["chat"]["id"]
                user_text = msg["text"]
                user_name = msg["from"].get("first_name", "User")

                print(f"💬 [{user_name}]: {user_text[:80]}")

                # Handle /clear command
                if user_text.strip().lower() in ("/clear", "/reset"):
                    conversations.pop(chat_id, None)
                    requests.post(f"{base}/sendMessage", json={
                        "chat_id": chat_id,
                        "text": "🧹 Conversation cleared."
                    })
                    continue

                # Handle /help command
                if user_text.strip().lower() == "/help":
                    requests.post(f"{base}/sendMessage", json={
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
                    })
                    continue

                # Build conversation history
                if chat_id not in conversations:
                    conversations[chat_id] = []

                history = conversations[chat_id]
                history.append({"role": "user", "content": user_text})

                # Trim history
                if len(history) > MAX_HISTORY:
                    history = history[-MAX_HISTORY:]
                    conversations[chat_id] = history

                # Send "typing" indicator
                requests.post(f"{base}/sendChatAction", json={
                    "chat_id": chat_id, "action": "typing"
                })

                # Multi-round tool loop
                current_messages = [
                    {"role": "system", "content": TELEGRAM_SYSTEM_PROMPT},
                    *history,
                ]

                final_response = ""
                for round_num in range(MAX_TOOL_ROUNDS):
                    # Call Ollama
                    try:
                        ollama_resp = requests.post(
                            f"{OLLAMA_URL}/api/chat",
                            json={"model": ollama_model, "messages": current_messages, "stream": False},
                            timeout=120,
                        )
                        ai_text = ollama_resp.json().get("message", {}).get("content", "")
                    except Exception as e:
                        ai_text = f"⚠️ Ollama error: {e}"
                        break

                    # Process tool tags
                    processed, had_tags = process_tool_tags(ai_text)

                    if had_tags and round_num < MAX_TOOL_ROUNDS - 1:
                        # Feed results back for another round
                        current_messages.append({"role": "assistant", "content": processed})
                        current_messages.append({
                            "role": "user",
                            "content": "[TOOL_RESULTS]\nCommands executed. Results are above. Analyze and continue — use more tags if needed, or summarize what happened.\n[/TOOL_RESULTS]",
                        })
                        requests.post(f"{base}/sendChatAction", json={
                            "chat_id": chat_id, "action": "typing"
                        })
                        continue

                    final_response = processed
                    break

                if not final_response:
                    final_response = "🤔 No response generated."

                # Save to history
                history.append({"role": "assistant", "content": final_response})
                conversations[chat_id] = history

                # Send response (split if too long for Telegram's 4096 char limit)
                for i in range(0, len(final_response), 4000):
                    chunk = final_response[i:i + 4000]
                    requests.post(f"{base}/sendMessage", json={
                        "chat_id": chat_id,
                        "text": chunk,
                    })

                print(f"🤖 Reply sent ({len(final_response)} chars)")

        except requests.exceptions.Timeout:
            continue
        except Exception as e:
            print(f"❌ Telegram error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local AI Agent")
    parser.add_argument("--telegram-token", help="Telegram bot token from @BotFather")
    parser.add_argument("--model", default="gemma3:4b", help="Ollama model to use (default: gemma3:4b)")
    parser.add_argument("--port", type=int, default=8484, help="API server port (default: 8484)")
    args = parser.parse_args()

    import uvicorn

    print("🤖 Local AI Agent starting on http://0.0.0.0:{args.port}")
    print("   Endpoints: /terminal, /files, /files/read, /files/write, /files/delete, /system")

    if args.telegram_token:
        # Run Telegram bot in background thread
        t = threading.Thread(
            target=telegram_bot_loop,
            args=(args.telegram_token, args.model),
            daemon=True,
        )
        t.start()
        print(f"   Telegram bot: enabled (model: {args.model})")
    else:
        print("   Telegram bot: disabled (use --telegram-token to enable)")

    uvicorn.run(app, host="0.0.0.0", port=args.port)
