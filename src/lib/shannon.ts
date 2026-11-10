import { getSettings } from './settings';

export const SHANNON_VERSION = '3.5.0';
export interface ShannonScan { url: string; repository: string; model: string; workspace: string; authorised: boolean; nonProduction: boolean; }
export function validateShannonScan(scan: ShannonScan) {
  if (!scan.authorised || !scan.nonProduction) throw new Error('Confirm written authorisation and a non-production target.');
  let url: URL;
  try { url = new URL(scan.url); } catch { throw new Error('Enter a valid HTTP or HTTPS target.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use HTTP or HTTPS without credentials in the address.');
  if (!scan.repository.startsWith('/') || /[\r\n\0]/.test(scan.repository)) throw new Error('Enter an absolute WSL repository path, such as /mnt/c/Projects/my-app.');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(scan.model)) throw new Error('Enter a valid installed Ollama model name.');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(scan.workspace)) throw new Error('Use letters, numbers, underscores or hyphens for the workspace.');
}

async function terminal(command: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch(`${getSettings().agentUrl.replace(/\/$/, '')}/terminal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }), signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || result.returncode !== 0) throw new Error(result.detail || result.stderr || result.stdout || 'The mini PC command failed.');
    return String(result.stdout || '');
  } finally { clearTimeout(timer); }
}

function payload(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
}

async function launch(action: string, scan?: ShannonScan) {
  const origin = new URL(window.location.origin);
  if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Open the web version of this app.');
  const scriptUrl = `${origin.origin}/shannon_helper.ps1`;
  const root = '%USERPROFILE%\\.aiapp\\shannon';
  return terminal(`if not exist "${root}" mkdir "${root}"\r\ncurl --fail -L "${scriptUrl}" -o "${root}\\helper.ps1" && powershell -NoProfile -ExecutionPolicy Bypass -File "${root}\\helper.ps1" -Payload "${payload({ action, version: SHANNON_VERSION, scan })}"`);
}

export const shannon = {
  checkTools: () => terminal('wsl --status && wsl --exec bash -lc "node --version && npm --version && docker info --format {{.ServerVersion}}"'),
  status: () => launch('status'),
  install: () => launch('install'),
  start: (scan: ShannonScan) => { validateShannonScan(scan); return launch('scan', scan); },
  stop: (workspace: string) => {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(workspace)) throw new Error('Enter a valid workspace name.');
    return launch('stop', { workspace } as ShannonScan);
  },
  logs: () => launch('logs'),
};