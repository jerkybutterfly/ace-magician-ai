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
  try {
    if (Capacitor.isNativePlatform()) return true;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  } catch { return false; }
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

// Flashlight via getUserMedia torch constraint (no plugin needed on supporting devices)
let _torchTrack: MediaStreamTrack | null = null;
export async function phoneTorch(on: boolean): Promise<PhoneTagResult> {
  return safe(async () => {
    if (!on) {
      if (_torchTrack) {
        try { await (_torchTrack as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({ advanced: [{ torch: false }] }); } catch {}
        _torchTrack.stop();
        _torchTrack = null;
      }
      return '🔦 off';
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const track = stream.getVideoTracks()[0];
    const caps = track.getCapabilities ? track.getCapabilities() as { torch?: boolean } : {};
    if (!caps.torch) { track.stop(); throw new Error('Torch not supported on this device'); }
    await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({ advanced: [{ torch: true }] });
    _torchTrack = track;
    return '🔦 on';
  }, 'Torch');
}

export async function phoneSpeak(text: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
    return `🗣️ ${text.slice(0, 80)}`;
  }, 'Speak');
}

// ── New tags ──

export async function phoneCall(number: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { AppLauncher } = await import('@capacitor/app-launcher');
    await AppLauncher.openUrl({ url: `tel:${number}` });
    return `📞 Calling ${number}`;
  }, 'Call');
}

export async function phoneSms(number: string, message: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { AppLauncher } = await import('@capacitor/app-launcher');
    const sep = /android/i.test(navigator.userAgent) ? '?' : '&';
    await AppLauncher.openUrl({ url: `sms:${number}${sep}body=${encodeURIComponent(message)}` });
    return `💬 SMS draft to ${number}`;
  }, 'SMS');
}

