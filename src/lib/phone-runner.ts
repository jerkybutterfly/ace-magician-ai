// Phone runner — only active inside the Capacitor app on a real device.
// Long-polls the AM09 agent for queued [PHONE_*] commands, executes them
// locally via Capacitor plugins, and posts results back.

import { getSettings } from './settings';
import { executePhoneTag, isPhone } from './phone';

const DEVICE_ID_KEY = 'phone-device-id';
const HEARTBEAT_MS = 60_000;
const POLL_MS = 5_000;

interface QueuedCommand {
  id: string;
  tag: string;
}

let started = false;

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    const randomStr = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).substring(2, 10);
    id = `phone-${randomStr}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function register(deviceId: string): Promise<void> {
  const { agentUrl } = getSettings();
  try {
    await fetch(`${agentUrl}/phone/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, name: navigator.userAgent.slice(0, 80) }),
    });
  } catch {}
}

async function poll(deviceId: string): Promise<{ commands: QueuedCommand[]; ok: boolean }> {
  const { agentUrl } = getSettings();
  try {
    const r = await fetch(`${agentUrl}/phone/commands?device_id=${encodeURIComponent(deviceId)}`);
    if (!r.ok) return { commands: [], ok: false };
    const j = await r.json();
    return { commands: Array.isArray(j.commands) ? j.commands : [], ok: true };
  } catch { return { commands: [], ok: false }; }
}

async function postResult(deviceId: string, id: string, ok: boolean, output: string): Promise<void> {
  const { agentUrl } = getSettings();
  try {
    await fetch(`${agentUrl}/phone/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, command_id: id, ok, output }),
    });
  } catch {}
}

async function heartbeat(deviceId: string): Promise<boolean> {
  const { agentUrl } = getSettings();
  try {
    let battery: number | null = null;
    let charging = false;
    try {
      const { Device } = await import('@capacitor/device');
      const b = await Device.getBatteryInfo();
      battery = b.batteryLevel != null ? Math.round(b.batteryLevel * 100) : null;
      charging = !!b.isCharging;
    } catch {}
    const res = await fetch(`${agentUrl}/phone/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, battery, charging, ts: Date.now() }),
    });
    return res.ok;
  } catch { return false; }
}

export function startPhoneRunner(): void {
  if (started || !isPhone()) return;
  started = true;
  const deviceId = getOrCreateDeviceId();

  void register(deviceId);
  void heartbeat(deviceId);

  setInterval(() => void heartbeat(deviceId), HEARTBEAT_MS);

  let pollMs = POLL_MS;
  const maxPollMs = 60_000;

  window.addEventListener('online', () => { pollMs = POLL_MS; });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pollMs = POLL_MS; });

  const loop = async () => {
    while (true) {
      const { commands, ok } = await poll(deviceId);
      if (commands.length === 0) {
        pollMs = ok ? POLL_MS : Math.min(pollMs * 2, maxPollMs);
      }
      for (const c of commands) {
        const res = await executePhoneTag(c.tag);
        await postResult(deviceId, c.id, res.ok, res.output);
      }
      await new Promise(r => setTimeout(r, pollMs));
    }
  };
  void loop();
}
