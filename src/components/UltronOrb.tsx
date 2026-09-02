/*
 * ULTRON Orb — Iron Man-inspired holographic orb.
 * Ported from https://github.com/SAGAR-TAMANG/ultron-by-sagar-builds
 * MIT License, Copyright (c) 2026 Sagar Tamang.
 */
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { createOrbScene, type OrbSceneApi } from "@/lib/orb-scene";
import "@/styles/ultron.css";
import { HandTracker, type TrackerStatus } from "@/lib/hand-tracker";
import { sendToChat } from "@/lib/chat-bus";
import { loadConversations } from "@/lib/conversations";
import { createRecognizer, speak, stopSpeaking, primeVoices } from "@/lib/ultron-voice";

type CameraState = "off" | "starting" | "on" | "error";

const MODE_LABEL: Record<TrackerStatus["mode"], string> = {
  idle: "STANDBY",
  spin: "SPIN",
  zoom: "ZOOM",
};

const QUICK_COMMANDS: { label: string; text: string }[] = [
  { label: "STATUS", text: "Give me a concise system status: models loaded, agent health, and any active jobs." },
  { label: "SCAN NET", text: "[RUN_CMD:nmap -sn 192.168.1.0/24]" },
  { label: "BRIEFING", text: "Produce my daily briefing." },
  { label: "MEMORY", text: "Summarize what you've learned about me recently from memory." },
];

