import { getSettings } from './settings';

const ROOT = '%USERPROFILE%\\.aiapp\\bitnet';
const REPO = `${ROOT}\\repo`;
const PY = `"${REPO}\\.venv\\Scripts\\python.exe"`;
const MODEL = 'models\\BitNet-b1.58-2B-4T\\ggml-model-i2_s.gguf';

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

/** Removes characters that would break out of a cmd.exe quoted argument. */
export function cleanPrompt(text: string) {
  return text.replace(/["&|<>^%!\r\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
}

export function clampThreads(n: number) {
  return Math.min(16, Math.max(1, Math.round(Number.isFinite(n) ? n : 4)));
}

const detached = (title: string, inner: string, log: string) =>
  sh(`cd /d "${REPO}" && start "${title}" /min cmd /c "${inner} > ""${ROOT}\\${log}"" 2>&1"`);

export const bitnet = {
  checkTools: () => sh('git --version & where cmake & where clang & winget --version'),
  install: () => {
    const origin = new URL(window.location.origin);
    if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Open the web version of this app to install BitNet.');
    return sh(`if not exist "${ROOT}" mkdir "${ROOT}" & curl --fail -L "${origin.origin}/bitnet_install.ps1" -o "${ROOT}\\install.ps1" && start "BitNet installation" /min cmd /c "powershell -NoProfile -ExecutionPolicy Bypass -File ""${ROOT}\\install.ps1"" > ""${ROOT}\\install.log"" 2>&1"`);
  },
  installation: async () => {
    const r = await sh(`if exist "${ROOT}\\install.ok" (echo BN_INSTALLED) else if exist "${ROOT}\\install.failed" (echo BN_FAILED) else (echo BN_NOT_VERIFIED)`);
    if (r.returncode !== 0) throw new Error(r.stderr || 'Installation check failed');
    return r.stdout.includes('BN_INSTALLED') ? 'installed' : r.stdout.includes('BN_FAILED') ? 'failed' : 'not-verified';
  },
  runPrompt: (prompt: string, threads: number) =>
    detached('BitNet prompt', `${PY} run_inference.py -m ${MODEL} -p ""${cleanPrompt(prompt)}"" -n 128 -t ${clampThreads(threads)} -temp 0.7`, 'prompt.log'),
  benchmark: (threads: number) =>
    detached('BitNet benchmark', `${PY} utils\\e2e_benchmark.py -m ${MODEL} -n 128 -p 256 -t ${clampThreads(threads)}`, 'bench.log'),
  result: (which: 'prompt' | 'bench') =>
    sh(`powershell -NoProfile -Command "$f = Join-Path $env:USERPROFILE '.aiapp\\bitnet\\${which}.log'; if (Test-Path $f) { Get-Content -LiteralPath $f -Tail 60 } else { 'Nothing yet' }"`),
  logs: () => sh(`powershell -NoProfile -Command "Get-Content -LiteralPath (Join-Path $env:USERPROFILE '.aiapp\\bitnet\\install.log') -Tail 100"`),
};
