# Colibri efficiency + Expert Router

Two goals in one change:

1. Squeeze more speed/quality out of Colibri when it's serving large models (e.g. Poolside's `laguna-xs:2.1` pulled through Ollama, GLM-5.2 int4, etc.).
2. Add a **Router** so Colibri stays the "big brain" while a small always-on expert on Ollama handles quick tasks and picks who answers each prompt (~70/30 split).

## What you'll see in the app

**Settings → Colibri (new "Performance" section):**
- GPU offload layers (`-ngl`), CPU threads, batch size, KV-cache quantisation (`q8_0` / `q4_0`), flash-attention toggle, mmap/mlock toggles, speculative-decoding pilot (`PILOT=1` + draft model picker).
- "Recommended for AM06 Pro" preset button that fills sensible defaults for a 32-core / integrated-GPU box.
- Live tokens/sec + RAM/VRAM readout pulled from `/colibri/health` after each generation.

**Settings → Experts Panel (new):**
- Table of registered experts: name, provider (colibri / ollama / llamacpp / opencode), model id, role tag (`heavy`, `code`, `vision`, `fast`, `long-context`), RAM budget, always-on toggle.
- "Add expert" wizard that scans your Ollama + llama.cpp servers and lets you tag each model.
- Default seeded experts: Colibri (heavy, always-on), `laguna-xs:2.1` on Ollama (code, always-on, 70/30 partner), plus any `qwen2.5-vl` / `nomic-embed` it finds.

**Chat page:**
- New provider entry **"Router (auto)"** in the model dropdown, next to the existing Ollama / Colibri / llama.cpp / opencode options.
- Small badge under each assistant reply showing which expert answered ("colibri · glm-5.2" / "ollama · laguna-xs:2.1") and why ("code intent, short prompt").
- Manual override: `@heavy`, `@code`, `@fast`, `@vision`, `@long` prefixes force a role.

## How the router picks

Deterministic, no extra LLM call in the hot path:

```text
prompt → classify (regex + heuristics + tokenizer length)
       → role: fast | code | vision | long-context | heavy
       → pick highest-priority always-on expert matching role
       → fallback chain if that expert errors or is busy
```

Heuristics used for classification:
- Attached image / `[SCREENSHOT]` tag → `vision`.
- Fenced code block, `/`-command, or ≤ 40 tokens + code keywords → `code` (routes to `laguna-xs:2.1`).
- ≤ 30 tokens, no code, no tool tags → `fast` (small Ollama model).
- Est. context > 16k tokens → `long-context` (Colibri, which has the biggest KV).
- Everything else → `heavy` (Colibri).

Router is a pure TS module so the classification is instant; only the chosen expert's streaming call is awaited.

## 70/30 concurrency guard

- Experts declare a RAM budget in the panel.
- A tiny in-memory scheduler in the agent (`/experts/lease`) refuses to start a second heavy expert while Colibri holds its lease; small always-on experts (< 8 GB) are exempt.
- If Colibri is idle for > 60s, its lease is released so a second heavy model can load.

## Technical notes

Files to add:
- `src/lib/experts.ts` — expert registry (localStorage), role tags, classification, streaming dispatcher that wraps existing `streamOllama` / `streamColibriChat` / `streamLlamaCpp` / `streamOpencode`.
- `src/components/ExpertsPanel.tsx` — the settings table + add-expert wizard.
- `src/components/ColibriPerfPanel.tsx` — the new performance controls (env vars written into `extra_env` on `/colibri/start`).
- Small addition to `agent.py`: `/experts/lease` + `/experts/release` for the concurrency guard, and pass-through of new Colibri env vars (`NGL`, `THREADS`, `BATCH`, `KV_QUANT`, `FLASH_ATTN`, `MMAP`, `MLOCK`, `PILOT`, `DRAFT_MODEL`).

Files to change:
- `src/lib/settings.ts` — add `colibriPerf` block + `experts` array + `routerEnabled` flag.
- `src/pages/SettingsPage.tsx` — mount the two new panels.
- `src/pages/Chat.tsx` — add "Router (auto)" option, `@role` prefix parsing, expert badge on replies.
- `src/lib/ollama.ts` — no behavioural change; router imports its existing streamers.

No new external dependencies. Everything stays local — Colibri, Ollama, llama.cpp, opencode already run on your box.

## Out of scope (say the word and I'll add later)

- Fan-out + judge mode (send to 2–3 experts, pick best). You chose router-only for now.
- Auto-download of `laguna-xs:2.1` — the wizard just detects it; you `ollama pull` it once.
- Cross-machine routing via exo. The scheduler is single-host; exo can be layered on later.
