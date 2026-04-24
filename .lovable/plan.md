

## Goal
Let the agent control your **Android phone** (the one running the Capacitor app) the same way it controls your AM09 PC — read sensors, trigger actions, run skills locally on the device.

## Approach
The Capacitor app already runs on your phone. We'll expose phone capabilities through Capacitor plugins, then wire them into the agent's tool-tag system so the LLM can call them. Two execution paths:

1. **Local tags** — when you chat from the phone itself, certain `[PHONE_*]` tags execute directly on the device via Capacitor.
2. **Remote tags** — when you chat from the PC (or anywhere), the phone long-polls a new `/phone/commands` queue on the AM09 agent and executes pending commands, posting results back. This means you can say *"text my wife I'll be late"* from your desk and the phone does it.

## Phone capabilities (Capacitor plugins)

| Capability | Plugin | Tool tag |
|---|---|---|
| Battery / charging state | `@capacitor/device` | `[PHONE_BATTERY]` |
| Device info (model, OS, storage) | `@capacitor/device` | `[PHONE_INFO]` |
| GPS location | `@capacitor/geolocation` | `[PHONE_LOCATION]` |
| Take photo / pick from gallery | `@capacitor/camera` | `[PHONE_CAMERA:front\|back]` |
| Read clipboard / write clipboard | `@capacitor/clipboard` | `[PHONE_CLIPBOARD_GET]` / `[PHONE_CLIPBOARD_SET:text]` |
| Local notification (already installed) | `@capacitor/local-notifications` | `[PHONE_NOTIFY:title\|body]` |
| Vibrate / haptics | `@capacitor/haptics` | `[PHONE_VIBRATE:ms]` |
| Open URL in browser | `@capacitor/browser` | `[PHONE_OPEN_URL:url]` |
| Share sheet (text/files to other apps) | `@capacitor/share` | `[PHONE_SHARE:title\|text\|url]` |
| Network status (wifi/cell, online) | `@capacitor/network` | `[PHONE_NETWORK]` |
| Screen brightness | `@capgo/capacitor-screen-brightness` | `[PHONE_BRIGHTNESS:0-1]` |
| Flashlight / torch | `@capacitor-community/torch` | `[PHONE_TORCH:on\|off]` |
| Text-to-speech (speak aloud) | `@capacitor-community/text-to-speech` | `[PHONE_SPEAK:text]` |
| Voice input (speech-to-text) | `@capacitor-community/speech-recognition` | `[PHONE_LISTEN:seconds]` |
| Send SMS (opens composer) | `@byteowls/capacitor-sms` | `[PHONE_SMS:number\|message]` |
| Make/dial phone call | `@byteowls/capacitor-sms` (call helper) or `tel:` URI | `[PHONE_CALL:number]` |
| Read contacts | `@capacitor-community/contacts` | `[PHONE_CONTACTS:query]` |
| Read calendar events | `@ebarooni/capacitor-calendar` | `[PHONE_CALENDAR:days]` |
| List installed apps | `@capacitor-community/app-list` (Android only) | `[PHONE_APPS]` |
| Launch another app | `@capacitor/app-launcher` | `[PHONE_LAUNCH:com.spotify.music]` |

All gated by your existing **Permissions** system — defaults: device info / battery / network = allow; camera / location / contacts / SMS / call = ask; nothing is denied outright.

## Architecture

```text
┌────────────┐   long-poll    ┌──────────────────┐
│  Phone     │ ──────────────▶│  AM09 agent.py   │
│ (Capacitor)│ ◀──────────────│  /phone/commands │
└─────┬──────┘    results     └─────────┬────────┘
      │                                  │
      │ executes via                     │ LLM emits
      │ Capacitor plugins                │ [PHONE_*] tags
      ▼                                  ▼
  Android APIs                      Chat / Cron / Skills
```

**Local mode**: when chatting *on* the phone, tags execute synchronously in the WebView via the same plugins — no round-trip needed.

