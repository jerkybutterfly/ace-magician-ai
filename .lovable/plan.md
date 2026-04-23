

## Goal
Implement my top 3 picks: **Conversation search**, **Auto-skill creation**, and **Push notifications from agent** (web + Capacitor).

## 1. Conversation search
Full-text search across every past chat, accessible from the sidebar.

- New `<ConversationSearch />` component opened by a search icon next to the "+" in the History header (and `Ctrl/Cmd+K` shortcut).
- Built on existing `cmdk` (`src/components/ui/command.tsx`) — a `CommandDialog` listing matching conversations with the matched message snippet highlighted.
- Searches across `title` + every `message.content` in `localStorage` conversations. Case-insensitive, ranked by recency then match count.
- Clicking a result calls `onSelectConvo(id)` and closes the dialog.
- No backend needed — pure client-side over the existing `Conversation[]`.

**Files:** `src/components/ConversationSearch.tsx` (new), `src/components/AppSidebar.tsx` (wire in icon + shortcut), `src/pages/Index.tsx` (pass conversations through if needed).

## 2. Auto-skill creation
After the agent completes a successful multi-step tool sequence, offer to save it as a reusable skill.

- New `src/lib/skill-detector.ts`: tracks tool-call sequences per conversation. When the same ordered sequence of `[RUN_CMD]` / `[BROWSER_*]` / `[WRITE_FILE]` calls (normalized — args templated as `{{arg1}}`) appears **twice** across any conversations, surface a suggestion.
- Tracking persisted to `localStorage` under `skill-suggestions`.
- New `<SkillSuggestionToast />` shown in `Chat.tsx` after a successful agent turn — *"You've done this twice. Save as skill 'fetch_fixtures'?"* with **Save** / **Dismiss**.
- Save action posts a generated Python skill to `POST /skills` (already exists in `agent.py`). Template wraps the command sequence with `argparse` for the templated args.
- A new "Suggestions" tab on `SkillsPage.tsx` shows pending suggestions to review/accept/reject.

**Files:** `src/lib/skill-detector.ts` (new), `src/components/SkillSuggestionToast.tsx` (new), `src/pages/Chat.tsx` (hook detector into tool-call loop), `src/pages/SkillsPage.tsx` (Suggestions tab).

## 3. Push notifications from agent
Notify the user (browser + Android via Capacitor) when long-running tasks finish or cron jobs fire.

**Backend (`public/agent.py`)**
- New table-less `notifications` queue stored in JSON file `notifications.json`.
- `POST /notifications` — agent or cron jobs append `{title, body, ts, kind}`.
- `GET /notifications/poll?since=<ts>` — returns new entries since timestamp.
- Modify cron job runner to push a notification on each successful run (configurable per-job).
- Add `POST /notify` tool tag handler so the LLM can self-notify: `[NOTIFY title="Done" body="Build finished"]`.

**Frontend**
- New `src/lib/notifications.ts`:
  - On app load, request `Notification.permission`.
  - Long-poll `GET /notifications/poll` every 10s.
  - For each new entry: web `new Notification(...)` OR Capacitor `LocalNotifications.schedule(...)`.
- Detects Capacitor environment via `Capacitor.isNativePlatform()` — uses `@capacitor/local-notifications` plugin when available, falls back to Web Notifications API in browser.
- Add `@capacitor/local-notifications` to `package.json`.

**Settings panel addition (`SettingsPage.tsx`)**
- Toggle "Enable push notifications"
- Per-source toggles (Cron jobs, Long tool calls > 30s, Agent self-notify)
- "Test notification" button.

**Cron tag in tool docs (`src/lib/agent-tools.ts` / system prompt)**
- Document the new `[NOTIFY ...]` tag so the model knows it can ping the user.

**Files:** `public/agent.py` (notifications endpoints + cron hook + NOTIFY tag), `src/lib/notifications.ts` (new), `src/lib/agent.ts` (typed `pollNotifications` helper), `src/lib/agent-tools.ts` (document NOTIFY), `src/pages/SettingsPage.tsx` (toggles + test), `src/App.tsx` (start poller on mount), `package.json` (Capacitor plugin), `capacitor.config.ts` (notification permissions if needed).

## Order of implementation
1. Conversation search (smallest, pure frontend, instant value)
2. Push notifications (touches backend + frontend + Capacitor — biggest unlock)
3. Auto-skill creation (most logic-heavy, builds on existing skills system)

## After it ships
1. **Search**: press `Ctrl+K` anywhere to find old chats.
2. **Notifications**: visit Settings → enable push, click "Test notification" to grant permission. On Android, run `npx cap sync` after pulling.
3. **Auto-skills**: just use the agent normally — after the second time you do a similar task, a toast will offer to save it.

