// REA bridge — "Reverse Engineer Anything" runs on the AM06 host via the helper (Windows-safe commands).
// Repo: https://github.com/morluto/rea — npm package: rea-agents
// Inspects native binaries, JavaScript/Electron apps, .NET assemblies, websites, APKs and more,
// returning findings with evidence. CLI: `rea` (or `npx rea-agents`).
import { getSettings } from './settings';

async function sh(command: string, timeoutMs = 120_000) {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

export const rea = {
  // REA needs Node.js 22.19+, 24.11+, or 26+.
  checkNode: () => sh(`node --version && npm --version`),

  checkInstalled: () => sh(`rea --version || echo NOT_INSTALLED`),

  // Global install of the CLI.
  install: () => sh(`npm install --global rea-agents && rea --version`, 600_000),

  update: () => sh(`rea update`, 600_000),

  // Analyze an extracted JavaScript/Electron app directory or ASAR file.
  analyzeJs: (targetPath: string) =>
    sh(`rea analyze-javascript-application "${targetPath}" --json`, 600_000),

  // Inspect a Go binary's embedded build info (no Go install needed).
  inspectGo: (targetPath: string) =>
    sh(`rea inspect-go-binary "${targetPath}" --json`, 300_000),

  // Static .NET assembly inspection (metadata, CIL, native deps).
  inspectDotnet: (targetPath: string) =>
    sh(`rea inspect-dotnet-assembly "${targetPath}" --json`, 300_000),

  // Analyze a saved HAR network capture.
  analyzeHar: (harPath: string) =>
    sh(`rea analyze-network-capture "${harPath}" --json`, 300_000),

  // List every available command.
  help: () => sh(`rea --help`),

  // Check for an optional native analysis engine (Hopper/Ghidra/IDA) — only needed for native binaries.
  nativeStatus: () => sh(`rea native-status || echo "No native engine configured (only needed for native binaries)"`),
};
