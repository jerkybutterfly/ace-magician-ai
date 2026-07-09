# Make Pesto AI fast and phone-friendly

Your biggest pain point is getting the app to run on your phone. The app is already a PWA and already has Capacitor scaffolding, but a few bugs and hardcoded `localhost` assumptions are breaking the mobile experience. This plan fixes those first, then lays out bigger upgrades.

## Phase 1 — Quick wins (ship today)

### 1. Fix the PWA service-worker guard
`src/main.tsx` currently unregisters the service worker on any `lovable.app` host. That kills the installed app on your published URL. It should only unregister in preview/dev/iframe contexts.

- Update the guard to match the PWA skill: skip registration when in an iframe, when the hostname starts with `id-preview--` / `preview--`, or ends with `lovableproject.com`, `lovableproject-dev.com`, or `beta.lovable.dev`, or when the URL has `?sw=off`.
- In refused contexts, unregister existing `/sw.js` registrations before returning.

**Files:** `src/main.tsx`

### 2. Stop hardcoding the agent URL on the system stats widget
`src/components/SystemStatsPanel.tsx` fetches `http://127.0.0.1:8484/system/stats` directly, so it always fails from a phone. Use `getSettings().agentUrl` like the rest of the app.

**Files:** `src/components/SystemStatsPanel.tsx`

### 3. Fix the nested `<button>` warning in the sidebar
The conversation delete icon is a `<button>` inside `SidebarMenuButton` (also a button). React logs a DOM-nesting error. Replace the inner button with a `<span role="button">` or use the Radix `asChild` pattern.

**Files:** `src/components/AppSidebar.tsx`

### 4. Back off background pollers when the agent is unreachable
`MissionPanel`, `SystemStatsPanel`, `SystemInfoPanel`, `notifications.ts`, and `phone-runner.ts` all poll the agent every 2–10 seconds. When the agent is down or the phone is on the wrong network, they spam failed fetches and drain battery.

- Add a small shared `useAgentReachable()` / `isAgentReachable()` helper that records the last success/failure.
- On first failure, increase the poll interval (e.g. 2s → 30s) and reset when a fetch succeeds or the page regains visibility.
- Silence expected "Failed to fetch" console noise.

**Files:** `src/lib/agent.ts` or new `src/lib/reachability.ts`, `src/components/MissionPanel.tsx`, `src/components/SystemStatsPanel.tsx`, `src/components/SystemInfo.tsx`, `src/lib/notifications.ts`, `src/lib/phone-runner.ts`

### 5. Don't force cloud models on mobile
`src/pages/Chat.tsx` switches the provider to `cloud` whenever `isMobile` is true. That bypasses your local Ollama even when your phone is on the same LAN as your PC.

- Remove the automatic override.
- Remember the last chosen provider per device.
- Keep the existing provider selector so you can still pick cloud manually.

**Files:** `src/pages/Chat.tsx`

### 6. Add "Test connection" buttons in Settings
The Ollama and Agent URL inputs already exist. Add inline test buttons that call `/api/tags` and `/system` and show a clear success/error toast. This makes mobile setup much faster.

**Files:** `src/pages/SettingsPage.tsx`

---

## Phase 2 — Bigger upgrades

### 7. Mobile-first navigation
The sidebar has ~30 items and is cramped on a phone.

- Collapse nav into grouped accordions (Core, Tools, System, Labs) on small screens.
- Keep the command palette as the primary mobile launcher (already bound to ⌘K / Ctrl+K).
- Optionally add a bottom action bar for Chat, Voice, and Command Palette on narrow viewports.

**Files:** `src/components/AppSidebar.tsx`, `src/pages/Index.tsx`

### 8. Central connection-health indicator
Replace silent failures with a single status chip in the header that shows:

- Agent reachable / unreachable
- Ollama reachable / unreachable
- Current network (localhost vs LAN vs cloud)

Clicking it opens Settings pre-focused on the connection section.

**Files:** new `src/components/ConnectionStatus.tsx`, `src/pages/Index.tsx`, `src/lib/reachability.ts`

### 9. Offline read-only cache
The PWA service worker is already configured, but the app itself has no offline UI.

- Cache the last N conversations and settings in `localStorage` / IndexedDB.
- When offline, show a subtle banner and allow reading history even if new messages can't be sent.
- Keep chat input disabled with an explanatory tooltip when Ollama/Agent is unreachable.

**Files:** `src/hooks/useConversations.ts`, `src/lib/conversations.ts`, `src/pages/Chat.tsx`

### 10. Reduce chat latency
`buildMemoryContext()` runs on every streamed request. With the new Hermes-style memory, this will get heavier over time.

- Cache the built memory context for the same objective for ~30 seconds.
- Warm the selected Ollama model immediately when the provider/model changes, not just on app startup.
- Ensure the chat abort controller is cleaned up correctly when the stream ends or is stopped.

**Files:** `src/lib/learning.ts`, `src/lib/ollama.ts`, `src/pages/Chat.tsx`

### 11. Optional native Android build path
Because Capacitor is already wired up, we can document/enable a true APK path:

- Add a dev-server URL to `capacitor.config.ts` for live-reload from the sandbox.
- Ensure `android/` is synced and `npx cap sync` works.
- Add a build script or note the steps: `npm run build`, `npx cap sync`, `npx cap run android`.

**Files:** `capacitor.config.ts`, `package.json` scripts, `README.md`

---

## Out of scope for now

- New AI models or cloud providers.
- Rewriting the permissions/learning systems (they work as-is).
- App Store / Play Store publishing pipeline.

## Suggested order

1. Merge Phase 1 in one go — it removes the blockers that stop the app from working on a phone.
2. Publish so you can test the installed PWA on your actual device.
3. Pick Phase 2 items based on what still feels slow or awkward after real-device testing.

If you want, I can start with Phase 1 immediately.