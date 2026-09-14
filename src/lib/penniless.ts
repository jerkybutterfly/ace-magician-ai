// The Penniless Agent — agent-economy toolkit.
// Based on https://github.com/Echolonius/the-penniless-agent
// Earn (x402 services / agent bounty rails) -> Hold (receive-only EVM wallet)
// -> Spend (x402 + SIWX checkout). Everything here is read-only / keyless:
// balances come from public RPC eth_call, conformance checks are plain fetches.

const KEY = 'penniless-agent';

export interface PennilessConfig {
  wallet: string;           // receive-only EVM address (USDC on Base)
  rpcUrl: string;           // public Base RPC
  serviceUrl: string;       // your own x402 paid service, for conformance probing
  rules: boolean;           // safe-agent-commerce rules armed into the system prompt
}

export const DEFAULT_CONFIG: PennilessConfig = {
  wallet: '',
  rpcUrl: 'https://mainnet.base.org',
  serviceUrl: '',
  rules: false,
};

// USDC (native) on Base mainnet.
export const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export function getConfig(): PennilessConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveConfig(cfg: PennilessConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

async function rpc(rpcUrl: string, method: string, params: unknown[]): Promise<string> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'RPC error');
  return json.result as string;
}

function hexToDecimal(hex: string): bigint {
  if (!hex || hex === '0x') return 0n;
  return BigInt(hex);
}

function formatUnits(value: bigint, decimals: number, precision = 6): string {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const frac = (value % base).toString().padStart(decimals, '0').slice(0, precision);
  return `${whole}.${frac}`;
}

export interface WalletSnapshot {
  address: string;
  usdc: string;
  eth: string;
  checkedAt: number;
}

/** Keyless balance read: native ETH + USDC balanceOf via eth_call. */
export async function readWallet(cfg: PennilessConfig): Promise<WalletSnapshot> {
  const addr = cfg.wallet.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) throw new Error('Not a valid EVM address');
  const padded = addr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const [ethHex, usdcHex] = await Promise.all([
    rpc(cfg.rpcUrl, 'eth_getBalance', [addr, 'latest']),
    rpc(cfg.rpcUrl, 'eth_call', [{ to: USDC_BASE, data: `0x70a08231${padded}` }, 'latest']),
  ]);
  return {
    address: addr,
    eth: formatUnits(hexToDecimal(ethHex), 18, 6),
    usdc: formatUnits(hexToDecimal(usdcHex), 6, 2),
    checkedAt: Date.now(),
  };
}

export interface ConformanceCheck {
  label: string;
  ok: boolean;
  detail: string;
}

/**
 * x402 discoverability conformance recipe from the repo:
 * bare probe must answer 402 (not 400), carry the x402 document in the body,
 * expose /openapi.json (or /.well-known/x402), and declare x-payment-info.
 */
export async function probeService(url: string): Promise<ConformanceCheck[]> {
  const base = url.trim().replace(/\/$/, '');
  if (!base) throw new Error('Enter a service URL');
  const checks: ConformanceCheck[] = [];

  try {
    const res = await fetch(base, { method: 'GET' });
    const text = await res.text();
    let body: any = null;
    try { body = JSON.parse(text); } catch {}
    checks.push({
      label: 'Bare probe answers 402 (never 400)',
      ok: res.status === 402,
      detail: `HTTP ${res.status}`,
    });
    checks.push({
      label: 'PAYMENT-REQUIRED header present',
      ok: !!res.headers.get('payment-required'),
      detail: res.headers.get('payment-required') ? 'present' : 'missing',
    });
    checks.push({
      label: 'x402 document in the 402 body',
      ok: !!(body && (body.accepts || body.x402Version)),
      detail: body ? Object.keys(body).slice(0, 6).join(', ') || 'empty' : 'not JSON',
    });
    const ext = body?.accepts?.[0]?.extensions ?? body?.extensions;
    checks.push({
      label: 'bazaar input/output schema in extensions',
      ok: !!ext?.bazaar?.schema?.properties,
      detail: ext?.bazaar ? 'declared' : 'missing',
    });
    checks.push({
      label: 'sign-in-with-x challenge (SIWX)',
      ok: !!ext?.['sign-in-with-x'],
      detail: ext?.['sign-in-with-x'] ? 'challenge offered' : 'none',
    });
  } catch (e: any) {
    checks.push({ label: 'Service reachable from browser', ok: false, detail: String(e?.message || e) });
  }

  try {
    const res = await fetch(`${base}/openapi.json`);
    const spec = res.ok ? await res.json() : null;
    checks.push({ label: '/openapi.json served', ok: !!spec, detail: res.ok ? spec?.info?.title || 'ok' : `HTTP ${res.status}` });
    const pay = spec?.info?.['x-payment-info'] ?? spec?.['x-payment-info'];
    checks.push({
      label: 'x-payment-info declared (flat shape)',
      ok: !!pay?.protocols,
      detail: pay ? `${pay.pricingMode ?? '?'} ${pay.price ?? '?'} ${pay.currency ?? ''}`.trim() : 'missing',
    });
    checks.push({
      label: 'info.contact + info.x-guidance',
      ok: !!(spec?.info?.contact && spec?.info?.['x-guidance']),
      detail: spec?.info?.contact ? 'contact set' : 'missing',
    });
  } catch (e: any) {
    checks.push({ label: '/openapi.json served', ok: false, detail: String(e?.message || e) });
  }

  try {
    const res = await fetch(`${base}/.well-known/x402`);
    checks.push({ label: '/.well-known/x402 fallback', ok: res.ok, detail: `HTTP ${res.status}` });
  } catch {
    checks.push({ label: '/.well-known/x402 fallback', ok: false, detail: 'unreachable' });
  }

  return checks;
}

