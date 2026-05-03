## Add more PHONE_* tags

Extend `src/lib/phone.ts` with new capability wrappers and register them in the `executePhoneTag` dispatcher. Update `src/pages/PhonePage.tsx` to document/test the new tags.

### New tags to add

Using already-available Capacitor plugins (no new installs needed for most):

1. **[PHONE_SCREENSHOT]** — `Screenshot` via `html2canvas` of the WebView (or note: limited). Skip if no plugin; use `MediaCapture` fallback.
2. **[PHONE_RECORD_AUDIO:seconds]** — record short audio via `@capacitor-community/voice-recorder` (new dep, optional).
3. **[PHONE_CONTACTS]** — list contacts (requires `@capacitor-community/contacts`, optional).
4. **[PHONE_SMS_SEND:number|message]** — open SMS composer via `sms:` URL (works with `Browser.open` / `AppLauncher`).
5. **[PHONE_CALL:number]** — `tel:` URL launcher.
6. **[PHONE_EMAIL:to|subject|body]** — `mailto:` launcher.
7. **[PHONE_FLASHLIGHT:on|off]** — implement using `MediaStream` torch constraint on rear camera (no plugin needed).
8. **[PHONE_BRIGHTNESS:0-100]** — only via `@capawesome-team/capacitor-screen-brightness` (optional plugin).
9. **[PHONE_KEEP_AWAKE:on|off]** — via `@capacitor-community/keep-awake` (optional).
10. **[PHONE_VOLUME]** — read system volume via `@capacitor-community/native-audio` (skip if heavy; expose stub).
11. **[PHONE_ORIENTATION]** — read screen orientation via `screen.orientation`.
12. **[PHONE_SENSORS]** — read accelerometer/gyro via `DeviceMotionEvent` for one sample.
13. **[PHONE_STORAGE]** — `navigator.storage.estimate()` for used/quota.
14. **[PHONE_LANG]** — `Device.getLanguageCode()`.
15. **[PHONE_BEEP:freq|ms]** — quick `AudioContext` oscillator (no plugin).
16. **[PHONE_LOCATION_WATCH:seconds]** — sample N positions and return path.
17. **[PHONE_FILE_LIST:path]** / **[PHONE_FILE_READ:path]** / **[PHONE_FILE_WRITE:path|content]** — via `@capacitor/filesystem` (already common).
18. **[PHONE_TOAST:message]** — via `@capacitor/toast`.
19. **[PHONE_DIALOG:message]** — via `@capacitor/dialog` prompt.
20. **[PHONE_QR_SCAN]** — stub unless `@capacitor-community/barcode-scanner` is added (optional).

### Implementation approach

- **No new dependencies by default** — implement the ones that work with already-installed Capacitor plugins (`@capacitor/device`, `geolocation`, `camera`, `clipboard`, `local-notifications`, `haptics`, `browser`, `share`, `network`, `app-launcher`) plus pure web APIs.
- Add `@capacitor/filesystem`, `@capacitor/toast`, `@capacitor/dialog`, `@capacitor/screen-orientation` (small, official) so those tags work out of the box.
- For optional plugins (contacts, voice-recorder, keep-awake, brightness, barcode), add wrappers that gracefully return "plugin not installed" so the dispatcher is complete and the user can `npm i` later.
- Implement `PHONE_FLASHLIGHT` using `getUserMedia` with `torch: true` constraint — no plugin needed.

### Files

- **Edit** `src/lib/phone.ts` — add ~20 new wrappers and switch cases.
- **Edit** `src/pages/PhonePage.tsx` — add the new tags to the visible reference/tester list (one row per tag with a "Try" button if running on phone).
- **Edit** `package.json` (via `bun add`) — `@capacitor/filesystem @capacitor/toast @capacitor/dialog @capacitor/screen-orientation`.

After install, user runs `npx cap sync` once on their machine.

### Out of scope

- Native call-log / SMS read (Android-restricted, requires custom plugin and Play Store policy review).
- Background location / geofencing (needs separate runner work).
