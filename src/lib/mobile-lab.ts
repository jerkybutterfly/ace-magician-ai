// Mobile security lab bridges: MobSF, Frida, scrcpy, Android Emulator.
// All commands are executed on the PC via the local agent's /terminal endpoint.
import { getSettings } from './settings';

const agent = (p: string) => `${getSettings().agentUrl}${p}`;

export interface TerminalResult { returncode: number; stdout: string; stderr: string }

export async function run(command: string, timeout = 600): Promise<TerminalResult> {
  const res = await fetch(agent('/terminal'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, timeout }),
  });
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  return res.json();
}

const q = (s: string) => JSON.stringify(s);

// ── MobSF ───────────────────────────────────────────────────────────────────
// Static + dynamic APK / IPA analyzer, runs as a local Docker container.
export const MOBSF_URL = 'http://127.0.0.1:8000';
export const MOBSF_DEFAULT_APIKEY_HINT =
  'Copy the API key printed by `docker logs mobsf` (or from the MobSF web UI ▸ API Docs).';

export const installMobsf = () =>
  run('docker pull opensecurity/mobile-security-framework-mobsf:latest', 1800);

export const startMobsf = () =>
  run('docker rm -f mobsf 2>/dev/null; docker run -d --name mobsf -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest && sleep 3 && docker ps --filter name=mobsf', 120);

export const stopMobsf = () => run('docker rm -f mobsf', 30);
export const mobsfLogs = () => run('docker logs --tail 200 mobsf 2>&1', 15);
export const mobsfStatus = () => run('docker ps --filter name=mobsf --format "{{.Status}}"', 10);

export async function mobsfUpload(apkPath: string, apiKey: string) {
  // Upload an APK/IPA file that already lives on the PC filesystem.
  const cmd = `curl -s -F "file=@${apkPath}" -H "Authorization: ${apiKey}" ${MOBSF_URL}/api/v1/upload`;
  const r = await run(cmd, 300);
  try { return JSON.parse(r.stdout); } catch { throw new Error(r.stdout || r.stderr); }
}
export async function mobsfScan(hash: string, apiKey: string) {
  const cmd = `curl -s -X POST -H "Authorization: ${apiKey}" -F "hash=${hash}" ${MOBSF_URL}/api/v1/scan`;
  const r = await run(cmd, 900);
  try { return JSON.parse(r.stdout); } catch { throw new Error(r.stdout || r.stderr); }
}
export const mobsfReportUrl = (hash: string) => `${MOBSF_URL}/static_analyzer/?checksum=${hash}`;

// ── Frida ───────────────────────────────────────────────────────────────────
export const installFrida = () =>
  run('pip install --upgrade frida-tools frida 2>&1 | tail -20 && frida --version', 600);

export const fridaListDevices = () => run('frida-ls-devices', 15);
export const fridaListProcesses = (device = 'usb') =>
  run(`frida-ps -D ${q(device)}`, 30);
export const fridaListApps = (device = 'usb') =>
  run(`frida-ps -Uai`, 30).catch(() => run(`frida-ps -D ${q(device)} -ai`, 30));