export default function UltronOrb() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<OrbSceneApi | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);

  const [command, setCommand] = useState("");
  const [lastResponse, setLastResponse] = useState<string>("");
  const [camera, setCamera] = useState<CameraState>("off");
  const [status, setStatus] = useState<TrackerStatus>({ hands: 0, mode: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [micState, setMicState] = useState<"off" | "listening" | "error">("off");
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);
  const recognizerRef = useRef<any>(null);
  const spokenRef = useRef<string>("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = createOrbScene(container);
    sceneRef.current = scene;
    return () => {
      trackerRef.current?.stop();
      trackerRef.current = null;
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Poll conversations for the latest assistant reply so the orb echoes chat responses.
  useEffect(() => {
    const read = () => {
      try {
        const convos = loadConversations();
        if (!convos.length) return;
        const currentId = localStorage.getItem("local-ai-current-convo");
        const convo =
          convos.find((c) => c.id === currentId) ?? convos[convos.length - 1];
        const lastAssistant = [...convo.messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.content?.trim());
        if (lastAssistant) setLastResponse(lastAssistant.content);
      } catch {
        /* ignore */
      }
    };
    read();
    const id = window.setInterval(read, 1500);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("local-ai-")) read();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dispatchToChat = useCallback(
    (text: string, opts?: { stay?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      sendToChat({ text: trimmed, autorun: true });
      setCommand("");
      if (!opts?.stay) navigate("/chat");
    },
    [navigate],
  );

  const stopGestures = useCallback(() => {
    trackerRef.current?.stop();
    trackerRef.current = null;
    setCamera("off");
    setStatus({ hands: 0, mode: "idle" });
  }, []);

  const startGestures = useCallback(async () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || trackerRef.current) return;

    setCamera("starting");
    setError(null);

    const tracker = new HandTracker(video, overlay, {
      onRotate: (dt, dp) => sceneRef.current?.rotateBy(dt, dp),
      onZoom: (factor) => sceneRef.current?.zoomBy(factor),
      onStatus: setStatus,
    });
    trackerRef.current = tracker;

    try {
      await tracker.start();
      setCamera("on");
    } catch (err) {
      trackerRef.current = null;
      tracker.stop();
      setCamera("error");
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "CAMERA ACCESS DENIED"
          : "TRACKING INIT FAILED",
      );
    }
  }, []);

  const toggleGestures = useCallback(() => {
    if (trackerRef.current) stopGestures();
    else void startGestures();
  }, [startGestures, stopGestures]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "+":
        case "=":
          sceneRef.current?.zoomIn();
          break;
        case "-":
        case "_":
          sceneRef.current?.zoomOut();
          break;
        case "r":
        case "R":
          sceneRef.current?.resetView();
          break;
        case "g":
        case "G":
          toggleGestures();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleGestures]);

  const cameraOn = camera === "on";

  return (
    <div className="ultron-root">
      <div ref={containerRef} className="orb-root" />

      <div className="overlay-vignette" />
      <div className="overlay-grain" />
      <div className="overlay-scanlines" />

      <div className="hud hud-title">U.L.T.R.O.N.</div>

      <form
        className="hud hud-command"
        onSubmit={(e) => {
          e.preventDefault();
          dispatchToChat(command);
        }}
      >
        <div className="cmd-row">
          <input
            className="cmd-input"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Speak to Ultron — routed to chat…"
            aria-label="Command"
          />
          <button type="submit" className="hud-btn" aria-label="Send to chat">
            SEND →
          </button>
        </div>
        <div className="cmd-quick">
          {QUICK_COMMANDS.map((q) => (
            <button
              key={q.label}
              type="button"
              className="cmd-chip"
              onClick={() => dispatchToChat(q.text)}
              title={q.text}
            >
              {q.label}
            </button>
          ))}
          <button
            type="button"
            className="cmd-chip"
            onClick={() => dispatchToChat(command || "Continue.", { stay: true })}
            title="Send without leaving the orb"
          >
            QUEUE (STAY)
          </button>
        </div>
      </form>

      <div className="hud hud-response" aria-live="polite">
        <div className="hud-response-label">LAST TRANSMISSION</div>
        {lastResponse ? (
          lastResponse.length > 1200 ? lastResponse.slice(-1200) : lastResponse
        ) : (
          <span className="hud-response-empty">Awaiting reply from chat…</span>
        )}
      </div>

      <div className="hud hud-hint">
        <div>
          <span className="key">DRAG</span> spin&nbsp;&nbsp;
          <span className="key">SCROLL</span> zoom
        </div>
        {cameraOn ? (
          <div>
            <span className="key">PINCH + MOVE</span> spin&nbsp;&nbsp;
            <span className="key">PINCH BOTH HANDS ± SPREAD</span> zoom
          </div>
        ) : (
          <div>
            <span className="key">G</span> hand gestures&nbsp;&nbsp;
            <span className="key">R</span> reset&nbsp;&nbsp;
            <span className="key">+/−</span> zoom
          </div>
        )}
      </div>

      <div className="hud hud-controls">
        <div className={`camera-panel${cameraOn ? " visible" : ""}`}>
          {/* Mirrored preview so it behaves like a mirror */}
          <video ref={videoRef} muted playsInline className="camera-video" />
          <canvas ref={overlayRef} width={208} height={156} className="camera-overlay" />
          <div className="camera-status">
            {status.hands > 0
              ? `${status.hands} HAND${status.hands > 1 ? "S" : ""} · ${MODE_LABEL[status.mode]}`
              : "SHOW HANDS"}
          </div>
        </div>

        {error && <div className="hud-error">{error}</div>}

        <div className="hud-row">
          <button
            type="button"
            className="hud-btn"
            aria-pressed={cameraOn}
            onClick={toggleGestures}
            disabled={camera === "starting"}
          >
            {camera === "starting" ? "INITIALIZING…" : cameraOn ? "GESTURES ON" : "GESTURES OFF"}
          </button>
        </div>
        <div className="hud-row">
          <button type="button" className="hud-btn" onClick={() => sceneRef.current?.zoomIn()} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="hud-btn" onClick={() => sceneRef.current?.zoomOut()} aria-label="Zoom out">
            −
          </button>
          <button type="button" className="hud-btn" onClick={() => sceneRef.current?.resetView()}>
            RESET
          </button>
        </div>
      </div>

      <div className="hud hud-enter">
        <Link to="/chat" className="hud-btn">ENTER SYSTEM →</Link>
      </div>
    </div>
  );
}
