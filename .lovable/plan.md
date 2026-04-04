

## Local AI Assistant — Chat UI + Command API

### Overview
A self-hosted AI assistant web interface that connects to your local Ollama instance, with a companion Python API server you'll run on your AM06 Pro for PC control capabilities.

### Part 1: Web Chat UI (Built in Lovable)

**Chat Interface**
- Dark-themed, clean chat UI (similar to ChatGPT/Claude)
- Markdown rendering for AI responses with syntax highlighting
- Model selector dropdown — pulls available models from your Ollama instance
- Conversation history stored in localStorage
- Streaming responses from Ollama for real-time token display

**Ollama Integration**
- Connects directly to `http://localhost:11434` (configurable)
- Settings panel to change Ollama host URL, default model, and system prompt
- Model management — see which models are loaded

**PC Control Panel (sidebar)**
- Terminal widget — send commands, see output inline in chat
- File browser — navigate, view, and manage files
- System info dashboard — CPU, RAM, disk usage from the local agent
- AI can suggest and execute commands with user approval

### Part 2: Local Python Agent (Scaffold/Guide)
I'll generate a ready-to-run Python FastAPI server script that you'll run on your mini PC alongside Ollama:

- **Terminal endpoint** — execute shell commands, return output
- **File operations** — list, read, write, delete files
- **System info** — CPU/RAM/disk stats via `psutil`
- **Safety features** — command allowlist/blocklist, confirmation required for destructive ops
- The web UI communicates with this agent via REST API

### Pages
1. **Chat** — Main conversation view with Ollama
2. **Settings** — Configure Ollama URL, agent URL, default model, system prompt
3. **Files** — File browser powered by the local agent

### User Flow
1. Start Ollama on your mini PC (`ollama serve`)
2. Run the Python agent (`python agent.py`)
3. Open the web UI in your browser
4. Chat with your AI — it can also execute commands via the agent when you approve

