// Kronos bridge — foundation model for financial candlesticks (shiyu-coder/Kronos).
// Clones the repo to ~/.aiapp/kronos on the mini PC, installs deps, and runs forecasts
// on live Binance candles through the local agent /terminal endpoint.
import { getSettings } from './settings';

const DIR = '~/.aiapp/kronos';

async function sh(command: string, timeoutMs = 900_000) {
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
    if (!r.ok) throw new Error(data.stderr || `HTTP ${r.status}`);
    return { stdout: (data.stdout ?? '') as string, stderr: (data.stderr ?? '') as string };
  } finally { clearTimeout(t); }
}

export const KRONOS_MODELS = [
  { id: 'NeoQuasar/Kronos-mini', tokenizer: 'NeoQuasar/Kronos-Tokenizer-2k', ctx: 2048, label: 'mini (4M, fastest)' },
  { id: 'NeoQuasar/Kronos-small', tokenizer: 'NeoQuasar/Kronos-Tokenizer-base', ctx: 512, label: 'small (25M)' },
  { id: 'NeoQuasar/Kronos-base', tokenizer: 'NeoQuasar/Kronos-Tokenizer-base', ctx: 512, label: 'base (102M, best)' },
];

const RUNNER = `import sys, json, urllib.request, pandas as pd
sys.path.insert(0, '.')
from model import Kronos, KronosTokenizer, KronosPredictor
sym, itv, lookback, pred, mid, tid, ctx, samples = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5], sys.argv[6], int(sys.argv[7]), int(sys.argv[8])
url = f"https://api.binance.com/api/v3/klines?symbol={sym}&interval={itv}&limit={lookback}"
rows = json.loads(urllib.request.urlopen(url, timeout=30).read())
df = pd.DataFrame([[pd.to_datetime(r[0], unit='ms'), float(r[1]), float(r[2]), float(r[3]), float(r[4]), float(r[5]), float(r[7])] for r in rows],
  columns=['timestamps','open','high','low','close','volume','amount'])
step = df['timestamps'].iloc[-1] - df['timestamps'].iloc[-2]
y_ts = pd.Series([df['timestamps'].iloc[-1] + step * (i + 1) for i in range(pred)])
p = KronosPredictor(Kronos.from_pretrained(mid), KronosTokenizer.from_pretrained(tid), max_context=ctx)
out = p.predict(df=df[['open','high','low','close','volume','amount']], x_timestamp=df['timestamps'], y_timestamp=y_ts, pred_len=pred, T=1.0, top_p=0.9, sample_count=samples)
hist = [{'t': str(t), 'close': c} for t, c in zip(df['timestamps'], df['close'])]
fc = [{'t': str(t), 'open': float(r['open']), 'high': float(r['high']), 'low': float(r['low']), 'close': float(r['close'])} for t, (_, r) in zip(y_ts, out.iterrows())]
print('@@KRONOS@@' + json.dumps({'history': hist, 'forecast': fc}))
`;

export interface KronosResult {
  history: { t: string; close: number }[];
  forecast: { t: string; open: number; high: number; low: number; close: number }[];
}

export const kronos = {
  install: () => sh(`mkdir -p ~/.aiapp && cd ~/.aiapp && (test -d kronos || git clone --depth 1 https://github.com/shiyu-coder/Kronos.git kronos) && cd kronos && git pull --ff-only; python -m pip install -r requirements.txt && echo installed`, 1800_000),
  status: async () => {
    const r = await sh(`test -f ${DIR}/model/__init__.py && echo yes || echo no`, 20_000).catch(() => ({ stdout: 'no' }));
    return r.stdout.includes('yes');
  },
  forecast: async (o: { symbol: string; interval: string; lookback: number; pred: number; model: typeof KRONOS_MODELS[number]; samples: number }) => {
    const b64 = btoa(RUNNER);
    const cmd = `cd ${DIR} && python -c "import base64;open('pesto_run.py','w').write(base64.b64decode('${b64}').decode())" && python pesto_run.py ${o.symbol} ${o.interval} ${o.lookback} ${o.pred} ${o.model.id} ${o.model.tokenizer} ${o.model.ctx} ${o.samples}`;
    const r = await sh(cmd, 1200_000);
    const line = r.stdout.split('\n').find((l) => l.startsWith('@@KRONOS@@'));
    if (!line) throw new Error((r.stderr || r.stdout).slice(-600) || 'No forecast output');
    return JSON.parse(line.slice(10)) as KronosResult;
  },
};
