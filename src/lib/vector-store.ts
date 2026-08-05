// Vector store bridge: Chroma (embeddings) + llama_index (RAG) running on the agent host.
// Provides ingest + query over local sources: Obsidian vault, Files, Hermes episodes.
import { getSettings } from './settings';

async function runOnHost(cmd: string, timeoutMs = 300_000) {
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

const RAG_DIR = '~/.aiapp/rag';

/** One-time install of chromadb + llama_index and scaffold of the RAG scripts. */
export async function installRagStack() {
  const setup = `
mkdir -p ${RAG_DIR} &&
pip install --user chromadb llama-index llama-index-embeddings-ollama llama-index-llms-ollama &&
cat > ${RAG_DIR}/ingest.py <<'PY'
import sys, os, chromadb
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.ollama import OllamaEmbedding

coll = sys.argv[1]; path = sys.argv[2]
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")
client = chromadb.PersistentClient(path=os.path.expanduser("~/.aiapp/rag/chroma"))
c = client.get_or_create_collection(coll)
vs = ChromaVectorStore(chroma_collection=c)
sc = StorageContext.from_defaults(vector_store=vs)
docs = SimpleDirectoryReader(path, recursive=True).load_data()
VectorStoreIndex.from_documents(docs, storage_context=sc)
print(f"indexed {len(docs)} docs into {coll}")
PY
cat > ${RAG_DIR}/query.py <<'PY'
import sys, os, chromadb, json
from llama_index.core import VectorStoreIndex, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.llms.ollama import Ollama

coll = sys.argv[1]; q = sys.argv[2]; k = int(sys.argv[3]) if len(sys.argv) > 3 else 4
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")
Settings.llm = Ollama(model=os.environ.get("RAG_LLM","llama3.2"))
client = chromadb.PersistentClient(path=os.path.expanduser("~/.aiapp/rag/chroma"))
c = client.get_or_create_collection(coll)
vs = ChromaVectorStore(chroma_collection=c)
idx = VectorStoreIndex.from_vector_store(vs)
qe = idx.as_query_engine(similarity_top_k=k)
r = qe.query(q)
print(json.dumps({"answer": str(r), "sources": [n.node.metadata for n in r.source_nodes]}))
PY
echo "ok"`;
  return runOnHost(setup, 600_000);
}

export async function listCollections() {
  const r = await runOnHost(`ls ${RAG_DIR}/chroma 2>/dev/null || echo ""`);
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
}

export async function ingestPath(collection: string, path: string) {
  return runOnHost(`python3 ${RAG_DIR}/ingest.py "${collection}" "${path}"`, 900_000);
}

export async function queryCollection(collection: string, query: string, k = 4) {
  const q = query.replace(/"/g, '\\"');
  const r = await runOnHost(`python3 ${RAG_DIR}/query.py "${collection}" "${q}" ${k}`, 180_000);
  try {
    const line = r.stdout.trim().split('\n').pop() || '{}';
    return JSON.parse(line);
  } catch {
    return { answer: r.stdout, sources: [], error: r.stderr };
  }
}
