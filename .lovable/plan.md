

## Goal
Add three power-user features to the AM09 agent:
1. **MQTT bridge** — let the agent publish/subscribe to your Home Assistant / Zigbee2MQTT broker
2. **Network device scanner** — list everything on your LAN with vendor/hostname
3. **Local document RAG** — embed a folder of docs with `nomic-embed-text` (Ollama) and answer from them

All three live in the existing Python agent (`public/agent.py`) + a small frontend page each.

---

## 1. MQTT bridge

**Backend (`public/agent.py`)**
- Add `paho-mqtt` to requirements (documented in README install section).
- New config block in `agent_config.json`: `{ mqtt: { host, port, username, password, enabled } }`.
- Endpoints:
  - `GET /mqtt/config` / `POST /mqtt/config` — read/save broker settings (password stored as-is in local JSON; clearly local-only).
  - `POST /mqtt/connect` / `POST /mqtt/disconnect` — start/stop persistent client thread.
  - `GET /mqtt/status` — connected / last error / subscribed topics.
  - `POST /mqtt/publish` — `{ topic, payload, retain?, qos? }`.
  - `POST /mqtt/subscribe` — `{ topic }` (wildcards allowed). Persisted to config.
  - `DELETE /mqtt/subscribe` — `{ topic }`.
  - `GET /mqtt/messages?since=<ts>` — recent messages from subscribed topics (in-memory ring buffer of last 500).
- Background thread: on agent boot, if `mqtt.enabled`, auto-connect and re-subscribe.

**New tool tags** (auto-handled by existing tag runtime in `agent.py`)
- `[MQTT_PUBLISH:topic|payload]`
- `[MQTT_SUBSCRIBE:topic]`
- `[MQTT_RECENT:topic_filter]` — returns last N messages

**Frontend**
- New page `src/pages/MqttPage.tsx` — broker config form, connect/disconnect, subscribed topics list (add/remove), live message feed (polls `/mqtt/messages` every 2s), publish form.
- Sidebar entry "MQTT" in `AppSidebar.tsx` with `Radio` icon.
- Route in `src/pages/Index.tsx`.
- Helper module `src/lib/mqtt.ts` with typed fetch wrappers.
- Document the new tool tags in `src/lib/agent-tools.ts` and the system prompt in `src/lib/settings.ts`.

---

## 2. Network device scanner

**Backend (`public/agent.py`)**
- Use stdlib only — no new deps. Scanner uses an ARP-table read (`arp -a`) plus a parallel TCP-connect ping sweep on the local /24, then reverse-DNS lookup. Vendor lookup via a tiny embedded OUI prefix map (top 200 vendors, ~20KB); fall back to "Unknown".
- Endpoints:
  - `POST /network/scan` — kicks off a scan; returns `{ scan_id }`. Background task.
  - `GET /network/scan/:id` — `{ status: running|done, devices: [{ ip, mac, hostname, vendor, last_seen }] }`.
  - `GET /network/devices` — last completed scan results cached on disk (`network_scan.json`).
- New tool tag: `[SCAN_NETWORK]` — returns formatted table of devices.

**Frontend**
- New page `src/pages/NetworkPage.tsx` — "Scan now" button, progress indicator, sortable table (IP / hostname / MAC / vendor / last seen), filter input. Highlights new devices since previous scan (red badge).
- Sidebar entry "Network" with `Network` icon, route in `Index.tsx`.

---

## 3. Local document RAG

**Backend (`public/agent.py`)**
- Add deps: `chromadb` (or `sqlite-vec` — simpler, no extra service). Going with **`sqlite-vec`** — pure-SQLite vector search, zero infra, fits the self-hosted ethos. Document in README.
- New module embedded in `agent.py`:
  - `rag_db` — SQLite file `rag.db` with `documents(id, path, chunk_idx, text, mtime)` + `vec_documents` virtual table.
  - Embedder: calls Ollama `/api/embeddings` with `nomic-embed-text` (user must `ollama pull nomic-embed-text` once — surfaced in UI).
  - Chunking: 800 chars, 100 overlap. PDF via `pypdf`, DOCX via `python-docx`, plain text/MD/code direct, others skipped.
