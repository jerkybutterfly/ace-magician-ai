import os
import json
import uuid
import threading
from pathlib import Path
from pydantic import BaseModel
from fastapi import APIRouter
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

router = APIRouter()
TRIGGERS_FILE = Path("triggers.json")

class TriggerDef(BaseModel):
    id: str = ""
    folder_path: str
    action: str
    message: str

def load_triggers():
    if not TRIGGERS_FILE.exists():
        return []
    try:
        with open(TRIGGERS_FILE) as f:
            return json.load(f)
    except:
        return []

def save_triggers(data):
    with open(TRIGGERS_FILE, "w") as f:
        json.dump(data, f, indent=2)

class ActionHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory: return
        trigs = load_triggers()
        for t in trigs:
            try:
                parent_dir = str(Path(event.src_path).parent.resolve())
                watch_dir = str(Path(t["folder_path"]).resolve())
                if watch_dir == parent_dir or watch_dir in parent_dir:
                    if t["action"] == "notify":
                        msg = f"[AUTOMATION] {t['message']} -> {Path(event.src_path).name}"
                        print(msg)
                        # We append it to a log file so the UI can pick it up if needed
                        with open("automation_logs.txt", "a") as logf:
                            logf.write(msg + "\n")
            except Exception as e:
                print(f"Automation Error: {e}")

observer = None

def _start_observer():
    global observer
    if observer:
        observer.stop()
        observer.join()
    observer = Observer()
    trigs = load_triggers()
    watched = set()
    for t in trigs:
        fp = t["folder_path"]
        if os.path.exists(fp) and fp not in watched:
            observer.schedule(ActionHandler(), fp, recursive=True)
            watched.add(fp)
    if watched:
        observer.start()

def start_automations():
    t = threading.Thread(target=_start_observer, daemon=True)
    t.start()

@router.get("/automations")
def get_automations():
    return {"triggers": load_triggers()}

@router.post("/automations")
def create_automation(t: TriggerDef):
    if not t.id:
        t.id = str(uuid.uuid4())
    trigs = load_triggers()
    trigs.append(t.model_dump() if hasattr(t, "model_dump") else t.dict())
    save_triggers(trigs)
    _start_observer()
    return {"status": "ok"}
