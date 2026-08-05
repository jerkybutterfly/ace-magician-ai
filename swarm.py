"""
swarm.py — CrewAI-powered Multi-Agent Orchestration Engine

Uses CrewAI (https://github.com/crewAIInc/crewAI) under the hood with a local
Ollama backend. Keeps the same public API expected by agent.py:
    start_swarm(goal, model, worker_model, max_workers, ollama_url) -> swarm_id
    get_swarm(swarm_id) -> dict | None
    list_swarms() -> list[dict]

Install (on the agent host):
    pip install crewai

A Manager agent decomposes the goal, Worker agents execute the sub-tasks
in parallel, and the Manager synthesises a final answer.
"""
from __future__ import annotations

import json
import os
import re
import threading
import uuid
from datetime import datetime
from typing import Any, Optional

import requests

OLLAMA_URL_DEFAULT = "http://localhost:11434"

# ── State ────────────────────────────────────────────────────────────────────
_swarms: dict[str, dict[str, Any]] = {}
_swarms_lock = threading.Lock()


# ── State helpers ────────────────────────────────────────────────────────────

def _update_swarm(swarm_id: str, **kwargs: Any) -> None:
    with _swarms_lock:
        if swarm_id in _swarms:
            _swarms[swarm_id].update(kwargs)
            _swarms[swarm_id]["updated_at"] = datetime.utcnow().isoformat()


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


def get_swarm(swarm_id: str) -> Optional[dict]:
    with _swarms_lock:
        return dict(_swarms[swarm_id]) if swarm_id in _swarms else None


def list_swarms() -> list[dict]:
    with _swarms_lock:
        return [dict(v) for v in _swarms.values()]


# ── Fallback planner (used if CrewAI isn't installed) ────────────────────────

def _ollama_chat(model: str, messages: list[dict], ollama_url: str) -> str:
    r = requests.post(
        f"{ollama_url}/api/chat",
        json={"model": model, "messages": messages, "stream": False},
        timeout=180,
    )
    r.raise_for_status()
    return r.json().get("message", {}).get("content", "").strip()


def _plan_subtasks(goal: str, model: str, ollama_url: str, max_workers: int) -> list[str]:
    prompt = (
        f"You are a manager AI. Break down this goal into {max_workers} or fewer "
        "independent parallel sub-tasks for specialist worker agents.\n\n"
        f"Goal: {goal}\n\n"
        "Respond ONLY with a JSON array of strings — one sub-task per element. "
        "No markdown, no commentary."
    )
    raw = _ollama_chat(model, [{"role": "user", "content": prompt}], ollama_url)
    # Strip code fences
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE).strip()
    # Find first JSON array if there's extra text
    m = re.search(r"\[[\s\S]*\]", raw)
    if m:
        raw = m.group(0)
    tasks = json.loads(raw)
    if not isinstance(tasks, list):
        raise ValueError("Planner did not return a list.")
    return [str(t).strip() for t in tasks if str(t).strip()][:max_workers]


# ── CrewAI runner ────────────────────────────────────────────────────────────

def _build_llm(model: str, ollama_url: str):
    """Create a CrewAI LLM bound to a local Ollama model."""
    from crewai import LLM  # type: ignore

    # CrewAI uses LiteLLM under the hood; ollama models are addressed as `ollama/<name>`.
    model_id = model if "/" in model else f"ollama/{model}"
    # LiteLLM reads the Ollama base URL from this env var.
    os.environ["OLLAMA_API_BASE"] = ollama_url
    return LLM(model=model_id, base_url=ollama_url)