## Backend (`public/agent.py`)
- New phone-bridge subsystem:
  - `POST /phone/register` — phone announces itself, gets a device id + auth token (stored in `agent_config.json`).
  - `GET /phone/commands?device_id=...` — long-poll, returns pending `[PHONE_*]` commands.
  - `POST /phone/results` — phone posts execution results (matched to command id).
  - `GET /phone/status` — last seen, battery, location (if shared).
- New tool-tag handlers route any `[PHONE_*]` tag through the queue, wait up to 30s for the result, return it inline to the chat.
- New endpoint `POST /phone/heartbeat` — phone posts battery/location every 60s; cached for the agent to read instantly.

## Frontend (web + Capacitor)
- **`src/lib/phone.ts`** — wraps every Capacitor plugin call behind a uniform `executePhoneTag(tag, args)` interface. Used in both local-execution mode and the remote command runner.
- **`src/lib/phone-runner.ts`** — only active on `Capacitor.isNativePlatform()`. Long-polls the AM09 agent for queued commands, executes them, posts results back. Started from `App.tsx`.
- **New page `src/pages/PhonePage.tsx`** — *"My Phone"*:
  - Pairing card: shows a QR code on PC; phone scans to register.
  - Status: paired devices with battery / last seen / location-share toggle.
  - Permissions matrix: per-capability on/off.
  - Test panel: buttons for *Take photo*, *Get location*, *Vibrate*, *Speak "hello"*, *Toggle torch* — proves the wiring end-to-end.
- **Sidebar entry** "Phone" with `Smartphone` icon.
- **Tool docs** updated in `src/lib/agent-tools.ts` and `DEFAULT_SYSTEM_PROMPT` (`src/lib/settings.ts`).
- **Permissions defaults** in `src/lib/permissions.ts` extended with sensible defaults for every `PHONE_*` tag.

## Capacitor plugins to install
```
@capacitor/device @capacitor/geolocation @capacitor/camera
@capacitor/clipboard @capacitor/haptics @capacitor/browser
@capacitor/share @capacitor/network @capacitor/app-launcher
@capacitor-community/text-to-speech @capacitor-community/speech-recognition
@capacitor-community/contacts @capacitor-community/torch
@capgo/capacitor-screen-brightness
```
SMS / Calendar / App-list have less reliable maintenance — included as optional, behind feature flags so the build never breaks if a plugin is missing.

## Files

**Backend**
- `public/agent.py` — phone bridge endpoints, command queue, `[PHONE_*]` tag dispatcher

**Frontend (new)**
- `src/lib/phone.ts` — Capacitor plugin wrappers + `executePhoneTag`
- `src/lib/phone-runner.ts` — long-poll command executor (native-only)
- `src/pages/PhonePage.tsx` — pairing, status, permissions, test panel

**Frontend (edited)**
- `src/App.tsx` — start `phone-runner` when on native platform
- `src/components/AppSidebar.tsx` — "Phone" nav entry
- `src/pages/Index.tsx` — `/phone` route
- `src/lib/agent-tools.ts` — document new `[PHONE_*]` tags
- `src/lib/settings.ts` — extend system prompt
- `src/lib/permissions.ts` — defaults for `PHONE_*`
- `package.json` — Capacitor plugin deps
- `capacitor.config.ts` — permission strings for iOS/Android

## Order of implementation
1. **Backend command queue + `/phone/*` endpoints** — foundation
2. **`phone.ts` + `phone-runner.ts` + `PhonePage.tsx` pairing** — minimal end-to-end with battery + location + notify
3. **Roll in remaining plugins** in batches (camera, clipboard, torch, TTS/STT, contacts, launcher) — each gated by permission

## After it ships
1. Open the app **on your phone**, go to **Phone** page → tap **Pair with this device**.
2. From your **PC**, open the same page → you'll see the phone listed with battery & last-seen.
3. Try from PC chat: *"What's my phone battery?"* → agent emits `[PHONE_BATTERY]` → result appears in chat.
4. Try: *"Where's my phone?"* → location shown on a small map.
5. Try: *"Make my phone speak: dinner is ready"* → TTS plays on the phone.
6. After pulling on Android: `npm install && npx cap sync`.

