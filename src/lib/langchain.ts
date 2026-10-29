import { getSettings } from './settings';

const ROOT = '%USERPROFILE%\\.aiapp\\langchain';

export interface LangChainStep { tool: string; input: unknown; output: string; }
export interface LangChainAgentResult { output: string; steps: LangChainStep[]; model: string; }
export interface LangChainStatus { installed: boolean; version?: string; error?: string; }

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

async function api<T>(path: string, body?: unknown, timeoutMs = 180_000): Promise<T> {
  const { agentUrl } = getSettings();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${agentUrl.replace(/\/$/, '')}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Mini PC helper returned an error');
    return data as T;
  } finally { clearTimeout(timer); }
}

export const langchain = {
  checkTools: () => sh('py --version & ollama --version'),
  install: () => {
    const origin = new URL(window.location.origin);
    if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Open the web version of this app to install LangChain.');
    const scriptUrl = `${origin.origin}/langchain_install.ps1`;
    return sh(`if not exist "${ROOT}" mkdir "${ROOT}" & curl --fail -L "${scriptUrl}" -o "${ROOT}\\install.ps1" && start "LangChain installation" /min cmd /c "powershell -NoProfile -ExecutionPolicy Bypass -File ""${ROOT}\\install.ps1"" > ""${ROOT}\\install.log"" 2>&1"`);
  },
  installation: async () => {
    const r = await sh(`if exist "${ROOT}\\install.ok" (echo LANGCHAIN_INSTALLED) else if exist "${ROOT}\\install.failed" (echo LANGCHAIN_FAILED) else (echo LANGCHAIN_NOT_VERIFIED)`);
    if (r.returncode !== 0) throw new Error(r.stderr || 'Installation check failed');
    return r.stdout.includes('LANGCHAIN_INSTALLED') ? 'installed' : r.stdout.includes('LANGCHAIN_FAILED') ? 'failed' : 'not-verified';
  },
  status: () => api<LangChainStatus>('/langchain/status', undefined, 15_000),
  runAgent: (task: string, model: string) => api<LangChainAgentResult>('/langchain/agent', { task, model }),
  logs: () => sh(`powershell -NoProfile -Command "Get-Content -LiteralPath (Join-Path $env:USERPROFILE '.aiapp\\langchain\\install.log') -Tail 120"`),
};