def _run_with_crewai(
    swarm_id: str,
    goal: str,
    sub_tasks: list[str],
    manager_model: str,
    worker_model: str,
    ollama_url: str,
) -> str:
    from crewai import Agent, Crew, Process, Task  # type: ignore

    worker_llm = _build_llm(worker_model, ollama_url)
    manager_llm = _build_llm(manager_model, ollama_url)

    agents: list[Any] = []
    tasks: list[Any] = []

    for i, sub in enumerate(sub_tasks):
        worker_id = f"w-{i+1}"
        agent = Agent(
            role=f"Specialist Worker {i+1}",
            goal=sub,
            backstory=(
                "You are an expert specialist agent in a coordinated swarm. "
                f"Overall mission: {goal}. Focus only on your assigned sub-task "
                "and produce a concise, actionable result."
            ),
            llm=worker_llm,
            allow_delegation=False,
            verbose=False,
        )

        def _make_cb(wid: str):
            def _cb(output: Any) -> None:
                text = getattr(output, "raw", None) or getattr(output, "output", None) or str(output)
                _update_worker(
                    swarm_id, wid,
                    status="done",
                    result=str(text),
                    finished_at=datetime.utcnow().isoformat(),
                )
            return _cb

        task = Task(
            description=sub,
            expected_output="A thorough, actionable answer to the sub-task.",
            agent=agent,
            callback=_make_cb(worker_id),
        )
        agents.append(agent)
        tasks.append(task)
        _update_worker(
            swarm_id, worker_id,
            status="running",
            started_at=datetime.utcnow().isoformat(),
        )

    manager = Agent(
        role="Swarm Manager",
        goal=f"Synthesise the workers' results into a final answer for: {goal}",
        backstory="You coordinate specialist workers and merge their outputs into a coherent final answer.",
        llm=manager_llm,
        allow_delegation=True,
        verbose=False,
    )

    crew = Crew(
        agents=agents,
        tasks=tasks,
        process=Process.hierarchical,
        manager_agent=manager,
        verbose=False,
    )

    result = crew.kickoff()
    return getattr(result, "raw", None) or str(result)


# ── LangGraph runner ─────────────────────────────────────────────────────────
# Graph shape:  plan -> [worker_1 .. worker_n] (parallel fan-out)
#                    -> synthesise -> critic -> (revise | end)
# The critic/revise cycle is what LangGraph buys us over a linear crew.

MAX_REVISIONS = 2


def _run_with_langgraph(
    swarm_id: str,
    goal: str,
    sub_tasks: list[str],
    manager_model: str,
    worker_model: str,
    ollama_url: str,
) -> str:
    import operator
    from typing import Annotated, TypedDict

    from langgraph.graph import END, START, StateGraph  # type: ignore

    class SwarmState(TypedDict):
        outputs: Annotated[list[str], operator.add]
        draft: str
        critique: str
        revisions: int

    def _make_worker_node(worker_id: str, task_text: str):
        def _node(_state: SwarmState) -> dict[str, Any]:
            _update_worker(swarm_id, worker_id, status="running",
                           started_at=datetime.utcnow().isoformat())
            try:
                res = _ollama_chat(worker_model, [
                    {"role": "system", "content": (
                        "You are a specialist agent in a coordinated swarm. "
                        f"Overall mission: {goal}. Answer only your assigned sub-task, "
                        "concisely and actionably."
                    )},
                    {"role": "user", "content": task_text},
                ], ollama_url)
                _update_worker(swarm_id, worker_id, status="done", result=res,
                               finished_at=datetime.utcnow().isoformat())
                return {"outputs": [f"### {task_text}\n{res}"]}
            except Exception as e:  # noqa: BLE001
                _update_worker(swarm_id, worker_id, status="error", result=str(e),
                               finished_at=datetime.utcnow().isoformat())
                return {"outputs": [f"### {task_text}\n(failed: {e})"]}
        return _node

    def _synthesise(state: SwarmState) -> dict[str, Any]:
        _update_swarm(swarm_id, status="synthesising")
        prior = f"\n\nPrevious draft to improve:\n{state.get('draft','')}\n\nCritique to address:\n{state.get('critique','')}" \
            if state.get("critique") else ""
        answer = _ollama_chat(manager_model, [{
            "role": "user",
            "content": (
                f"Synthesise these worker outputs into one complete final answer.\n"
                f"Goal: {goal}\n\n" + "\n\n".join(state["outputs"]) + prior
            ),
        }], ollama_url)
        return {"draft": answer}

    def _critic(state: SwarmState) -> dict[str, Any]:
        verdict = _ollama_chat(manager_model, [{
            "role": "user",
            "content": (
                "You are a strict reviewer. Judge whether the answer fully achieves the goal.\n"
                f"Goal: {goal}\n\nAnswer:\n{state['draft']}\n\n"
                "Reply with 'APPROVED' on the first line if it is complete and correct. "
                "Otherwise reply 'REVISE' on the first line followed by specific, concrete gaps to fix."
            ),
        }], ollama_url)
        return {"critique": verdict, "revisions": state.get("revisions", 0) + 1}

    def _route(state: SwarmState) -> str:
        if state.get("revisions", 0) >= MAX_REVISIONS:
            return "end"
        if state.get("critique", "").strip().upper().startswith("APPROVED"):
            return "end"
        return "revise"

    graph = StateGraph(SwarmState)
    worker_names: list[str] = []
    for i, sub in enumerate(sub_tasks):
        worker_id = f"w-{i+1}"
        node_name = f"worker_{i+1}"
        graph.add_node(node_name, _make_worker_node(worker_id, sub))
        graph.add_edge(START, node_name)
        worker_names.append(node_name)

    graph.add_node("synthesise", _synthesise)
    graph.add_node("critic", _critic)
    for n in worker_names:
        graph.add_edge(n, "synthesise")
    graph.add_edge("synthesise", "critic")
    graph.add_conditional_edges("critic", _route, {"revise": "synthesise", "end": END})

    app = graph.compile()
    final_state = app.invoke({"outputs": [], "draft": "", "critique": "", "revisions": 0})
    return final_state.get("draft", "")


