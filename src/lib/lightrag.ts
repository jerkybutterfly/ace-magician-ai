// LightRAG bridge — graph-enhanced retrieval augmentation over local docs.
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

const DIR = '~/.aiapp/lightrag';

export async function installLightRAG() {
  const script = `
mkdir -p ${DIR}/store &&
pip install --user "lightrag-hku" "ollama" &&
cat > ${DIR}/cli.py <<'PY'
import asyncio, os, sys, json, glob
from lightrag import LightRAG, QueryParam
from lightrag.llm.ollama import ollama_model_complete, ollama_embed
from lightrag.utils import EmbeddingFunc

WORKDIR = os.path.expanduser("~/.aiapp/lightrag/store")
MODEL = os.environ.get("LR_MODEL", "llama3.2")
EMBED = os.environ.get("LR_EMBED", "nomic-embed-text")
BASE  = os.environ.get("OLLAMA_URL", "http://localhost:11434")

def make():
    return LightRAG(
        working_dir=WORKDIR,
        llm_model_func=ollama_model_complete,
        llm_model_name=MODEL,
        llm_model_kwargs={"host": BASE, "options": {"num_ctx": 8192}},
        embedding_func=EmbeddingFunc(embedding_dim=768, max_token_size=8192,
            func=lambda t: ollama_embed(t, embed_model=EMBED, host=BASE)))

async def ingest(path):
    rag = make()
    files = glob.glob(path) if any(c in path for c in "*?[") else [path]
    for f in files:
        with open(f, "r", errors="ignore") as fh:
            await rag.ainsert(fh.read())
        print(f"ingested {f}")

async def query(q, mode="hybrid"):
    rag = make()
    print(await rag.aquery(q, param=QueryParam(mode=mode)))

cmd = sys.argv[1]
arg = sys.argv[2] if len(sys.argv) > 2 else ""
if cmd == "ingest": asyncio.run(ingest(arg))
elif cmd == "query": asyncio.run(query(arg, sys.argv[3] if len(sys.argv) > 3 else "hybrid"))
PY
echo ok`;
  return runOnHost(script, 900_000);
}

export const lightragIngest = (path: string, model = 'llama3.2') =>
  runOnHost(`LR_MODEL=${model} python3 ${DIR}/cli.py ingest "${path.replace(/"/g, '\\"')}"`, 900_000);

export const lightragQuery = (q: string, mode: 'naive' | 'local' | 'global' | 'hybrid' = 'hybrid', model = 'llama3.2') =>
  runOnHost(`LR_MODEL=${model} python3 ${DIR}/cli.py query "${q.replace(/"/g, '\\"')}" ${mode}`, 600_000);
