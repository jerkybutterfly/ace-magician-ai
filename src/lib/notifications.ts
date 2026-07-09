import { getSettings } from './settings';

export interface AgentNotification {
  title: string;
  body: string;
  ts: number;
  kind?: string;
}

const SETTINGS_KEY = 'notification-settings';
const LAST_TS_KEY = 'notification-last-ts';

export interface NotificationSettings {
  enabled: boolean;
  cron: boolean;
  selfNotify: boolean;
  longTools: boolean;
}

const DEFAULTS: NotificationSettings = {
  enabled: false,
  cron: true,
  selfNotify: true,
  longTools: true,
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveNotificationSettings(s: NotificationSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function isCapacitorNative(): boolean {
  try {
    // @ts-expect-error - optional global
    return Boolean(window?.Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isCapacitorNative()) {
    try {
      const mod = await import('@capacitor/local-notifications');
      const res = await mod.LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } catch {
      return false;
    }
  }
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

export async function showNotification(n: { title: string; body: string }): Promise<void> {
  if (isCapacitorNative()) {
    try {
      const mod = await import('@capacitor/local-notifications');
      await mod.LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 2_000_000_000),
          title: n.title,
          body: n.body,
          schedule: { at: new Date(Date.now() + 100) },
        }],
      });
      return;
    } catch {
      // fall through to web
    }
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(n.title, { body: n.body });
  }
}

export async function pollNotifications(since: number): Promise<AgentNotification[]> {
  const url = `${getSettings().agentUrl}/notifications/poll?since=${since}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function postNotification(title: string, body: string, kind = 'manual'): Promise<void> {
  const url = `${getSettings().agentUrl}/notifications`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, kind }),
    });
  } catch {
    // best-effort
  }
}

let pollerInterval: ReturnType<typeof setInterval> | null = null;

export function startNotificationPoller(intervalMs = 10_000): void {
  if (pollerInterval) return;
  // initialize last-ts to now so we don't replay old notifications
  if (!localStorage.getItem(LAST_TS_KEY)) {
    localStorage.setItem(LAST_TS_KEY, String(Date.now() / 1000));
  }

  let currentInterval = intervalMs;
  const maxInterval = 60_000;

  const schedule = () => {
    if (pollerInterval) clearInterval(pollerInterval);
    pollerInterval = setInterval(tick, currentInterval);
  };

  const tick = async () => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    const since = parseFloat(localStorage.getItem(LAST_TS_KEY) || '0');
    try {
      const items = await pollNotifications(since);
      currentInterval = intervalMs; // success — reset backoff
      if (!items.length) return;
      let maxTs = since;
      for (const item of items) {
        if (item.ts > maxTs) maxTs = item.ts;
        // filter by per-source toggles
        if (item.kind === 'cron' && !settings.cron) continue;
        if (item.kind === 'self' && !settings.selfNotify) continue;
        if (item.kind === 'tool' && !settings.longTools) continue;
        await showNotification({ title: item.title, body: item.body });
      }
      localStorage.setItem(LAST_TS_KEY, String(maxTs));
    } catch {
      currentInterval = Math.min(currentInterval * 2, maxInterval);
    }
    schedule();
  };

  const reset = () => {
    currentInterval = intervalMs;
    schedule();
  };

  window.addEventListener('online', reset);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) reset();
  });

  void tick();
  schedule();
}

export function stopNotificationPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}