- Endpoints:
  - `GET /rag/sources` — list indexed folders + doc counts.
  - `POST /rag/sources` — `{ path, recursive }` adds a folder, kicks off background indexing.
  - `DELETE /rag/sources/:id` — remove folder + its embeddings.
  - `POST /rag/reindex/:id` — re-scan changed files (mtime check).
  - `GET /rag/index/status` — `{ active, current_file, processed, total }`.
  - `POST /rag/query` — `{ query, top_k=5 }` → `{ chunks: [{ path, text, score }] }`.

**New tool tag**
- `[RAG_QUERY:question]` — returns top 5 chunks with file paths. The model can quote from them in the response.

**Frontend**
- New page `src/pages/RagPage.tsx`:
  - "Add folder" form (path + recursive toggle).
  - List of indexed sources with doc count, "Re-index" and "Remove" buttons.
  - Indexing progress bar (polls `/rag/index/status`).
  - Test query box at the bottom — type a question, see top chunks.
  - Banner at top: if `nomic-embed-text` not installed, link to Local Models page with one-click pull instructions.
- Auto-inject RAG context into chat: in `src/pages/Chat.tsx`, before sending each user message, if any RAG sources exist, call `/rag/query` with the user's text and prepend the top 3 chunks to the system prompt as `[Relevant context from your documents: ...]`. Toggleable in Settings.
- Sidebar entry "Documents" with `BookOpen` icon, route in `Index.tsx`.
- Helper `src/lib/rag.ts`.
- Settings toggle: "Auto-augment chats with document context" in `SettingsPage.tsx`.

---

## Tool tag documentation
Update `src/lib/agent-tools.ts` and the `DEFAULT_SYSTEM_PROMPT` in `src/lib/settings.ts` to document:
- `[MQTT_PUBLISH:...]` `[MQTT_SUBSCRIBE:...]` `[MQTT_RECENT:...]`
- `[SCAN_NETWORK]`
- `[RAG_QUERY:...]`

---

## Files

**Backend**
- `public/agent.py` — MQTT subsystem, network scanner, RAG subsystem, new tool tags, new endpoints

**Frontend (new)**
- `src/pages/MqttPage.tsx`
- `src/pages/NetworkPage.tsx`
- `src/pages/RagPage.tsx`
- `src/lib/mqtt.ts`
- `src/lib/network.ts`
- `src/lib/rag.ts`

**Frontend (edited)**
- `src/components/AppSidebar.tsx` — three new nav entries
- `src/pages/Index.tsx` — three new routes
- `src/pages/Chat.tsx` — RAG context auto-augmentation hook
- `src/pages/SettingsPage.tsx` — RAG auto-augment toggle
- `src/lib/agent-tools.ts` — document new tool tags
- `src/lib/settings.ts` — extend system prompt with new tags

---

## Order of implementation
1. **Network scanner** — smallest, no new Python deps, instant value
2. **MQTT bridge** — adds `paho-mqtt`, well-isolated
3. **Local document RAG** — biggest; new deps (`sqlite-vec`, `pypdf`, `python-docx`), Ollama embed model required

---

## After it ships
1. **Network**: open the new "Network" page → click *Scan now* → see every device on your LAN.
2. **MQTT**: open "MQTT" page → enter broker host/port/credentials → connect → subscribe to `zigbee2mqtt/#` → start asking the agent things like *"turn off the office light"*.
3. **RAG**:
   - One-time: `ollama pull nomic-embed-text` (the Documents page shows a one-click button if missing).
   - Open "Documents" → add a folder (e.g. `C:\Users\Stephen Dunne\Documents\notes`) → wait for indexing.
   - In Settings, toggle *"Auto-augment chats with document context"*.
   - Ask the agent something only your docs would know — it'll quote them.

Python deps to add to README install instructions:
```
pip install paho-mqtt sqlite-vec pypdf python-docx
```

