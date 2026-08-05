// browser-use bridge: LLM-driven browser automation (https://github.com/browser-use/browser-use)
// Runs on the agent host through /terminal. Ollama drives the browser via Playwright under the hood.
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
  } finally {
    clearTimeout(t);
  }
}

const BU_DIR = '~/.aiapp/browser-use';

export async function installBrowserUse() {
  const script = `
mkdir -p ${BU_DIR} &&
pip install --user browser-use langchain-ollama &&
python3 -m playwright install chromium &&
cat > ${BU_DIR}/run.py <<'PY'
import asyncio, sys, os, json
from browser_use import Agent
from langchain_ollama import ChatOllama

async def main():
    task = sys.argv[1]
    model = os.environ.get("BU_MODEL", "llama3.2")
    llm = ChatOllama(model=model, base_url=os.environ.get("OLLAMA_URL","http://localhost:11434"))
    agent = Agent(task=task, llm=llm)
    result = await agent.run(max_steps=int(os.environ.get("BU_MAX_STEPS","25")))
    print(json.dumps({"final": str(result)}))

asyncio.run(main())
PY
echo "ok"`;
  return runOnHost(script, 900_000);
}

export async function runBrowserTask(task: string, opts: { model?: string; maxSteps?: number } = {}) {
  const { model = 'llama3.2', maxSteps = 25 } = opts;
  const safe = task.replace(/"/g, '\\"');
  const cmd = `BU_MODEL=${model} BU_MAX_STEPS=${maxSteps} python3 ${BU_DIR}/run.py "${safe}"`;
  return runOnHost(cmd, 900_000);
}
