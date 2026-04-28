// Daily Briefing — gathers context (weather, MQTT, phone, system) and asks
// the local LLM to write a friendly morning summary, then delivers it.

import { getSettings } from './settings';
import { postNotification, showNotification } from './notifications';
import { getMqttMessages } from './mqtt';
import { phoneBattery, phoneLocation, phoneNotify, phoneSpeak, isPhone } from './phone';
import { streamChat } from './ollama';

export interface BriefingSettings {
  enabled: boolean;
  hour: number;          // 0-23, local time
  minute: number;        // 0-59
  city: string;          // for weather
  sections: {
    weather: boolean;
    mqtt: boolean;
    phone: boolean;
    system: boolean;
    custom: string;      // free-text extra instructions
  };
  delivery: {
    pcNotify: boolean;
    phoneNotify: boolean;
    speak: boolean;
  };
  model: string;         // LLM model to summarize with (Ollama)
}

export interface BriefingEntry {
  ts: number;
  text: string;
  sections: Record<string, string>;
}

const SETTINGS_KEY = 'daily-briefing-settings';
const HISTORY_KEY = 'daily-briefing-history';
const LAST_RUN_KEY = 'daily-briefing-last-run';

export const DEFAULT_BRIEFING_SETTINGS: BriefingSettings = {
  enabled: false,
  hour: 8,
  minute: 0,
  city: 'Dublin',
  sections: {
    weather: true,
    mqtt: true,
    phone: true,
    system: true,
    custom: '',
  },
  delivery: {
    pcNotify: true,
    phoneNotify: true,
    speak: false,
  },
  model: '',
};

export function getBriefingSettings(): BriefingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_BRIEFING_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_BRIEFING_SETTINGS;
}

export function saveBriefingSettings(s: BriefingSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function getBriefingHistory(): BriefingEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function pushHistory(entry: BriefingEntry): void {
  const hist = getBriefingHistory();
  hist.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 30)));
}

// ---------- Data collectors ----------

async function fetchWeather(city: string): Promise<string> {
  try {
    // Open-Meteo geocode + forecast — no API key needed
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    ).then((r) => r.json());
    const loc = geo?.results?.[0];
    if (!loc) return `Weather: could not find "${city}".`;
    const wx = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}` +
        `&current=temperature_2m,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    ).then((r) => r.json());
    const cur = wx.current;
    const day = wx.daily;
    return (
      `Weather in ${loc.name}: now ${Math.round(cur.temperature_2m)}°C, wind ${Math.round(cur.wind_speed_10m)} km/h. ` +
      `Today ${Math.round(day.temperature_2m_min[0])}–${Math.round(day.temperature_2m_max[0])}°C, ` +
      `rain ${day.precipitation_probability_max[0]}%.`
    );
  } catch (e) {
    return `Weather unavailable: ${e instanceof Error ? e.message : 'error'}`;
  }
}

