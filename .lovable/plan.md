## Add "On-Device Model" guide page

A new page that walks you through installing Ollama on your Galaxy via Termux and gives one-tap switches to point the app at the on-phone model (or back to the PC).

### New file: `src/pages/OnDeviceModelPage.tsx`

1. **Status card** — detects Capacitor/Android, pings `http://127.0.0.1:11434/api/tags`, shows "On-device Ollama: reachable / not reachable" and lists installed models if reachable.
2. **Quick switch** — buttons that update `settings.ollamaUrl` via `saveSettings` from `src/lib/settings.ts`:
   - "Use on-phone model" → `http://127.0.0.1:11434`
   - "Use PC over LAN" → recalls saved LAN IP
   - "Test connection" → fetch `/api/tags`
3. **Install guide (Termux)** — collapsible step-by-step with copy-to-clipboard buttons:
   ```
   pkg update && pkg upgrade
   pkg install ollama
   ollama serve &
   ollama pull qwen2.5:1.5b
   ```
   Notes: install Termux from F-Droid (not Play Store), keep it running in background, disable battery optimization.
4. **Recommended phone-friendly models** — Qwen2.5 0.5B / 1.5B / 3B, Phi-3.5-mini Q4, Llama 3.2 1B / 3B, with size + one-tap "Copy pull command".
5. **Limits callout** — `agent.py` / `pyautogui` / Computer Use won't work on-device; phone-side actions still go through the existing Capacitor phone runner.

### Wiring

- Add route `/on-device-model` in `src/App.tsx`.
- Add nav entry in `src/components/AppSidebar.tsx` near the Phone item, icon `Cpu` from lucide.
- Reuse `getSettings` / `saveSettings` from `src/lib/settings.ts` — no new storage.
- Reuse the `isPhone()` Capacitor detection pattern from `src/lib/phone.ts`.

### Out of scope

- No bundled inference engine (no MLC / llama.rn) — Termux + Ollama is the cleanest path and matches the existing Ollama architecture.
- No auto-switching logic.
