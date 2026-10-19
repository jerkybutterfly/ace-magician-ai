import { getSettings } from './settings';

export const ARTEMIS_PORT = 8766;
const ROOT = '%USERPROFILE%\\.aiapp\\artemis';
const UV = '"%USERPROFILE%\\.local\\bin\\uv.exe"';

async function sh(command: string) {
  const { agentUrl } = getSettings();
  const response = await fetch(`${agentUrl.replace(/\/$/, '')}/terminal`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }), signal: AbortSignal.timeout(35_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Mini PC helper is unreachable');
  return { stdout: String(data.stdout || ''), stderr: String(data.stderr || ''), returncode: Number(data.returncode ?? -1) };
}

export function artemisConsoleUrl(agentUrl = getSettings().agentUrl) {
  const url = new URL(agentUrl);
  url.port = String(ARTEMIS_PORT);
  url.pathname = '/'; url.search = ''; url.hash = '';
  return url.toString();
}

export const artemis = {
  checkTools: () => sh('git --version & py -3.12 --version & adb devices'),
  install: () => {
    const origin = new URL(window.location.origin);
    if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Open the web version of this app to install Artemis.');
    const scriptUrl = `${origin.origin}/artemis_install.ps1`;
    return sh(`if not exist "${ROOT}" mkdir "${ROOT}" & curl --fail -L "${scriptUrl}" -o "${ROOT}\\install.ps1" && start "Artemis installation" /min cmd /c "powershell -NoProfile -ExecutionPolicy Bypass -File ""${ROOT}\\install.ps1"" > ""${ROOT}\\install.log"" 2>&1"`);
  },
  installation: async () => {
    const r = await sh(`if exist "${ROOT}\\install.ok" (echo ARTEMIS_INSTALLED) else if exist "${ROOT}\\install.failed" (echo ARTEMIS_FAILED) else (echo ARTEMIS_NOT_VERIFIED)`);
    if (r.returncode !== 0) throw new Error(r.stderr || 'Installation check failed');
    return r.stdout.includes('ARTEMIS_INSTALLED') ? 'installed' : r.stdout.includes('ARTEMIS_FAILED') ? 'failed' : 'not-verified';
  },
  start: () => sh(`cd /d "${ROOT}\\repo" && start "Artemis console" /min cmd /c "${UV} run artemis ui --host 0.0.0.0 --port ${ARTEMIS_PORT} --no-open > ""${ROOT}\\console.log"" 2>&1"`),
  stop: () => sh(`cd /d "${ROOT}\\repo" && ${UV} run artemis stop --port ${ARTEMIS_PORT}`),
  status: async () => {
    const r = await sh(`curl --max-time 5 -s -o nul -w "ARTEMIS_HTTP:%{http_code}" http://127.0.0.1:${ARTEMIS_PORT}/`);
    return r.returncode === 0 && r.stdout.includes('ARTEMIS_HTTP:200');
  },
  logs: () => sh(`powershell -NoProfile -Command "Get-Content -LiteralPath (Join-Path $env:USERPROFILE '.aiapp\\artemis\\install.log') -Tail 100; if (Test-Path (Join-Path $env:USERPROFILE '.aiapp\\artemis\\console.log')) { Get-Content -LiteralPath (Join-Path $env:USERPROFILE '.aiapp\\artemis\\console.log') -Tail 60 }"`),
  devices: () => sh(`cd /d "${ROOT}\\repo" && ${UV} run artemis doctor`),
};