# ── Manager orchestration thread ─────────────────────────────────────────────

def _manager_run(
    swarm_id: str,
    goal: str,
    model: str,
    worker_model: str,
    max_workers: int,
    ollama_url: str,
    engine: str = "auto",
) -> None:

    try:
        _update_swarm(swarm_id, status="planning")
        sub_tasks = _plan_subtasks(goal, model, ollama_url, max_workers)

        workers = [
            {
                "id": f"w-{i+1}",
                "task": t,
                "status": "pending",
                "result": None,
                "started_at": None,
                "finished_at": None,
            }
            for i, t in enumerate(sub_tasks)
        ]
        _update_swarm(swarm_id, status="working", workers=workers, plan=sub_tasks)

        try:
            import crewai  # noqa: F401
            _update_swarm(swarm_id, engine="crewai")
            _update_swarm(swarm_id, status="synthesising")
            final_answer = _run_with_crewai(
                swarm_id, goal, sub_tasks, model, worker_model, ollama_url,
            )
        except ImportError:
            # Fallback: run workers sequentially via raw Ollama
            _update_swarm(swarm_id, engine="ollama-fallback")
            outputs = []
            for w in workers:
                _update_worker(swarm_id, w["id"], status="running",
                               started_at=datetime.utcnow().isoformat())
                try:
                    res = _ollama_chat(worker_model, [
                        {"role": "system", "content": f"Specialist worker. Mission: {goal}"},
                        {"role": "user", "content": w["task"]},
                    ], ollama_url)
                    _update_worker(swarm_id, w["id"], status="done", result=res,
                                   finished_at=datetime.utcnow().isoformat())
                    outputs.append(f"### {w['task']}\n{res}")
                except Exception as e:
                    _update_worker(swarm_id, w["id"], status="error", result=str(e),
                                   finished_at=datetime.utcnow().isoformat())

            _update_swarm(swarm_id, status="synthesising")
            final_answer = _ollama_chat(model, [{
                "role": "user",
                "content": (
                    f"Synthesise these worker outputs into a final answer for the goal:\n"
                    f"Goal: {goal}\n\n" + "\n\n".join(outputs)
                ),
            }], ollama_url)

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


# ── Public API ───────────────────────────────────────────────────────────────

def start_swarm(
    goal: str,
    model: str = "gemma3:4b",
    worker_model: str | None = None,
    max_workers: int = 4,
    ollama_url: str = OLLAMA_URL_DEFAULT,
) -> str:
    swarm_id = str(uuid.uuid4())
    with _swarms_lock:
        _swarms[swarm_id] = {
            "id": swarm_id,
            "goal": goal,
            "model": model,
            "worker_model": worker_model or model,
            "max_workers": max_workers,
            "status": "starting",
            "engine": "pending",
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