export interface RailLink {
  name: string;
  stage: 'EARN' | 'HOLD' | 'SPEND' | 'PERSIST';
  url: string;
  note: string;
}

export const RAILS: RailLink[] = [
  { name: 'Superteam Earn agent API', stage: 'EARN', url: 'https://superteam.fun', note: 'POST /api/agents returns a key — no email, no KYC. AGENT_ONLY listings exist.' },
  { name: 'x402 paid services', stage: 'EARN', url: 'https://www.x402.org/', note: 'Sell API calls for USDC. Keyless facilitator, no API keys to steal.' },
  { name: 'x402scan registry', stage: 'EARN', url: 'https://www.x402scan.com', note: 'Discovery. Register by wallet signature (SIWX) — 402 challenge, sign, 200.' },
  { name: 'Receive-only wallet (USDC on Base)', stage: 'HOLD', url: 'https://basescan.org', note: 'Key never touches a host. Services read balance by public eth_call.' },
  { name: 'Bitrefill agent skills', stage: 'SPEND', url: 'https://github.com/bitrefill/agents', note: 'x402 + SIWX checkout → gift cards, top-ups, real goods to a door.' },
  { name: 'GitHub Actions cron watcher', stage: 'PERSIST', url: 'https://github.com/Echolonius/echo-earning-agent', note: 'Polls listings, balance and service health every 30 min. Free on a public repo.' },
  { name: 'Discovery validator CLI', stage: 'PERSIST', url: 'https://www.npmjs.com/package/@agentcash/discovery', note: 'npx -y @agentcash/discovery yourdomain.com -v' },
];

export interface RuleGroup {
  title: string;
  points: string[];
}

/** safe-agent-commerce — the seven rule groups, condensed. */
export const SAFE_COMMERCE_RULES: RuleGroup[] = [
  {
    title: '1. Payment evidence before work',
    points: [
      'Never start work on a promised bounty without proof that source has actually paid someone.',
      'Look for funding/escrow confirmation on the issue, and merged PRs with confirmed payouts.',
      'Own-token rewards are not payment evidence — assume worthless until proven liquid.',
    ],
  },
  {
    title: '2. Audit marketplaces on-chain, not by marketing',
    points: [
      'Read raw stablecoin flows with eth_getLogs on the settlement contract.',
      'Compute jobs/day, volume and distinct buyers; watch for self-dealing test loops.',
      'Set a numeric bar in advance (e.g. >N distinct organic buyers/day) before joining.',
    ],
  },
  {
    title: '3. Wallet discipline',
    points: [
      'Receive-only by default: sign messages for auth, never approvals or spends unprompted.',
      'Services hold zero secrets — keyless in, public RPC reads out.',
      'Never commit a key, mnemonic or .env; scan before every push.',
    ],
  },
  {
    title: '4. Fee-and-threshold arithmetic',
    points: [
      'Compute the full toll before moving money; sub-dollar moves are destroyed by fees.',
      'Think in unlock thresholds, not balances. Earn on zero-capital rails first.',
      '"Multiply a tiny amount safely and fast" does not exist — say so plainly.',
    ],
  },
  {
    title: '5. Keys and reputation over accounts',
    points: [
      'Prefer SIWX / EIP-4361 and existing identities over new signups (that consent is the human\'s).',
      'Check payout KYC requirements before working, not after winning.',
      'Disclose agent identity in outreach and PRs — deception debt always comes due.',
    ],
  },
  {
    title: '6. Outreach ethics',
    points: [
      'Contribute only where you have standing: a bug you hit, a fix you validated.',
      'Never mass-post, pile onto claimed issues, or double-post promotion.',
    ],
  },
  {
    title: '7. Verify your own outputs like a counterparty',
    points: [
      'Re-fetch every outward artifact from the public side and check it validates.',
      'Diff-check changed lines; count records rather than trusting exit codes.',
      'Keep an append-only record of every artifact (URL + state) the moment it is created.',
    ],
  },
];

export const RULES_MARKER = '## SAFE AGENT COMMERCE';

/** The block appended to the chat system prompt when the rules are armed. */
export function rulesPromptBlock(): string {
  const body = SAFE_COMMERCE_RULES.map(
    (g) => `${g.title}\n${g.points.map((p) => `- ${p}`).join('\n')}`,
  ).join('\n\n');
  return `\n\n${RULES_MARKER}\nBefore working for a promised payment, joining an earning platform, moving funds, or evaluating a marketplace, apply these field-tested rules:\n\n${body}\n\nVerify settlement reality before committing anything — the user's labour and compute are capital too.`;
}
