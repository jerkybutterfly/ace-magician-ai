

## Goal
Tune the local AI runtime for your **AceMagician AM09 Pro** (Ryzen 7 5700U, 32GB DDR4, Radeon Vega 8 iGPU) so models respond noticeably faster.

## Hardware reality check
- **5700U = Zen 2, 8c/16t, no AVX-512** — but it has **AVX2 + FMA**, which `llama.cpp` loves.
- **Vega 8 iGPU**: technically ROCm-capable but unsupported on Windows for `llama.cpp` in practice. GPU offload won't help — **CPU is your path**.
- **32GB RAM** is your superpower: you can run 13B Q4 models comfortably and use big context windows.
- DDR4 SO-DIMM memory bandwidth (~38GB/s dual-channel) is the real bottleneck for token speed. **Confirm both SO-DIMM slots are populated** — single-channel halves your tokens/sec.

## What I'll change

### 1. Local Models page — add a "Tune for my CPU" preset button
One click applies optimal defaults for your chip:
- `n_threads = 8` (physical cores, not 16 — SMT hurts llama.cpp)
- `n_batch = 512`
- `n_ctx = 4096` (default; slider to raise)
- `n_gpu_layers = 0` (Vega 8 won't help on Windows)
- `use_mmap = true`, `use_mlock = false`
- `flash_attn = true` if model supports it

### 2. Backend (`public/agent.py`) — accept and pass these params
Extend `/llm/load` to accept `n_threads`, `n_batch`, `flash_attn`, `use_mmap`, `use_mlock` and forward them to `llama_cpp.Llama(...)`. Currently only `n_ctx` and `n_gpu_layers` are wired.

### 3. Model recommendations panel
Add a "Recommended for your system" card on the Local Models page suggesting models that hit the sweet spot for 5700U + 32GB:
- **Llama 3.1 8B Q4_K_M** (~4.7GB) — fastest good model, ~12-18 tok/s expected
- **Qwen 2.5 7B Q4_K_M** — strong reasoning, similar speed
- **Phi-3.5 Mini Q5_K_M** (~2.8GB) — fastest overall, ~25+ tok/s
- Avoid: anything >13B, anything Q8/F16 (RAM-bandwidth starved)

### 4. Ollama-side tuning (if you keep using Ollama as primary)
Add a Settings panel section that writes these env vars into the Ollama service config note (shown to user, since we can't edit their system):
- `OLLAMA_NUM_PARALLEL=1`
- `OLLAMA_MAX_LOADED_MODELS=1`
- `OLLAMA_KEEP_ALIVE=30m` (avoid reload cost)
- `OLLAMA_FLASH_ATTENTION=1`

### 5. System diagnostics widget upgrade
Extend `SystemInfoPanel` to show:
- RAM channel config (dual vs single) — warns if single-channel detected
- CPU model + AVX2/AVX512 flags
- Currently loaded model size vs free RAM
This makes it obvious *why* a model is slow.

### 6. README — add "Performance tuning for AMD Ryzen mobile" section
Documents the rebuild command for max speed:
```
CMAKE_ARGS="-DGGML_NATIVE=on -DGGML_AVX2=on -DGGML_FMA=on" \
pip install llama-cpp-python --force-reinstall --no-cache-dir
```
This rebuilds `llama-cpp-python` with native CPU instructions — **typically 1.5-2× faster** than the generic prebuilt wheel.

## Files touched
- `src/pages/LocalModelsPage.tsx` — preset button, recommendations card, advanced sliders
- `src/components/SystemInfo.tsx` — RAM channel + CPU flags
- `src/lib/local-llm.ts` — new params in `loadLocalModel`
- `src/lib/agent.ts` — extend `getSystemInfo` types
- `public/agent.py` — extend `/llm/load`, extend `/system/info` to report CPU flags + RAM channels
- `src/pages/SettingsPage.tsx` — Ollama tuning env-var helper
- `README.md` — performance section

## Expected gains on your AM09 Pro
| Change | Speedup |
|---|---|
| Correct thread count (8 not 16) | +15-25% |
| Native AVX2 rebuild of llama-cpp-python | +50-100% |
| Dual-channel RAM (if currently single) | +80-90% |
| Switching from 13B to 8B Q4 | +60% |
| `OLLAMA_FLASH_ATTENTION=1` | +10-20% |

Realistic target: **15-20 tokens/sec on Llama 3.1 8B Q4** vs the ~5-8 you're probably seeing now.

## After it ships
1. Open Local Models → click **"Tune for my CPU"**
2. Check System panel — if it says "single-channel RAM", add a second SO-DIMM
3. Optional: run the AVX2 rebuild command from README for max speed

