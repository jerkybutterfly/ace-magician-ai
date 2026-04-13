import { getSettings } from './settings';

// ── Browser automation helpers ──

export async function browserNavigate(url: string): Promise<{ status: string; url: string; title: string }> {
  const res = await fetch(`${agentUrl('/browser/navigate')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser navigate failed'));
  return res.json();
}

export async function browserClick(selector: string): Promise<{ status: string; title: string; url: string }> {
  const res = await fetch(`${agentUrl('/browser/click')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selector }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser click failed'));
  return res.json();
}

export async function browserFill(selector: string, value: string): Promise<{ status: string }> {
  const res = await fetch(`${agentUrl('/browser/fill')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selector, value }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser fill failed'));
  return res.json();
}

export async function browserType(selector: string, text: string): Promise<{ status: string }> {
  const res = await fetch(`${agentUrl('/browser/type')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selector, text }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser type failed'));
  return res.json();
}

export async function browserScreenshot(): Promise<{ status: string; image: string; title: string; url: string }> {
  const res = await fetch(`${agentUrl('/browser/screenshot')}`);
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser screenshot failed'));
  return res.json();
}

export async function browserGetText(): Promise<{ status: string; text: string; title: string; url: string }> {
  const res = await fetch(`${agentUrl('/browser/text')}`);
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser get text failed'));
  return res.json();
}

export async function browserGetHtml(): Promise<{ status: string; html: string; title: string; url: string }> {
  const res = await fetch(`${agentUrl('/browser/html')}`);
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser get HTML failed'));
  return res.json();
}

export async function browserExecJS(code: string): Promise<{ status: string; result: string | null; title: string; url: string }> {
  const res = await fetch(`${agentUrl('/browser/js')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser JS execution failed'));
  return res.json();
}

export async function browserWaitFor(selector: string, timeout = 20): Promise<{ status: string; found: boolean; title: string; url: string }> {
  const res = await fetch(`${agentUrl('/browser/wait')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selector, timeout }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Browser wait failed'));
  return res.json();
}

function agentUrl(path: string): string {
  return `${getSettings().agentUrl}${path}`;
}

async function parseAgentError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.error === 'string') return data.error;
  } catch {}

  return fallback;
}

