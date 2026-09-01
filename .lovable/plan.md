# ULTRON Orb — holographic home screen

Replace the planned hand-drawn JARVIS HUD with the real thing: port the open-source
[ULTRON Orb UI](https://github.com/SAGAR-TAMANG/ultron-by-sagar-builds) (MIT licence) into the app
as the landing screen.

It is an Iron Man–style holographic orb rendered in Three.js — layered wireframe shells, a spiral
inner core, floating code-text sprites, orbiting debris, dust particles, scan rings, and a
bloom + chromatic-aberration post-processing stack — with optional webcam hand-gesture control
via MediaPipe.

## What you get

- **`/` becomes the ULTRON orb screen.** Full-bleed 3D orb on black, with grain, scanline and
  vignette overlays and the `U.L.T.R.O.N.` HUD wordmark.
- **Mouse / touch:** drag to spin, scroll or pinch to zoom.
- **Hand gestures (optional):** press `G` or the on-screen button to enable the webcam. Pinch one
  hand and move to spin; pinch with both hands and spread/close to zoom. Camera is off by default
  and never auto-starts.
- **Keyboard:** `G` gestures, `R` reset view, `+` / `−` zoom.
- **An "ENTER SYSTEM" action** on the HUD takes you into the existing chat workspace, so the app
  stays fully reachable. Sidebar gets an "Ultron" entry to come back to the orb any time.

## Notes on your machine

The orb is a real WebGL scene with bloom post-processing. On the AM06 Pro it should be smooth at
1080p; the port keeps the renderer pixel-ratio capped and disposes the scene on unmount so leaving
the page costs nothing. Hand tracking downloads the MediaPipe model from a CDN on first use only.

## Technical details

- Add dependencies: `three`, `@types/three`, `@mediapipe/tasks-vision`.
- Port three source files from the repo, converted from Next.js to this Vite/React app:
  - `src/lib/orb-scene.ts` — from `lib/orbScene.ts`, unchanged logic. Its `three/addons/...`
    imports become `three/examples/jsm/...` (Vite has no Next.js `addons` alias).
  - `src/lib/hand-tracker.ts` — from `lib/handTracker.ts`, unchanged.
  - `src/components/UltronOrb.tsx` — from `components/JarvisOrb.tsx`, minus the `"use client"`
    directive, plus the ENTER SYSTEM link.
- Port `app/globals.css` into a scoped `src/styles/ultron.css` imported only by the orb component,
  so its `* { margin: 0 }` reset and fixed-position overlays cannot leak into the rest of the app.
- New `src/pages/UltronPage.tsx` rendering `UltronOrb` full-screen (no sidebar chrome).
- Routing in `src/App.tsx`: `/` → `UltronPage`; add `/chat` → `Index` (existing chat workspace);
  add `/ultron` → `UltronPage`. All other routes untouched.
- `src/components/AppSidebar.tsx`: add an "Ultron" nav item.
- Keep the MIT licence header/attribution comment at the top of each ported file.

## Out of scope

No changes to chat, swarm, memory, or any tool page. The orb is presentation only — it is not
wired to model status or agent telemetry in this pass.
