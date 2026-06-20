# Hermes-style learning on every Q&A

The agent already has a memory loop (episodes + lessons + injection into every prompt via `src/lib/learning.ts`), but it only fires when a tool runs. This plan extends it so **every chat turn** teaches the system, with local-LLM reflection and an auto-growing user profile.

## What changes

1. **Log every Q&A as an episode** — not just tool runs.
2. **Local-LLM reflection on every reply** — Ollama writes a 1-line generalized rule (when one exists) and appends it to lessons. Empty/“no lesson” outputs are skipped so the lessons file stays signal-dense.
3. **Auto-grown user profile** — a new `profile.md` (stored via the agent's `/memory/*` endpoints) is updated with stable facts (name, preferences, projects, tools used, recurring goals) extracted by the local LLM. Injected into every system prompt alongside Identity + Lessons.
4. **Memory page gains a "Profile" tab** to view/edit/clear the auto-profile.

## Files

- `src/lib/learning.ts`
  - Add `logChatTurn({ userMsg, assistantMsg })` → calls `logEpisode` with `tag="[CHAT]"`, `tool="chat"`, outcome `success`.
  - Add `reflectChatTurn(userMsg, assistantMsg)` → prompts local LLM for one short lesson OR the literal string `NONE`; if not NONE, `recordLesson(...)`.
  - Add profile helpers: `getProfile()`, `updateProfileFromTurn(userMsg, assistantMsg)`, `overwriteProfile()`, `clearProfile()` hitting new agent endpoints `/memory/profile` (GET/PUT/DELETE) and reusing the same file convention as lessons.
  - Extend `buildMemoryContext` to also include `--- ABOUT THE USER ---\n{profile}` block.
- `agent.py`
  - Add `/memory/profile` GET/PUT/DELETE storing `~/.pesto-ai/memory/profile.md` (mirrors existing lessons endpoints — no schema changes).
- `src/pages/Chat.tsx`
  - After each assistant reply completes (success path, not aborted), fire-and-forget: `logChatTurn(...)`, `reflectChatTurn(...)`, `updateProfileFromTurn(...)`. All three are non-blocking and swallow errors.
- `src/pages/MemoryPage.tsx`
  - Add a 4th tab **Profile** with view/edit/clear (mirrors the Lessons tab UI).

## Reflection prompts (kept tiny so Ollama is fast)

- Lesson prompt: *"Given this user request and the assistant's answer, write ONE short generalized rule the assistant should remember for future similar requests, starting with 'Always', 'Never', or 'When'. If nothing useful can be learned, reply with exactly: NONE."*
- Profile prompt: *"Extract any stable facts about the USER from this turn (name, role, preferences, tools, projects, locations, habits). Reply with bullet lines like '- prefers X'. If none, reply NONE."* Each new bullet is appended to `profile.md`, deduped by exact-line match.

## Guardrails

- Only learn when the assistant actually produced a reply (skip aborted/error streams).
- Skip turns where user message is shorter than 3 chars or is a slash-command.
- Cap profile at 200 lines; oldest trimmed.
- All three async writes wrapped in try/catch — they never block the chat UI.

## Out of scope

- No new model, no cloud dependency — uses the existing Ollama default model.
- No changes to the permissions system, tool tags, or existing episode logging on tool runs.
