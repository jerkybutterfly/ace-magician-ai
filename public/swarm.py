"""
swarm.py — Multi-Agent Orchestration Engine
A Manager LLM decomposes a high-level goal into sub-tasks.
Worker agents execute each sub-task concurrently and report results.
The Manager then synthesises the final answer.
"""
from __future__ import annotations

import json
import threading
import time
import uuid
from datetime import datetime
from typing import Any, Optional

import requests

# ── Swarm state store (in-memory, keyed by swarm_id) ──────────────────────────
_swarms: dict[str, dict[str, Any]] = {}
_swarms_lock = threading.Lock()

OLLAMA_URL_DEFAULT = "http://localhost:11434"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ollama_chat(model: str, messages: list[dict], ollama_url: str = OLLAMA_URL_DEFAULT) -> str:
    """Synchronous Ollama chat call. Returns assistant content string."""
    resp = requests.post(
        f"{ollama_url}/api/chat",
        json={"model": model, "messages": messages, "stream": False},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json().get("message", {}).get("content", "").strip()


def _update_swarm(swarm_id: str, **kwargs: Any) -> None:
    with _swarms_lock:
        if swarm_id in _swarms:
            _swarms[swarm_id].update(kwargs)
            _swarms[swarm_id]["updated_at"] = datetime.utcnow().isoformat()


def get_swarm(swarm_id: str) -> Optional[dict]:
    with _swarms_lock:
        return dict(_swarms[swarm_id]) if swarm_id in _swarms else None


def list_swarms() -> list[dict]:
    with _swarms_lock:
        return [dict(v) for v in _swarms.values()]


# ── Worker ────────────────────────────────────────────────────────────────────

def _worker_run(
    swarm_id: str,
    worker_id: str,
    task: str,
    model: str,
    ollama_url: str,
    context: str,
) -> None:
    """Execute a single worker's sub-task."""
    try:
        _update_worker(swarm_id, worker_id, status="running", started_at=datetime.utcnow().isoformat())

        system_prompt = (
            "You are a specialist AI worker agent. You will be given a specific sub-task "
            "as part of a larger goal. Complete your sub-task thoroughly and concisely. "
            "Provide actionable, factual output. Do not ask for clarification.\n\n"
            f"Overall goal context: {context}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ]

        result = _ollama_chat(model, messages, ollama_url)
        _update_worker(swarm_id, worker_id, status="done", result=result, finished_at=datetime.utcnow().isoformat())

    except Exception as exc:
        _update_worker(swarm_id, worker_id, status="error", result=f"Error: {exc}", finished_at=datetime.utcnow().isoformat())


def _update_worker(swarm_id: str, worker_id: str, **kwargs: Any) -> None:
    with _swarms_lock:
        swarm = _swarms.get(swarm_id)
        if not swarm:
            return
        for w in swarm.get("workers", []):
            if w["id"] == worker_id:
                w.update(kwargs)
                break
        swarm["updated_at"] = datetime.utcnow().isoformat()


# ── Manager ───────────────────────────────────────────────────────────────────

def _manager_run(
    swarm_id: str,
    goal: str,
    model: str,
    worker_model: str,
    max_workers: int,
    ollama_url: str,
) -> None:
    """Full swarm lifecycle: plan → spawn workers → synthesise."""
    try:
        _update_swarm(swarm_id, status="planning")

        # ── Step 1: Manager decomposes the goal ───────────────────────────────
        plan_prompt = (
            f"You are a manager AI. Break down the following goal into {max_workers} or fewer "
            "independent, parallel sub-tasks that specialist worker agents can each handle separately.\n\n"
            f"Goal: {goal}\n\n"
            "Respond ONLY with a valid JSON array of strings. Each string is one sub-task. "
            "No markdown, no explanation — just the JSON array."
        )

        plan_response = _ollama_chat(model, [{"role": "user", "content": plan_prompt}], ollama_url)

        # Parse sub-tasks (strip markdown fences if present)
        raw = plan_response.strip()
        if raw.startswith("```"):
            raw = "\n".join(raw.split("\n")[1:])
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
        raw = raw.strip()

        sub_tasks: list[str] = json.loads(raw)
        if not isinstance(sub_tasks, list):
            raise ValueError("Manager did not return a list of tasks.")
        sub_tasks = [str(t).strip() for t in sub_tasks if str(t).strip()][:max_workers]

        # Build worker records
        workers = [
            {
                "id": f"w-{i+1}",
                "task": task,
                "status": "pending",
                "result": None,
                "started_at": None,
                "finished_at": None,
            }
            for i, task in enumerate(sub_tasks)
        ]

        _update_swarm(swarm_id, status="working", workers=workers, plan=sub_tasks)

        # ── Step 2: Spawn worker threads ──────────────────────────────────────
        threads: list[threading.Thread] = []
        for w in workers:
            t = threading.Thread(
                target=_worker_run,
                args=(swarm_id, w["id"], w["task"], worker_model, ollama_url, goal),
                daemon=True,
            )
            t.start()
            threads.append(t)

        for t in threads:
            t.join(timeout=180)

        # ── Step 3: Manager synthesises results ───────────────────────────────
        _update_swarm(swarm_id, status="synthesising")

        with _swarms_lock:
            current = dict(_swarms[swarm_id])

        worker_outputs = "\n\n".join(
            f"### Sub-task {i+1}: {w['task']}\n{w.get('result', '(no result)')}"
            for i, w in enumerate(current.get("workers", []))
        )

        synthesis_prompt = (
            f"You are a manager AI. Your workers have completed their sub-tasks for this goal:\n"
            f"**Goal:** {goal}\n\n"
            f"Here are their results:\n{worker_outputs}\n\n"
            "Synthesise a comprehensive, well-structured final answer based on all worker outputs. "
            "Be thorough and actionable."
        )

        final_answer = _ollama_chat(
            model,
            [{"role": "user", "content": synthesis_prompt}],
            ollama_url,
        )

        _update_swarm(
            swarm_id,
            status="done",
            final_answer=final_answer,
            finished_at=datetime.utcnow().isoformat(),
        )

    except Exception as exc:
        _update_swarm(
            swarm_id,
            status="error",
            error=str(exc),
            finished_at=datetime.utcnow().isoformat(),
        )


# ── Public API ────────────────────────────────────────────────────────────────

def start_swarm(
    goal: str,
    model: str = "gemma3:4b",
    worker_model: str | None = None,
    max_workers: int = 4,
    ollama_url: str = OLLAMA_URL_DEFAULT,
) -> str:
    """Launch a swarm asynchronously. Returns the swarm_id."""
    swarm_id = str(uuid.uuid4())
    with _swarms_lock:
        _swarms[swarm_id] = {
            "id": swarm_id,
            "goal": goal,
            "model": model,
            "worker_model": worker_model or model,
            "max_workers": max_workers,
            "status": "starting",
            "plan": [],
            "workers": [],
            "final_answer": None,
            "error": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "finished_at": None,
        }

    threading.Thread(
        target=_manager_run,
        args=(swarm_id, goal, model, worker_model or model, max_workers, ollama_url),
        daemon=True,
    ).start()

    return swarm_id
