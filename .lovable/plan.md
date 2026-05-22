# App Improvement Plan

You've got a solid foundation: Ollama + Python agent, permission gating, Hermes-style episodes/lessons, smart router, swarm (CrewAI), Glasswing, Understand-Anything, RAG, briefing, phone runner. The biggest leverage now is **closing the learning loop**, **tightening the agent loop**, and **making the app feel like one product** instead of 25 separate pages.

Below is grouped by impact. Each item is small enough to ship independently.

## 1. Make the Hermes loop actually *learn* (highest ROI)

Right now lessons are appended but never pruned, ranked, or evaluated. Episodes are keyword-matched (brittle). Improvements:

- **Embed episodes** with a local embedding model (`nomic-embed-text` via Ollama) and do cosine top-k instead of keyword match in `searchEpisodes`. Store vectors on the agent in `~/.pesto-ai/memory/episodes.jsonl`.
- **Lesson deduplication + scoring**: when `recordLesson` fires, embed the new lesson, compare against existing — if cosine > 0.85, increment a `hits` counter instead of appending. Decay unused lessons after N days.
- **Success episodes matter too**: currently only failures trigger reflection. Log a lesson on *recoveries* ("after X failed, Y worked") — those are the most valuable.
- **Per-tool memory slice**: `buildMemoryContext` should also pull the last 3 episodes for the *specific tool* the router predicts will fire, not just keyword matches on the request.
- **Lesson promotion to system prompt core**: lessons with `hits >= 5` get promoted into the always-on system prompt; the rest stay in retrieval.

## 2. Tighten the agent tool loop

- **Streaming tool results back into the same turn** instead of starting a new round — currently `MAX_TOOL_ROUNDS = 10` causes visible "thinking" pauses. Use a single rolling buffer.
- **Tool call schema validation** before execution: parse `[TAG:args]` with a strict grammar (zod) and reject malformed tags with a tight error fed straight to the model — saves a full round trip.
- **Parallel tool execution** when independent (e.g., `[READ_FILE]` + `[WEB_SEARCH]` in one reply) — `executeToolCommands` currently serializes.
- **Cancellation**: AbortController plumbed through `streamChat` → agent `/terminal` so the Stop button actually kills the running subprocess on the PC, not just the SSE stream.

## 3. Smart router upgrades

- **Latency-aware**: track per-model p50 first-token latency in localStorage, factor into `scoreModel` so a slightly weaker but 3× faster model wins for `simple`/`tool` tasks.
- **Auto-fallback chain**: if the chosen model returns a refusal pattern within the first 200 chars, transparently retry on the next-best candidate before showing the user.
- **Context-size routing**: classify prompt token estimate; route >8k prompts to models with `num_ctx >= 16k` automatically.
- **Add `vision` task kind** so image attachments route to a multimodal model (llava / qwen2.5-vl) instead of failing silently on text-only models.

## 4. Unify the 25 pages into one mental model

Right now Drana, Glasswing, Recon, Audit, Forensics, LabMode, Swarm, Understand, ComputerUse, Phone are each their own page. A new user can't tell them apart. Proposals:

- **Command palette (⌘K)** that searches across pages, tools, recent files, past episodes, and skills — one entry point.
- **"Workspaces" abstraction**: collapse Recon / Audit / Forensics / Glasswing / LabMode under a single "Security" workspace with tabs. Same for Drana / ComputerUse / Phone under "Control".
- **Persistent mission bar** across all pages showing: active swarm, running cron, last tool call, agent online status — so context isn't lost on navigation.

## 5. Reliability + observability

- **Agent health pill** in the header (green/yellow/red) polling `/health` every 10s, with a one-click "restart agent" via a known systemd/launchd hook.
- **Structured tool log page** (`/audit-log`): every tool tag with timestamp, args, outcome, duration, permission decision — already half-built via episodes, just needs a real viewer with filtering.
- **Error budget per tool**: if a tool fails > 3× in 5 min, auto-deny it and surface a banner ("WEB_FETCH disabled — last 4 calls timed out"). Re-enable on next success.
- **Sentry-style local error sink** writing to `~/.pesto-ai/errors.jsonl` so you can grep what broke last night.

## 6. Speed + perceived performance

- **Preload top-3 models** at app boot, not just the most recent — `warmOllamaModel` only warms one. Pre-warming the small router default + the user's last-used cuts cold start dramatically.
- **Optimistic UI for tool calls**: render the tag as a pill immediately with a spinner; replace with result. Currently the whole message waits.
- **Conversation virtualization**: long chats re-render every token. Wrap message list in `react-virtual` — fixes mobile jank.
- **Service worker** for static assets so the SPA loads instantly on the phone over LAN.

## 7. Mobile/phone polish

You're on a 384px viewport right now. Several pages overflow horizontally (Swarm, Drana, Glasswing). Quick wins:

- Convert tool panels to bottom-sheet drawers on `<md`.
- Make the sidebar a swipe-in drawer instead of pinned.
- Add Capacitor `Haptics` on tool execution + permission decisions — feels much more "real" on phone.

## 8. Security memory + permissions

- **Pattern-based rules**, not just exact-tag rules: allow `[WEB_FETCH:https://docs.*]` without prompting, but always ask on `[DELETE_FILE:*]`.
- **Time-boxed allows**: "allow for 1 hour" / "allow for this session" — common pattern that currently requires re-clicking.
- **Sensitive-arg redaction in episodes**: API keys, tokens, file contents > 1KB should be hashed in the episode log, not stored verbatim.

## 9. Knowledge graph + Understand integration

- Wire **Understand-Anything's knowledge graph as a RAG source** so chat can answer "where is auth handled?" by hitting the graph instead of grepping. One file: `src/lib/rag.ts` gains a `graphQuery` adapter.
- **Auto-rerun Understand** on file changes via the agent's existing file watcher — keep the graph fresh.

## 10. Small quality-of-life

- Global keyboard: `g s` → swarm, `g c` → chat, `/` → focus input.
- Export conversation as Markdown / share to phone via QR.
- "Replay episode" button on the Memory page — re-runs the exact tool sequence.
- Dark theme is great; add a true OLED-black variant for AMOLED phones.

---

## Suggested first batch (one PR each, in order)

1. **Embeddings-based episode retrieval** + lesson dedup — directly upgrades what you just built.
2. **Command palette (⌘K)** — instantly makes the app feel cohesive.
3. **Agent health pill + structured tool log viewer** — gives you eyes on what's happening.
4. **Latency-aware router + auto-fallback on refusal** — measurable speed/UX win.
5. **Pattern + time-boxed permission rules** — kills the most annoying repeated prompt.

Want me to start with #1 (the learning-loop upgrade, since it builds directly on the Hermes integration you just added), or pick a different one?