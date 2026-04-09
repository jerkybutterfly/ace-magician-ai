
Goal: fix the persistent LM Studio “Failed to fetch” experience and make the app clearly support the two real connection modes.

What I found
- The LM Studio client code is already wired to call the configured URL directly from the browser:
  - `src/lib/ollama.ts` uses `fetch(${lmStudioUrl}/v1/models)` and `fetch(${lmStudioUrl}/v1/chat/completions)`.
- Your hosted preview is running on HTTPS, but your LM Studio server is local HTTP (`http://192.168.0.239:1234`).
- The captured network logs show repeated browser-side failures from the hosted preview origin to `http://192.168.0.239:1234/...` with `Error: Failed to fetch`.
- Your session replay also shows the Agent URL is currently set to an LM Studio endpoint (`http://192.168.0.239:1234/api/v1/models`), which explains why the sidebar says the local agent is unavailable too. LM Studio and Agent are two different services.

Likely root cause
- This is primarily a browser/network limitation, not just “LM Studio isn’t running”.
- The app’s current error copy is misleading because it treats all LM Studio failures as if the server is off.
- There is also a settings mix-up: Agent URL is pointed at LM Studio instead of the Python agent.

Implementation plan

1. Improve LM Studio error detection and messaging
- Update `src/lib/ollama.ts` to throw more descriptive errors for:
  - generic network failure
  - no models loaded
  - empty model selection
- Update `src/pages/Chat.tsx` catch handling so LM Studio errors explain the real causes:
  - hosted preview cannot always reach local HTTP services
  - use the LAN IP only when self-hosting on the same network
  - confirm a model is loaded in LM Studio
- Replace the current generic hint:
  - from: “Make sure LM Studio is running with the local server enabled.”
  - to something like: “Couldn’t reach LM Studio from this browser. If you’re using the hosted preview, local HTTP services may be blocked. If self-hosting locally, use your LM Studio LAN URL and ensure a model is loaded.”

2. Add visible connection guidance in Settings
- Update the LM Studio help text in `src/pages/SettingsPage.tsx` to distinguish:
  - local/self-hosted app usage
  - hosted Lovable preview usage
- Add a small warning block under LM Studio Configuration explaining:
  - LM Studio works best when the app is opened from the same PC/local network
  - the hosted preview may not be able to call local HTTP endpoints
  - a loaded model is required in LM Studio’s Local Server
- Keep the existing URL field, but make the instructions much clearer.

3. Prevent confusing empty-model states in Chat
- In `src/pages/Chat.tsx`, disable sending with provider `lmstudio` when:
  - no LM Studio models were fetched, or
  - no model is selected
- Show a compact inline status near the model select:
  - “No LM Studio models detected”
  - “Load a model in LM Studio first”
- This avoids sending a chat request that is guaranteed to fail.

4. Make model fetching more user-friendly
- Add loading/error state around the LM Studio model dropdown in Chat, similar to the Ollama selector pattern in `src/components/ModelSelector.tsx`.
- Optionally add a refresh button for LM Studio models.
- Surface a provider-specific status instead of silently setting `[]` on fetch failure.

5. Fix the settings confusion between LM Studio and Agent
- Update Settings copy so the Agent section explicitly says it must point to the Python agent, not LM Studio.
- Example guidance:
  - LM Studio URL: `http://192.168.0.239:1234`
  - Agent URL: `http://<your-pc-ip>:8484`
- This should reduce the “local agent unavailable” false trail you’ve been hitting.

Technical details
```text
Current architecture
Browser -> LM Studio direct fetch -> local HTTP endpoint
Browser -> Agent direct fetch -> local HTTP endpoint

Problem in hosted preview
HTTPS preview origin -> local HTTP service
=> often blocked / unreachable from browser
=> reported as generic "Failed to fetch"
```

Files to update
- `src/lib/ollama.ts`
- `src/pages/Chat.tsx`
- `src/pages/SettingsPage.tsx`

Expected result
- The app will stop implying LM Studio simply isn’t running.
- It will clearly explain when the issue is browser/network reachability versus model-loading versus URL misconfiguration.
- It will also stop the separate Agent URL confusion that is currently making Settings look more broken than it is.

Notes specific to your current setup
- LM Studio URL should be your LM Studio server, e.g. `http://192.168.0.239:1234`
- Agent URL should be your Python agent, e.g. `http://192.168.0.239:8484`
- They should not point to the same service.
