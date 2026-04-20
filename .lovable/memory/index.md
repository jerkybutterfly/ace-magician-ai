# Memory: index.md
Updated: today

# Project Memory

## Core
Dark theme default. Green primary (142 60% 45%). Local AI assistant for AM06 Pro mini PC.
Ollama at localhost:11434. Python FastAPI agent at localhost:8484.
No backend/cloud — fully self-hosted, localStorage persistence.
Permission model: agent NEVER refuses. Every tool tag is gated by allow/ask/deny rules in src/lib/permissions.ts. "Ask" shows inline approve/deny in chat.
Hermes-style learning loop: episodes (action log) + lessons (auto-written from errors/denials) stored on PC at ~/.pesto-ai/memory/ via agent.py /memory/* endpoints. Lessons + top-3 keyword-matched past episodes injected into every system prompt by src/lib/learning.ts → buildMemoryContext.

## Memories
- [Architecture](mem://features/architecture) — Ollama chat UI + Python agent for PC control