export interface SystemInfo {
  cpu_percent: number;
  memory: { total: number; used: number; percent: number };
  disk: { total: number; used: number; percent: number };
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const res = await fetch(agentUrl('/system'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Agent unavailable'));
  return res.json();
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  returncode: number;
}

export async function runCommand(command: string): Promise<CommandResult> {
  const res = await fetch(agentUrl('/terminal'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Command failed'));
  return res.json();
}

export interface FileEntry {
  name: string;
  is_dir: boolean;
  size: number;
  modified: string;
}

export async function listFiles(path: string): Promise<FileEntry[]> {
  const res = await fetch(agentUrl(`/files?path=${encodeURIComponent(path)}`));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to list files'));
  return res.json();
}

export async function readFile(path: string): Promise<string> {
  const res = await fetch(agentUrl(`/files/read?path=${encodeURIComponent(path)}`));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to read file'));
  const data = await res.json();
  return data.content;
}

export async function writeFile(path: string, content: string): Promise<void> {
  const res = await fetch(agentUrl('/files/write'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to write file'));
}

export async function deleteFile(path: string): Promise<void> {
  const res = await fetch(agentUrl('/files/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to delete file'));
}

export interface TelegramStatus {
  enabled: boolean;
  connected: boolean;
  running: boolean;
  username: string | null;
  model: string | null;
  error: string | null;
  updated_at: string | null;
  status?: string;
}

export async function getTelegramStatus(): Promise<TelegramStatus> {
  const res = await fetch(agentUrl('/telegram/status'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to load Telegram status'));
  return res.json();
}

export async function connectTelegram(token: string, model?: string, provider?: string, lmstudioUrl?: string): Promise<TelegramStatus> {
  const res = await fetch(agentUrl('/telegram/connect'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, model, provider, lmstudio_url: lmstudioUrl }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to connect Telegram'));
  return res.json();
}

export async function disconnectTelegram(): Promise<TelegramStatus> {
  const res = await fetch(agentUrl('/telegram/disconnect'), {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to disconnect Telegram'));
  return res.json();
}

export async function updateMission(goal: string, status: string, next_steps: string[]): Promise<void> {
  const res = await fetch(agentUrl('/mission'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, status, next_steps }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to update mission'));
}
export interface SkillResult {
  stdout: string;
  stderr: string;
  returncode: number;
}

export async function executeSkill(name: string, args: string = ""): Promise<SkillResult> {
  const res = await fetch(agentUrl('/skills/execute'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, args }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Skill execution failed'));
  return res.json();
}

export async function listSkills(): Promise<{ name: string; path: string }[]> {
  const res = await fetch(agentUrl('/skills'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to list skills'));
  return res.json();
}

// ── Cron Jobs ──

export interface CronJob {
  name: string;
  command: string;
  interval_seconds: number;
  last_run: number;
  run_count: number;
  last_result: CommandResult | null;
  created_at: string;
}

export async function listCronJobs(): Promise<CronJob[]> {
  const res = await fetch(agentUrl('/cron'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to list cron jobs'));
  return res.json();
}

export async function createCronJob(name: string, command: string, intervalSeconds: number): Promise<void> {
  const res = await fetch(agentUrl('/cron'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, command, interval_seconds: intervalSeconds }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to create cron job'));
}

export async function deleteCronJob(name: string): Promise<void> {
  const res = await fetch(agentUrl(`/cron/${encodeURIComponent(name)}`), { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to delete cron job'));
}

// ── Processes ──

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_mb: number;
}

export async function listProcesses(): Promise<ProcessInfo[]> {
  const res = await fetch(agentUrl('/processes'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to list processes'));
  return res.json();
}

export async function killProcess(pid: number): Promise<void> {
  const res = await fetch(agentUrl(`/processes/kill?pid=${pid}`), { method: 'POST' });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to kill process'));
}

// ── Clipboard ──

export async function getClipboard(): Promise<string> {
  const res = await fetch(agentUrl('/clipboard'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to read clipboard'));
  const data = await res.json();
  return data.text;
}

export async function setClipboard(text: string): Promise<void> {
  const res = await fetch(agentUrl('/clipboard'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to set clipboard'));
}

// ── Notifications ──

export async function sendNotification(title: string, message: string): Promise<void> {
  const res = await fetch(agentUrl('/notify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, message }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to send notification'));
}

// ── Network Info ──

export interface NetworkInfo {
  interfaces: { name: string; ip: string; netmask: string }[];
  hostname: string;
  bytes_sent: number;
  bytes_recv: number;
}

export async function getNetworkInfo(): Promise<NetworkInfo> {
  const res = await fetch(agentUrl('/network'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to get network info'));
  return res.json();
}

// ── Discord ──

export interface DiscordStatus {
  enabled: boolean;
  connected: boolean;
  running: boolean;
  username: string | null;
  model: string | null;
  error: string | null;
  updated_at: string | null;
  status?: string;
}

export async function getDiscordStatus(): Promise<DiscordStatus> {
  const res = await fetch(agentUrl('/discord/status'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to load Discord status'));
  return res.json();
}

export async function connectDiscord(token: string, model?: string, provider?: string, lmstudioUrl?: string): Promise<DiscordStatus> {
  const res = await fetch(agentUrl('/discord/connect'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, model, provider, lmstudio_url: lmstudioUrl }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to connect Discord'));
  return res.json();
}

export async function disconnectDiscord(): Promise<DiscordStatus> {
  const res = await fetch(agentUrl('/discord/disconnect'), { method: 'POST' });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to disconnect Discord'));
  return res.json();
}

// ── Webhook ──

export async function getWebhookLog(): Promise<{ event: string; data: Record<string, unknown>; received_at: string }[]> {
  const res = await fetch(agentUrl('/webhook/log'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to get webhook log'));
  return res.json();
}

// ── Environment Variables ──

export async function getEnvVars(): Promise<{ name: string; value: string }[]> {
  const res = await fetch(agentUrl('/env'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to get env vars'));
  return res.json();
}

export async function setEnvVar(name: string, value: string): Promise<void> {
  const res = await fetch(agentUrl('/env'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, value }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to set env var'));
}

// ── HTTP Request Proxy ──

export interface HTTPProxyResult {
  status_code: number;
  headers: Record<string, string>;
  body: unknown;
}

export async function httpRequest(method: string, url: string, headers?: Record<string, string>, body?: string): Promise<HTTPProxyResult> {
  const res = await fetch(agentUrl('/http'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, url, headers, body }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'HTTP request failed'));
  return res.json();
}

// ── Download File ──

export async function downloadFile(url: string, savePath: string): Promise<{ status: string; path: string; size: number }> {
  const res = await fetch(agentUrl('/download'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, save_path: savePath }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Download failed'));
  return res.json();
}

// ── Search Files ──

export interface SearchResult {
  file: string;
  line: number;
  text: string;
}

export async function searchFiles(pattern: string, path?: string, extensions?: string): Promise<SearchResult[]> {
  const res = await fetch(agentUrl('/search'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pattern, path: path || '.', extensions }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Search failed'));
  return res.json();
}

// ── Zip / Unzip ──

export async function zipFiles(paths: string[], output: string): Promise<{ status: string; output: string; size: number }> {
  const res = await fetch(agentUrl('/zip'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths, output }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Zip failed'));
  return res.json();
}

export async function unzipFile(archive: string, destination?: string): Promise<{ status: string; destination: string; files: string[] }> {
  const res = await fetch(agentUrl('/unzip'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archive, destination: destination || '.' }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Unzip failed'));
  return res.json();
}

// ── System Power ──

export async function systemPower(action: string): Promise<{ status: string; action: string }> {
  const res = await fetch(agentUrl('/power'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Power action failed'));
  return res.json();
}

// ── App Launcher ──

export async function launchApp(app: string, args?: string): Promise<{ status: string; app: string; pid: number }> {
  const res = await fetch(agentUrl('/launch'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app, args }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'Launch failed'));
  return res.json();
}

// ── Text-to-Speech ──

export async function textToSpeech(text: string, rate?: number): Promise<{ status: string }> {
  const res = await fetch(agentUrl('/tts'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate: rate || 150 }),
  });
  if (!res.ok) throw new Error(await parseAgentError(res, 'TTS failed'));
  return res.json();
}

// ── Disk Usage ──

export interface DiskInfo {
  device: string;
  mountpoint: string;
  fstype: string;
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

export async function getDiskUsage(): Promise<DiskInfo[]> {
  const res = await fetch(agentUrl('/disk'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to get disk usage'));
  return res.json();
}

// ── Desktop Screenshot ──

export async function desktopScreenshot(): Promise<{ status: string; image: string }> {
  const res = await fetch(agentUrl('/screenshot'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Screenshot failed'));
  return res.json();
}

// ── Wi-Fi ──

export async function getWifiNetworks(): Promise<{ status: string; output: string }> {
  const res = await fetch(agentUrl('/wifi'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to get Wi-Fi networks'));
  return res.json();
}

// ── Installed Programs ──

export async function getInstalledPrograms(): Promise<{ DisplayName: string; DisplayVersion: string; Publisher: string }[]> {
  const res = await fetch(agentUrl('/installed'));
  if (!res.ok) throw new Error(await parseAgentError(res, 'Failed to get installed programs'));
  return res.json();
}
