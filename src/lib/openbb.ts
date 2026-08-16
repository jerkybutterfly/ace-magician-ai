// OpenBB bridge — research-grade financial data via the OpenBB Platform.
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
  } finally { clearTimeout(t); }
}

const DIR = '~/.aiapp/openbb';

export async function installOpenBB() {
  const script = `
mkdir -p ${DIR} &&
pip install --user "openbb[all]" &&
cat > ${DIR}/run.py <<'PY'
import sys, json
from openbb import obb
cmd, arg = sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else ""
if cmd == "quote":
    r = obb.equity.price.quote(arg)
elif cmd == "news":
    r = obb.news.company(arg, limit=15)
elif cmd == "fundamentals":
    r = obb.equity.fundamental.overview(arg)
elif cmd == "historical":
    r = obb.equity.price.historical(arg, provider="yfinance")
elif cmd == "screener":
    r = obb.equity.screener()
else:
    print(json.dumps({"error": f"unknown {cmd}"})); sys.exit(1)
print(r.to_df().tail(30).to_json(orient="records") if hasattr(r,"to_df") else json.dumps(r.model_dump()))
PY
echo ok`;
  return runOnHost(script, 900_000);
}

export const openbbQuote = (sym: string) => runOnHost(`python3 ${DIR}/run.py quote ${sym}`);
export const openbbNews = (sym: string) => runOnHost(`python3 ${DIR}/run.py news ${sym}`);
export const openbbFundamentals = (sym: string) => runOnHost(`python3 ${DIR}/run.py fundamentals ${sym}`);
export const openbbHistorical = (sym: string) => runOnHost(`python3 ${DIR}/run.py historical ${sym}`);