async function recentMqtt(): Promise<string> {
  try {
    const since = Date.now() / 1000 - 12 * 3600;
    const { messages } = await getMqttMessages(since);
    if (!messages.length) return 'MQTT: no events in the last 12 hours.';
    const counts = new Map<string, number>();
    for (const m of messages) counts.set(m.topic, (counts.get(m.topic) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return `MQTT: ${messages.length} events. Top topics: ${top.map(([t, c]) => `${t} (${c})`).join(', ')}.`;
  } catch {
    return 'MQTT: not connected.';
  }
}

async function phoneSnapshot(): Promise<string> {
  if (!isPhone()) return '';
  const parts: string[] = [];
  const bat = await phoneBattery();
  if (bat.ok) parts.push(bat.output);
  const loc = await phoneLocation();
  if (loc.ok) parts.push(loc.output.split('\n')[0]);
  return parts.length ? `Phone: ${parts.join(' • ')}` : '';
}

async function systemSnapshot(): Promise<string> {
  try {
    const res = await fetch(`${getSettings().agentUrl}/system`);
    if (!res.ok) return '';
    const s = await res.json();
    const parts: string[] = [];
    if (s.cpu_percent != null) parts.push(`CPU ${Math.round(s.cpu_percent)}%`);
    if (s.memory_percent != null) parts.push(`RAM ${Math.round(s.memory_percent)}%`);
    if (s.disk_percent != null) parts.push(`Disk ${Math.round(s.disk_percent)}%`);
    return parts.length ? `PC: ${parts.join(' • ')}` : '';
  } catch {
    return '';
  }
}

// ---------- Compose & deliver ----------

async function summarize(model: string, sections: Record<string, string>, custom: string): Promise<string> {
  const facts = Object.entries(sections)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  const prompt =
    `You are writing a short, friendly morning briefing for the user. ` +
    `Be warm, concise (under 120 words), and use 2-4 short paragraphs or bullets. ` +
    `Do NOT use any tool tags. Just plain prose.\n\n` +
    `Facts collected this morning:\n${facts}\n\n` +
    (custom ? `Extra instructions: ${custom}\n\n` : '') +
    `Write the briefing now.`;

  let out = '';
  try {
    for await (const chunk of streamChat(model, [{ role: 'user', content: prompt }])) {
      if (chunk.content) out += chunk.content;
    }
  } catch (e) {
    return `Briefing (raw — LLM unavailable):\n${facts}`;
  }
  // strip any stray tool tags just in case
  return out.replace(/\[[A-Z_]+(?::[^\]]*)?\]/g, '').trim() || facts;
}

export async function generateBriefing(settingsOverride?: Partial<BriefingSettings>): Promise<BriefingEntry> {
  const cfg = { ...getBriefingSettings(), ...settingsOverride };
  const sections: Record<string, string> = {};

  if (cfg.sections.weather) sections.Weather = await fetchWeather(cfg.city);
  if (cfg.sections.mqtt) sections['Home (MQTT)'] = await recentMqtt();
  if (cfg.sections.phone) {
    const p = await phoneSnapshot();
    if (p) sections.Phone = p;
  }
  if (cfg.sections.system) {
    const s = await systemSnapshot();
    if (s) sections.System = s;
  }

  const model = cfg.model || getSettings().defaultModel;
  const text = model
    ? await summarize(model, sections, cfg.sections.custom)
    : Object.entries(sections).map(([k, v]) => `${k}: ${v}`).join('\n');

  const entry: BriefingEntry = { ts: Date.now(), text, sections };
  pushHistory(entry);

  // Deliver
  const title = `☀️ Daily Briefing — ${new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (cfg.delivery.pcNotify) {
    void postNotification(title, text, 'briefing');
    void showNotification({ title, body: text.slice(0, 200) });
  }
  if (cfg.delivery.phoneNotify && isPhone()) {
    void phoneNotify(title, text.slice(0, 300));
  }
  if (cfg.delivery.speak) {
    if (isPhone()) {
      void phoneSpeak(text);
    } else {
      try { window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch {}
    }
  }

  return entry;
}

// ---------- Scheduler (runs in App.tsx) ----------

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export function startBriefingScheduler(): void {
  if (schedulerInterval) return;
  const tick = async () => {
    const cfg = getBriefingSettings();
    if (!cfg.enabled) return;
    const now = new Date();
    const target = new Date();
    target.setHours(cfg.hour, cfg.minute, 0, 0);
    // Window: fire if within 60s past target time and not yet run today
    const lastRun = parseInt(localStorage.getItem(LAST_RUN_KEY) || '0', 10);
    const lastRunDay = lastRun ? new Date(lastRun).toDateString() : '';
    const today = now.toDateString();
    const diffMs = now.getTime() - target.getTime();
    if (diffMs >= 0 && diffMs < 60_000 && lastRunDay !== today) {
      localStorage.setItem(LAST_RUN_KEY, String(now.getTime()));
      try {
        await generateBriefing();
      } catch (e) {
        console.error('Briefing failed:', e);
      }
    }
  };
  void tick();
  schedulerInterval = setInterval(tick, 30_000);
}

export function stopBriefingScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
