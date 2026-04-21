# Pesto Steve's AI

Local AI assistant for the AM06 Pro mini PC. Chat UI talks to a local Ollama / LM Studio instance and a Python FastAPI agent (`public/agent.py`) for terminal, file, and system control.

## Run on PC (web app)

The web app at the preview / published URL works as-is on PC. Make sure:

- Ollama is running at `http://localhost:11434`
- The Python agent is running at `http://localhost:8484` (`python public/agent.py`)
- For live web search & fetch, install once: `pip install beautifulsoup4 lxml trafilatura`
  (optional: set `SERPAPI_KEY` or `BRAVE_SEARCH_KEY` env var for more reliable search)

## Run on Android (Galaxy S26 Ultra etc.) via Capacitor

The same codebase is wrapped as a native Android app using [Capacitor](https://capacitorjs.com/). The PC web app is unchanged.

### Prerequisites
- Android Studio installed
- Node.js + npm
- Your PC's LAN IP (e.g. `192.168.1.50`) — phone connects to Ollama + agent over Wi-Fi

### Build steps

1. **Export to GitHub** from Lovable (top-right "Export to GitHub" button)
2. `git clone` your exported repo
3. `npm install`
4. `npx cap add android`
5. `npm run build`
6. `npx cap sync`
7. `npx cap run android` (with phone connected via USB or emulator running)

After any code update, repeat steps 5 + 6 (`npm run build && npx cap sync`).

### On the phone

1. Open the app
2. Go to **Settings**
3. Update Ollama URL, LM Studio URL, and Agent URL to your PC's LAN IP (e.g. `http://192.168.1.50:11434`)
4. Make sure Ollama on your PC is bound to `0.0.0.0`:
   - Set env var `OLLAMA_HOST=0.0.0.0:11434` and restart Ollama
5. The Python agent (`uvicorn`) already listens on `0.0.0.0:8484` by default

## Spec Kit (Spec-Driven Development)

The **Spec Kit** page wraps GitHub's [spec-kit](https://github.com/github/spec-kit) CLI so you can scaffold spec-driven projects from inside the app.

PC prereqs:
- Python 3.11+
- `uv` (`pip install uv`) — or click the "Install uv" button on the Spec Kit page
- Git

Projects are created in `~/SpecKitProjects/<name>`. Each project has `spec.md`, `plan.md`, `tasks.md` — edit them in the app or have your local LLM (Ollama / Hermes etc.) draft them with the **Generate with local LLM** button.

The agent can also drive Spec Kit from chat via the `spec_kit` skill: `[RUN_SKILL:spec_kit|init my-app]`.

### Hot-reload during development

`capacitor.config.ts` points `server.url` at the Lovable preview URL, so the Android app live-reloads from the sandbox while you iterate. For a final standalone APK that runs offline against bundled assets, remove the `server.url` block before building.

For a deeper guide see: https://lovable.dev/blog/2025-06-13-the-most-complete-guide-for-using-capacitor-with-lovable
