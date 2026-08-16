// Stagehand bridge — Browserbase's high-level browser automation with typed actions.
import { getSettings } from './settings';

async function runOnHost(cmd: string, timeoutMs = 600_000) {
  const { agentUrl } = getSettings();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${agentUrl}/terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, stdout: data.stdout ?? '', stderr: data.stderr ?? '' };
  } finally { clearTimeout(t); }
}

const DIR = '~/.aiapp/stagehand';

export async function installStagehand() {
  const script = `
mkdir -p ${DIR} && cd ${DIR} &&
(test -f package.json || npm init -y) &&
npm i @browserbasehq/stagehand playwright &&
npx playwright install chromium &&
cat > ${DIR}/run.mjs <<'JS'
import { Stagehand } from "@browserbasehq/stagehand";
const [,, url, ...rest] = process.argv;
const instructions = rest.join(" ");
const sh = new Stagehand({
  env: "LOCAL",
  modelName: process.env.SH_MODEL || "llama3.2",
  modelClientOptions: { baseURL: process.env.OLLAMA_URL || "http://localhost:11434/v1", apiKey: "ollama" },
});
await sh.init();
await sh.page.goto(url);
const r = await sh.page.act({ action: instructions });
console.log(JSON.stringify(r, null, 2));
const extracted = await sh.page.extract({ instruction: "summarize the outcome", schema: { type: "object", properties: { summary: { type: "string" } } } });
console.log(JSON.stringify(extracted, null, 2));
await sh.close();
JS
echo ok`;
  return runOnHost(script, 900_000);
}

export const runStagehand = (url: string, instructions: string, model = 'llama3.2') =>
  runOnHost(`SH_MODEL=${model} node ${DIR}/run.mjs "${url}" "${instructions.replace(/"/g, '\\"')}"`, 900_000);
