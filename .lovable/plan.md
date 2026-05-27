## Goal

Turn Pesto Steve's AI into an installable Progressive Web App so you can add it to your Galaxy S26 (or any phone) home screen from a browser — no Android Studio, no Capacitor build.

## Heads up

- PWA features (install prompt, service worker, offline shell) only work on the **published** Lovable URL or your own deployed URL, **not** inside the Lovable editor preview.
- This app talks to `localhost:11434` (Ollama) and `localhost:8484` (agent). On your phone those won't resolve — after install, go to **Settings** in the app and point Ollama URL + Agent URL to your PC's LAN IP (e.g. `http://192.168.1.50:11434`). Make sure Ollama is bound to `0.0.0.0` on the PC.
- Service worker will cache the app shell for offline launch, but chat/agent calls still need the LAN to be reachable.

## Changes

1. **Install `vite-plugin-pwa`** as a dev dependency.

2. **Update `vite.config.ts`** — add `VitePWA` plugin configured with:
   - `registerType: "autoUpdate"`
   - `devOptions: { enabled: false }` (avoid breaking the Lovable preview)
   - Manifest: name "Pesto Steve's AI", short_name "Pesto AI", theme color matching the green primary (`#2eb872`), dark background, `display: "standalone"`, icons 192/512 + maskable.
   - Workbox: `NetworkFirst` for HTML navigations, `navigateFallbackDenylist` for `/~oauth`.

3. **Add icons** to `public/`:
   - `pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png`, `apple-touch-icon.png` — generated from the existing app aesthetic (dark bg, green accent, "PS" or terminal glyph).

4. **Update `index.html`** — add `<link rel="apple-touch-icon">`, `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`, `<meta name="apple-mobile-web-app-status-bar-style">`.

5. **Register service worker safely** in `src/main.tsx`:
   - Skip registration when running inside an iframe or on `*.lovableproject.com` / `id-preview--*` hosts (prevents the Lovable editor from caching stale builds).
   - Otherwise auto-register via the plugin's virtual module.

6. **Create `/install` page** with simple instructions for iOS (Share → Add to Home Screen) and Android (browser menu → Install app), plus a button that triggers the `beforeinstallprompt` event when available. Wire route in `src/App.tsx` and add a sidebar link.

7. **Publish reminder** — after the change builds, hit **Publish** in Lovable. Then on your phone, open the published URL in Chrome (Android) or Safari (iOS) and install.

## How you'll install it (after this ships)

**Android (Chrome):** Open published URL → tap ⋮ menu → "Install app" / "Add to Home Screen".
**iOS (Safari):** Open published URL → tap Share → "Add to Home Screen".

It will then launch fullscreen from your home screen like a native app.
