// Magentic-One bridge — Microsoft's hierarchical multi-agent planner
// (Orchestrator + WebSurfer + FileSurfer + Coder + Terminal), driven by Ollama.
import { getSettings } from './settings';

async function runOnHost(cmd: string, timeoutMs = 900_000) {
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

const DIR = '~/.aiapp/magentic';

export async function installMagentic() {
  const script = `
mkdir -p ${DIR} &&
pip install --user "autogen-agentchat" "autogen-ext[magentic-one,openai]" "playwright" &&
python3 -m playwright install --with-deps chromium &&
cat > ${DIR}/run.py <<'PY'
import asyncio, sys, os, json
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.teams.magentic_one import MagenticOne

async def main():
    task = sys.argv[1]
    model = os.environ.get("MO_MODEL", "llama3.2")
    base  = os.environ.get("OLLAMA_URL", "http://localhost:11434/v1")
    client = OpenAIChatCompletionClient(model=model, base_url=base, api_key="ollama",
        model_info={"vision": False, "function_calling": True, "json_output": True, "family": "unknown"})
    team = MagenticOne(client=client)
    await Console(team.run_stream(task=task))

asyncio.run(main())
PY
echo ok`;
  return runOnHost(script, 1_200_000);
}

export async function runMagentic(task: string, model = 'llama3.2') {
  const safe = task.replace(/"/g, '\\"');
  return runOnHost(`MO_MODEL=${model} python3 ${DIR}/run.py "${safe}"`, 1_800_000);
}
