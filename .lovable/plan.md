

# Wrap App as Native Android (Capacitor) — Keep Web App for PC

## Goal
Add Capacitor so you get a true native Android APK installable on your S26 Ultra, while the existing web app continues to work unchanged on PC. Same codebase, two delivery targets.

## Approach

Capacitor wraps the existing React build in a native Android shell. No code is removed — the PC web app keeps working exactly as today. The Android app loads the same UI but runs as a real installable app.

To avoid maintaining two UIs, we'll use **runtime detection** (`Capacitor.isNativePlatform()`) for the few places where mobile vs PC behavior should differ (e.g. default agent URL — PC uses `localhost`, phone needs your PC's LAN IP).

## Changes

### 1. Install Capacitor
- `@capacitor/core`, `@capacitor/cli` (dev), `@capacitor/android`

### 2. Initialize Capacitor (`capacitor.config.ts`)
- `appId`: `app.lovable.dd929543953e496bb868520995a0352c`
- `appName`: `Pesto Steve's AI`
- `webDir`: `dist`
- `server.url`: `https://dd929543-953e-496b-b868-520995a0352c.lovableproject.com?forceHideBadge=true` + `cleartext: true` for hot-reload during dev
- Note: for the final installable APK that talks to your home PC, you'll later swap `server.url` to point at the production build (or remove it to use bundled assets).

### 3. Mobile-aware defaults (`src/lib/settings.ts`)
- Detect native platform via `Capacitor.isNativePlatform()`
- When running on Android, default `ollamaUrl` / `agentUrl` / `lmStudioUrl` to a placeholder LAN IP (e.g. `http://192.168.1.50:11434`) instead of `localhost`, since `localhost` on the phone = the phone itself, not your PC
- PC behavior unchanged

### 4. Settings page hint (`src/pages/SettingsPage.tsx`)
- Small banner shown only on native: "Running on Android — point these URLs at your PC's LAN IP, not localhost"

### 5. Mobile UX sanity (current viewport is 384px)
- Verify sidebar auto-collapses (already handled by `use-mobile` hook + sidebar component) — no changes expected, just confirm
- No layout rewrites — keep the desktop UI

### 6. Build & run instructions (README section)
Document the standard Capacitor flow you'll run locally after exporting to GitHub:
1. `git pull` your exported repo
2. `npm install`
3. `npx cap add android`
4. `npm run build`
5. `npx cap sync`
6. `npx cap run android` (needs Android Studio)

## Files Modified / Added
- `package.json` — add Capacitor deps
- `capacitor.config.ts` — new
- `src/lib/settings.ts` — native-aware defaults
- `src/pages/SettingsPage.tsx` — native banner
- `README.md` — Android build steps

## What Stays the Same
- Web app at the preview/published URL — unchanged, still works on PC
- Python agent + Ollama — still run on your PC; phone connects over LAN
- All existing features (chat, terminal, files, skills, cron, mission, chain-of-thought)

## After Approval
Once built and exported to GitHub, you'll run `npx cap add android` + `npx cap run android` on a machine with Android Studio to produce the APK for your S26 Ultra. I'll include exact commands. Per Capacitor guidance, also read: https://lovable.dev/blog/2025-06-13-the-most-complete-guide-for-using-capacitor-with-lovable