export async function phoneEmail(to: string, subject: string, body: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { AppLauncher } = await import('@capacitor/app-launcher');
    await AppLauncher.openUrl({ url: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` });
    return `📧 Email draft to ${to}`;
  }, 'Email');
}

export async function phoneToast(message: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Toast } = await import('@capacitor/toast');
    await Toast.show({ text: message, duration: 'short' });
    return `🍞 ${message.slice(0, 80)}`;
  }, 'Toast');
}

export async function phoneDialog(message: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Dialog } = await import('@capacitor/dialog');
    await Dialog.alert({ title: 'Message', message });
    return `🗨️ shown`;
  }, 'Dialog');
}

export async function phoneOrientation(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation');
    const { type } = await ScreenOrientation.orientation();
    return `🔄 ${type}`;
  }, 'Orientation');
}

export async function phoneLang(): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Device } = await import('@capacitor/device');
    const code = await Device.getLanguageCode();
    const tag = await Device.getLanguageTag();
    return `🌐 ${code.value} (${tag.value})`;
  }, 'Lang');
}

export async function phoneStorage(): Promise<PhoneTagResult> {
  return safe(async () => {
    if (!navigator.storage?.estimate) throw new Error('Storage API unavailable');
    const e = await navigator.storage.estimate();
    const usedMB = Math.round((e.usage || 0) / 1048576);
    const quotaMB = Math.round((e.quota || 0) / 1048576);
    return `💾 ${usedMB} MB used / ${quotaMB} MB quota`;
  }, 'Storage');
}

export async function phoneSensors(): Promise<PhoneTagResult> {
  return safe(async () => {
    const Anon = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
    if (Anon?.requestPermission) { try { await Anon.requestPermission(); } catch {} }
    const reading = await new Promise<DeviceMotionEvent>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('No motion event')), 2000);
      const handler = (ev: DeviceMotionEvent) => { clearTimeout(t); window.removeEventListener('devicemotion', handler); resolve(ev); };
      window.addEventListener('devicemotion', handler);
    });
    const a = reading.accelerationIncludingGravity;
    return `📐 accel x:${a?.x?.toFixed(2)} y:${a?.y?.toFixed(2)} z:${a?.z?.toFixed(2)}`;
  }, 'Sensors');
}

export async function phoneBeep(freq = 880, ms = 200): Promise<PhoneTagResult> {
  return safe(async () => {
    const Ctx = (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    await new Promise(r => setTimeout(r, ms));
    osc.stop(); ctx.close();
    return `🔊 beep ${freq}Hz ${ms}ms`;
  }, 'Beep');
}

export async function phoneLocationWatch(seconds = 10): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Geolocation } = await import('@capacitor/geolocation');
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted') throw new Error('Permission denied');
    const points: string[] = [];
    const end = Date.now() + Math.max(2, Math.min(60, seconds)) * 1000;
    while (Date.now() < end) {
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      points.push(`${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`);
      await new Promise(r => setTimeout(r, 1500));
    }
    return `📍 path (${points.length}):\n${points.join('\n')}`;
  }, 'LocationWatch');
}

export async function phoneFileList(path: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const r = await Filesystem.readdir({ path: path || '', directory: Directory.Documents });
    return r.files.map(f => `${f.type === 'directory' ? '📁' : '📄'} ${f.name}`).join('\n') || '(empty)';
  }, 'FileList');
}

export async function phoneFileRead(path: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const r = await Filesystem.readFile({ path, directory: Directory.Documents, encoding: Encoding.UTF8 });
    return typeof r.data === 'string' ? r.data : '(binary)';
  }, 'FileRead');
}

export async function phoneFileWrite(path: string, content: string): Promise<PhoneTagResult> {
  return safe(async () => {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await Filesystem.writeFile({ path, data: content, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true });
    return `💾 wrote ${path}`;
  }, 'FileWrite');
}

export async function phoneContacts(): Promise<PhoneTagResult> {
  return { ok: false, output: 'Contacts plugin not installed. Run: npm i @capacitor-community/contacts' };
}

export async function phoneRecordAudio(seconds: number): Promise<PhoneTagResult> {
  return { ok: false, output: `Voice recorder plugin not installed (${seconds}s requested). Run: npm i capacitor-voice-recorder` };
}

export async function phoneBrightness(level: number): Promise<PhoneTagResult> {
  return { ok: false, output: `Brightness plugin not installed (${level}% requested). Run: npm i @capawesome-team/capacitor-screen-brightness` };
}

export async function phoneKeepAwake(on: boolean): Promise<PhoneTagResult> {
  return { ok: false, output: `KeepAwake plugin not installed (${on ? 'on' : 'off'}). Run: npm i @capacitor-community/keep-awake` };
}

export async function phoneQrScan(): Promise<PhoneTagResult> {
  return { ok: false, output: 'Barcode scanner plugin not installed. Run: npm i @capacitor-mlkit/barcode-scanning' };
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
    case 'CALL': return phoneCall(arg);
    case 'SMS_SEND': { const [n, ...rest] = arg.split('|'); return phoneSms(n, rest.join('|')); }
    case 'EMAIL': { const [to = '', s = '', ...b] = arg.split('|'); return phoneEmail(to, s, b.join('|')); }
    case 'TOAST': return phoneToast(arg);
    case 'DIALOG': return phoneDialog(arg);
    case 'ORIENTATION': return phoneOrientation();
    case 'LANG': return phoneLang();
    case 'STORAGE': return phoneStorage();
    case 'SENSORS': return phoneSensors();
    case 'BEEP': { const [f, m] = arg.split('|'); return phoneBeep(Number(f) || 880, Number(m) || 200); }
    case 'LOCATION_WATCH': return phoneLocationWatch(Number(arg) || 10);
    case 'FILE_LIST': return phoneFileList(arg);
    case 'FILE_READ': return phoneFileRead(arg);
    case 'FILE_WRITE': { const [p, ...c] = arg.split('|'); return phoneFileWrite(p, c.join('|')); }
    case 'FLASHLIGHT': return phoneTorch(arg === 'on');
    case 'CONTACTS': return phoneContacts();
    case 'RECORD_AUDIO': return phoneRecordAudio(Number(arg) || 5);
    case 'BRIGHTNESS': return phoneBrightness(Number(arg) || 50);
    case 'KEEP_AWAKE': return phoneKeepAwake(arg === 'on');
    case 'QR_SCAN': return phoneQrScan();
    default: return { ok: false, output: `Unknown phone op: ${op}` };
  }
}
