import { getSettings } from './settings';

export const SELLBIRD_PORT = 5555;
const ROOT = '%USERPROFILE%\\.aiapp\\sellbird';
const REPO = `${ROOT}\\repo`;
const EXE = `"${REPO}\\.venv\\Scripts\\sellbird.exe"`;

async function sh(command: string) {
  const { agentUrl } = getSettings();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch(`${agentUrl.replace(/\/$/, '')}/terminal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }), signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Mini PC helper is unreachable');
    return { stdout: String(data.stdout || ''), stderr: String(data.stderr || ''), returncode: Number(data.returncode ?? -1) };
  } finally { clearTimeout(timer); }
}

/** Accepts only a plain http(s) website address that is safe to place in a command line. */
export function cleanWebsiteUrl(input: string): string {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error('Enter a full website address, like https://your-company.com'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Website address must start with http:// or https://');
  const text = url.toString();
  if (!/^[A-Za-z0-9:/._~?=&%+#@!,;-]+$/.test(text) || /[&^%|<>"]/.test(text.replace(/%[0-9A-Fa-f]{2}/g, ''))) {
    throw new Error('That address has characters that are not allowed. Use a simple link.');
  }
  return text;
}

export const sellbird = {
  checkTools: () => sh('git --version & py -3.12 --version & claude --version'),
  install: () => {
    const origin = new URL(window.location.origin);
    if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Open the web version of this app to install Sellbird.');
    const scriptUrl = `${origin.origin}/sellbird_install.ps1`;
    return sh(`if not exist "${ROOT}" mkdir "${ROOT}" & curl --fail -L "${scriptUrl}" -o "${ROOT}\\install.ps1" && start "Sellbird installation" /min cmd /c "powershell -NoProfile -ExecutionPolicy Bypass -File ""${ROOT}\\install.ps1"" > ""${ROOT}\\install.log"" 2>&1"`);
  },
  installation: async () => {
    const r = await sh(`if exist "${ROOT}\\install.ok" (echo SELLBIRD_INSTALLED) else if exist "${ROOT}\\install.failed" (echo SELLBIRD_FAILED) else (echo SELLBIRD_NOT_VERIFIED)`);
    if (r.returncode !== 0) throw new Error(r.stderr || 'Installation check failed');
    return r.stdout.includes('SELLBIRD_INSTALLED') ? 'installed' : r.stdout.includes('SELLBIRD_FAILED') ? 'failed' : 'not-verified';
  },
  start: () => sh(`cd /d "${REPO}" && start "Sellbird dashboard" /min cmd /c "${EXE} dashboard > ""${ROOT}\\dashboard.log"" 2>&1"`),
  stop: () => sh(`powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${SELLBIRD_PORT} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`),
  status: async () => {
    const r = await sh(`curl --max-time 5 -s -o nul -w "SELLBIRD_HTTP:%{http_code}" http://127.0.0.1:${SELLBIRD_PORT}/`);
    return r.returncode === 0 && /SELLBIRD_HTTP:(200|401|403)/.test(r.stdout);
  },
  link: () => sh(`cd /d "${REPO}" && ${EXE} dashboard --url`),
  train: (website: string) => {
    const url = cleanWebsiteUrl(website);
    return sh(`cd /d "${REPO}" && start "Sellbird training" /min cmd /c "${EXE} train ""${url}"" > ""${ROOT}\\train.log"" 2>&1"`);
  },
  pauseSending: () => sh(`cd /d "${REPO}" && ${EXE} sending pause`),
  logs: () => sh(`powershell -NoProfile -Command "foreach ($f in 'install.log','dashboard.log','train.log') { $p = Join-Path $env:USERPROFILE ('.aiapp\\sellbird\\' + $f); if (Test-Path $p) { '== ' + $f; Get-Content -LiteralPath $p -Tail 60 } }"`),
};
