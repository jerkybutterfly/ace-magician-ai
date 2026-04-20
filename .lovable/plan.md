

## Goal
Build a tiny in-app local LLM runtime (an "Ollama-lite") so you don't need the external Ollama daemon. It runs GGUF models on your PC via the existing Python agent and exposes the same chat API your UI already speaks.

## Reality check (important)
A real Ollama clone = a native binary that loads GGUF weights via llama.cpp and serves them over HTTP. Lovable can't ship a compiled binary, but we **can** wrap `llama-cpp-python` (the official Python binding to llama.cpp — the same C++ engine Ollama uses) inside your existing `public/agent.py`. Result: same engine as Ollama, served from your own agent, no Ollama install needed.

You keep Ollama as an option; this just adds a second provider called **"Local (built-in)"**.

## Architecture

```text
Chat UI ──► /llm/* endpoints on agent.py (port 8484)
                │
                ├── /llm/models   list GGUF files in ~/.pesto-ai/models/
                ├── /llm/pull     download GGUF from HuggingFace URL
                ├── /llm/delete   remove a GGUF
                ├── /llm/load     load model into RAM (llama-cpp-python)
                └── /llm/chat     SSE stream, OpenAI-compatible deltas
```

Models live in `~/.pesto-ai/models/*.gguf`. One model loaded at a time (kept warm in memory); swapping unloads the previous.

## Backend changes (`public/agent.py`)
1. Add optional dependency `llama-cpp-python` (graceful fallback: endpoints return "not installed, run `pip install llama-cpp-python`" if missing).
2. New module-level `LLMRuntime` singleton: holds current `Llama` instance, model name, context size, n_gpu_layers.
3. Endpoints:
   - `GET /llm/models` → list `.gguf` files + sizes + which is loaded.
   - `POST /llm/pull` `{url, filename}` → stream download from HuggingFace with progress (SSE).
   - `DELETE /llm/models/{name}`
   - `POST /llm/load` `{name, n_ctx, n_gpu_layers}` → load into RAM.
   - `POST /llm/chat` `{messages, temperature, max_tokens, stream}` → SSE in OpenAI delta format so the existing frontend parser works unchanged.

## Frontend changes
1. **`src/lib/local-llm.ts`** (new) — client for the above endpoints: `listLocalModels()`, `pullLocalModel(url)` async generator, `deleteLocalModel()`, `loadLocalModel()`, `streamLocalChat(messages)` async generator that yields the same `StreamChunk` shape `streamChat()` already uses.
2. **`src/lib/ollama.ts`** — extend `LLMProvider` with `'local'`; route to `streamLocalChat` when selected. Keep existing Ollama code untouched.
3. **`src/components/ModelSelector.tsx`** — when provider is `local`, fetch from `/llm/models` instead of Ollama; show "Load" button next to unloaded models.
4. **New page `src/pages/LocalModelsPage.tsx`** + sidebar entry "Local Models" (icon `Cpu`):
   - List installed GGUFs with size, loaded indicator, Load/Unload/Delete buttons.
   - "Add model" dialog: paste HuggingFace GGUF URL (with 4 curated suggestions: Hermes-3-Llama-3.2-3B Q4, Llama-3.2-3B Q4, Qwen2.5-3B Q4, Phi-3.5-mini Q4), shows download progress.
   - Settings: context size slider (2k–32k), GPU layers (0 = CPU only, -1 = all).
5. **`src/pages/SettingsPage.tsx`** — add "Local (built-in)" to provider dropdown; show one-time install hint: `pip install llama-cpp-python` (with `--prefer-binary` note for Windows).
6. **`src/pages/Chat.tsx`** — add `'local'` branch in the provider switch that calls `streamLocalChat`. Memory/learning loop and tool-tag execution work unchanged because output format is identical.

## Routing & nav
- `App.tsx` + `Index.tsx`: register `/local-models` route.
- `AppSidebar.tsx`: add "Local Models" link.

## README updates
One section: "Built-in LLM runtime" — explains it uses llama.cpp via `llama-cpp-python`, where models live, how to add GPU support (`CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python --no-cache-dir`).

## What stays the same
- Ollama provider still works.
- Chat UI, system prompt, Hermes memory/learning, tool-tag execution, Spec Kit — untouched.
- Permissions and reflection loop apply to local-runtime responses identically.

## Files touched
**New:** `src/lib/local-llm.ts`, `src/pages/LocalModelsPage.tsx`
**Edited:** `public/agent.py`, `src/lib/ollama.ts`, `src/components/ModelSelector.tsx`, `src/pages/Chat.tsx`, `src/pages/SettingsPage.tsx`, `src/components/AppSidebar.tsx`, `src/App.tsx`, `src/pages/Index.tsx`, `README.md`

## One-time PC setup you'll run after this ships
```bash
pip install llama-cpp-python fastapi-sse  # CPU
# or for NVIDIA GPU:
# CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python --no-cache-dir
```
Then restart `python public/agent.py` and download a model from the new Local Models page.

