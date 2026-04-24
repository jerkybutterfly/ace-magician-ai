// Phone capabilities — Capacitor plugin wrappers + uniform tag executor.
// Used by phone-runner.ts (remote command execution on the device) and could
// also be invoked locally if the chat is running on the phone itself.

import { Capacitor } from '@capacitor/core';

export interface PhoneTagResult {
  ok: boolean;
  output: string;
  data?: unknown;
}

const safe = async <T>(fn: () => Promise<T>, label: string): Promise<PhoneTagResult> => {
  try {
    const data = await fn();
    return { ok: true, output: typeof data === 'string' ? data : JSON.stringify(data, null, 2), data };
  } catch (e) {
    return { ok: false, output: `${label} failed: ${e instanceof Error ? e.message : String(e)}` };
  }
};

export const isPhone = (): boolean => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
};

// ---------- Individual capability wrappers ----------

export async function phoneBattery(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getBatteryInfo();
    const pct = info.batteryLevel != null ? Math.round(info.batteryLevel * 100) : null;
    return `🔋 ${pct ?? '?'}% ${info.isCharging ? '⚡ charging' : ''}`.trim();
  }, 'Battery');
}

export async function phoneInfo(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    return `${info.manufacturer} ${info.model} • ${info.operatingSystem} ${info.osVersion} • ${info.platform}`;
  }, 'Device info');
}

export async function phoneLocation(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Geolocation } = await import('@capacitor/geolocation');
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted') throw new Error('Permission denied');
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
    const { latitude, longitude, accuracy } = pos.coords;
    return `📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)\nMap: https://maps.google.com/?q=${latitude},${longitude}`;
  }, 'Location');
}

export async function phoneCamera(facing: 'front' | 'back' = 'back'): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Camera, CameraResultType, CameraDirection, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      direction: facing === 'front' ? CameraDirection.Front : CameraDirection.Rear,
      source: CameraSource.Camera,
    });
    return `📷 Photo captured: ${photo.webPath ?? photo.path ?? 'ok'}`;
  }, 'Camera');
}

export async function phoneClipboardGet(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Clipboard } = await import('@capacitor/clipboard');
    const { value } = await Clipboard.read();
    return `📋 ${value || '(empty)'}`;
  }, 'Clipboard read');
}

export async function phoneClipboardSet(text: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Clipboard } = await import('@capacitor/clipboard');
    await Clipboard.write({ string: text });
    return `📋 Copied: ${text.slice(0, 80)}`;
  }, 'Clipboard write');
}

export async function phoneNotify(title: string, body: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [{ id: Date.now() % 100000, title, body, schedule: { at: new Date(Date.now() + 200) } }],
    });
    return `🔔 ${title}`;
  }, 'Notify');
}

export async function phoneVibrate(ms = 300): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Haptics } = await import('@capacitor/haptics');
    await Haptics.vibrate({ duration: ms });
    return `📳 vibrated ${ms}ms`;
  }, 'Vibrate');
}

export async function phoneOpenUrl(url: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
    return `🌐 Opened ${url}`;
  }, 'Open URL');
}

export async function phoneShare(title: string, text: string, url?: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text, url });
    return `↗️ Shared: ${title}`;
  }, 'Share');
}

export async function phoneNetwork(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return `📶 ${status.connected ? 'online' : 'offline'} • ${status.connectionType}`;
  }, 'Network');
}

export async function phoneLaunch(packageName: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { AppLauncher } = await import('@capacitor/app-launcher');
    const result = await AppLauncher.openUrl({ url: packageName.includes('://') ? packageName : `${packageName}://` });
    return `🚀 Launched ${packageName}: ${result.completed ? 'ok' : 'no handler'}`;
  }, 'Launch');
}

// Optional plugins — guarded
export async function phoneTorch(on: boolean): Promise<PhoneTagResult> {
  return { ok: false, output: `Torch plugin not installed (${on ? 'on' : 'off'} requested)` };
}
export async function phoneSpeak(text: string): Promise<PhoneTagResult> {
  return safe(async () => {
    // Web Speech API works in Capacitor's WebView too
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
    return `🗣️ ${text.slice(0, 80)}`;
  }, 'Speak');
}

// ---------- Tag dispatcher ----------

export async function executePhoneTag(tag: string): Promise<PhoneTagResult> {
  const m = tag.match(/^\[PHONE_([A-Z_]+)(?::([\s\S]*))?\]$/);
  if (!m) return { ok: false, output: `Bad phone tag: ${tag}` };
  const op = m[1];
  const arg = (m[2] ?? '').trim();

  switch (op) {
    case 'BATTERY': return phoneBattery();
    case 'INFO': return phoneInfo();
    case 'LOCATION': return phoneLocation();
    case 'CAMERA': return phoneCamera((arg as 'front' | 'back') || 'back');
    case 'CLIPBOARD_GET': return phoneClipboardGet();
    case 'CLIPBOARD_SET': return phoneClipboardSet(arg);
    case 'NOTIFY': {
      const [t, b = ''] = arg.split('|');
      return phoneNotify(t, b);
    }
    case 'VIBRATE': return phoneVibrate(Number(arg) || 300);
    case 'OPEN_URL': return phoneOpenUrl(arg);
    case 'SHARE': {
      const [t = '', b = '', u] = arg.split('|');
      return phoneShare(t, b, u);
    }
    case 'NETWORK': return phoneNetwork();
    case 'LAUNCH': return phoneLaunch(arg);
    case 'TORCH': return phoneTorch(arg === 'on');
    case 'SPEAK': return phoneSpeak(arg);
    default: return { ok: false, output: `Unknown phone op: ${op}` };
  }
}