// Attach and run a JS hook script (path or inline). Runs detached; output tailed via /tmp file.
export async function fridaSpawn(pkg: string, scriptContent: string, device = 'usb') {
  const scriptPath = `/tmp/frida-${Date.now()}.js`;
  const logPath = `${scriptPath}.log`;
  const enc = scriptContent.replace(/'/g, `'\\''`);
  const cmd = `cat > ${scriptPath} <<'FRIDAEOF'\n${enc}\nFRIDAEOF\n` +
    `nohup frida -D ${q(device)} -f ${q(pkg)} -l ${scriptPath} --no-pause > ${logPath} 2>&1 &\n` +
    `echo $! > ${scriptPath}.pid && sleep 1 && cat ${logPath}`;
  const r = await run(cmd, 30);
  return { logPath, pidPath: `${scriptPath}.pid`, output: r.stdout + r.stderr };
}
export const fridaTailLog = (logPath: string) =>
  run(`tail -n 200 ${q(logPath)} 2>/dev/null`, 10);
export const fridaKill = (pidPath: string) =>
  run(`kill $(cat ${q(pidPath)}) 2>/dev/null; rm -f ${q(pidPath)}`, 10);

// ── scrcpy (mirror + control an Android device) ─────────────────────────────
export const installScrcpy = () =>
  run('command -v scrcpy || (apt-get update && apt-get install -y scrcpy adb) && scrcpy --version | head -1', 600);

export const adbDevices = () => run('adb devices -l', 15);
export const adbConnect = (hostPort: string) => run(`adb connect ${q(hostPort)}`, 15);
export const adbDisconnect = (hostPort?: string) =>
  run(`adb disconnect ${hostPort ? q(hostPort) : ''}`, 10);

export const scrcpyStart = (opts: { serial?: string; bitrate?: number; maxSize?: number; recordPath?: string; noAudio?: boolean } = {}) => {
  const parts = ['nohup', 'scrcpy'];
  if (opts.serial) parts.push('-s', q(opts.serial));
  if (opts.bitrate) parts.push('--video-bit-rate', `${opts.bitrate}M`);
  if (opts.maxSize) parts.push('--max-size', String(opts.maxSize));
  if (opts.noAudio) parts.push('--no-audio');
  if (opts.recordPath) parts.push('--record', q(opts.recordPath));
  const cmd = `${parts.join(' ')} > /tmp/scrcpy.log 2>&1 & echo $! > /tmp/scrcpy.pid && sleep 1 && cat /tmp/scrcpy.log`;
  return run(cmd, 15);
};
export const scrcpyStop = () => run('kill $(cat /tmp/scrcpy.pid) 2>/dev/null; rm -f /tmp/scrcpy.pid; pkill -f scrcpy || true', 10);
export const scrcpyRunning = () => run('pgrep -a scrcpy || echo "not running"', 5);

// ── Android Emulator (AVD) ──────────────────────────────────────────────────
// Assumes Android SDK is installed and $ANDROID_HOME (or ANDROID_SDK_ROOT) is set.
export const androidCheckSdk = () =>
  run('echo "ANDROID_HOME=$ANDROID_HOME"; echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"; which sdkmanager avdmanager emulator adb', 10);

export const listAvds = () =>
  run('emulator -list-avds 2>/dev/null || avdmanager list avd', 15);

export const createAvd = (name: string, systemImage = 'system-images;android-34;google_apis;x86_64', device = 'pixel_6') => {
  const cmd =
    `yes | sdkmanager --install ${q(systemImage)} && ` +
    `echo no | avdmanager create avd -n ${q(name)} -k ${q(systemImage)} -d ${q(device)} --force`;
  return run(cmd, 1800);
};

export const startAvd = (name: string, opts: { snapshot?: boolean; writable?: boolean } = {}) => {
  const flags = ['-avd', q(name), '-no-boot-anim'];
  if (opts.writable) flags.push('-writable-system');
  if (!opts.snapshot) flags.push('-no-snapshot-load');
  const cmd = `nohup emulator ${flags.join(' ')} > /tmp/avd-${name}.log 2>&1 & echo $! > /tmp/avd-${name}.pid && sleep 2 && head -20 /tmp/avd-${name}.log`;
  return run(cmd, 30);
};

export const stopAvd = (name: string) =>
  run(`kill $(cat /tmp/avd-${q(name)}.pid) 2>/dev/null; rm -f /tmp/avd-${q(name)}.pid; adb -e emu kill 2>/dev/null || true`, 15);

export const installApk = (apkPath: string, serial?: string) =>
  run(`adb ${serial ? '-s ' + q(serial) + ' ' : ''}install -r ${q(apkPath)}`, 300);

export const snapshotSave = (serial: string, name: string) =>
  run(`adb -s ${q(serial)} emu avd snapshot save ${q(name)}`, 60);
export const snapshotLoad = (serial: string, name: string) =>
  run(`adb -s ${q(serial)} emu avd snapshot load ${q(name)}`, 60);
