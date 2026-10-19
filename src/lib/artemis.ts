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
  logs: () => sh(`powershell -NoProfile -Command "Get-Content -LiteralPath '$env:USERPROFILE\\.aiapp\\artemis\\install.log' -Tail 100"`.replace("'$env:USERPROFILE", '"$env:USERPROFILE').replace("install.log'", 'install.log"')),
};