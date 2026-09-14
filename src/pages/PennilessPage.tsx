import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Coins, Wallet, RefreshCw, ShieldCheck, ExternalLink, CheckCircle2, XCircle,
  Radar, ArrowRight,
} from 'lucide-react';
import {
  getConfig, saveConfig, readWallet, probeService, RAILS, SAFE_COMMERCE_RULES,
  rulesPromptBlock, RULES_MARKER,
  type PennilessConfig, type WalletSnapshot, type ConformanceCheck,
} from '@/lib/penniless';
import { getSettings, updateSettings, DEFAULT_SYSTEM_PROMPT } from '@/lib/settings';

const STAGE_COLORS: Record<string, string> = {
  EARN: 'bg-primary/15 text-primary border-primary/30',
  HOLD: 'bg-secondary text-foreground border-border',
  SPEND: 'bg-accent/20 text-accent-foreground border-accent/40',
  PERSIST: 'bg-muted text-muted-foreground border-border',
};

export default function PennilessPage() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<PennilessConfig>(getConfig);
  const [snap, setSnap] = useState<WalletSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<ConformanceCheck[] | null>(null);
  const [probing, setProbing] = useState(false);
  const [armed, setArmed] = useState(() =>
    (getSettings().systemPrompt || '').includes(RULES_MARKER),
  );

  const patch = (p: Partial<PennilessConfig>) => {
    const next = { ...cfg, ...p };
    setCfg(next);
    saveConfig(next);
  };

  const refreshWallet = async () => {
    setLoading(true);
    try {
      setSnap(await readWallet(cfg));
    } catch (e: any) {
      toast({ title: 'Balance read failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const runProbe = async () => {
    setProbing(true);
    try {
      setChecks(await probeService(cfg.serviceUrl));
    } catch (e: any) {
      toast({ title: 'Probe failed', description: e.message, variant: 'destructive' });
    } finally {
      setProbing(false);
    }
  };

  const toggleRules = () => {
    const current = getSettings().systemPrompt || DEFAULT_SYSTEM_PROMPT;
    if (armed) {
      const stripped = current.split(`\n\n${RULES_MARKER}`)[0].trimEnd();
      updateSettings({ systemPrompt: stripped });
      setArmed(false);
      patch({ rules: false });
      toast({ title: 'Commerce rules removed from the system prompt' });
    } else {
      updateSettings({ systemPrompt: current.trimEnd() + rulesPromptBlock() });
      setArmed(true);
      patch({ rules: true });
      toast({ title: 'Safe-agent-commerce rules armed', description: 'Steve will apply them before any money-adjacent task.' });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">The Penniless Agent</h1>
          <Badge variant="outline" className="text-[10px]">agent economy</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Earn → hold → spend, with no accounts and no KYC. Keyless reads only: nothing here can sign a transaction.
        </p>
      </header>

      {/* Pipeline */}
      <section className="grid gap-3 md:grid-cols-4">
        {(['EARN', 'HOLD', 'SPEND', 'PERSIST'] as const).map((stage) => (
          <div key={stage} className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={`text-[10px] border ${STAGE_COLORS[stage]}`}>{stage}</Badge>
              {stage !== 'PERSIST' && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
            {RAILS.filter((r) => r.stage === stage).map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="block group rounded-lg p-2 hover:bg-secondary/60 transition-colors"
              >
                <div className="flex items-center gap-1 text-xs font-medium">
                  {r.name}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{r.note}</p>
              </a>
            ))}
          </div>
        ))}
      </section>

      {/* Wallet */}
      <section className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Receive-only wallet — USDC on Base</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="0x… your receive-only address"
            value={cfg.wallet}
            onChange={(e) => patch({ wallet: e.target.value })}
            className="font-mono text-xs"
          />
          <Input
            placeholder="RPC URL"
            value={cfg.rpcUrl}
            onChange={(e) => patch({ rpcUrl: e.target.value })}
            className="font-mono text-xs sm:max-w-[240px]"
          />
          <Button onClick={refreshWallet} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Read balance
          </Button>
        </div>
        {snap && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">USDC</div>
              <div className="text-2xl font-bold text-primary tabular-nums">${snap.usdc}</div>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">ETH (gas)</div>
              <div className="text-2xl font-bold tabular-nums">{snap.eth}</div>
            </div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Read by public <code className="font-mono">eth_call</code> — the private key is never entered here and never leaves your machine.
        </p>
      </section>

      {/* Conformance probe */}
      <section className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">x402 discoverability audit</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Point this at a paid service you run. It replays the conformance recipe other agents' crawlers use.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="https://your-service.deno.net"
            value={cfg.serviceUrl}
            onChange={(e) => patch({ serviceUrl: e.target.value })}
            className="font-mono text-xs"
          />
          <Button onClick={runProbe} disabled={probing} variant="secondary">
            <Radar className={`h-4 w-4 mr-1 ${probing ? 'animate-pulse' : ''}`} />
            Probe
          </Button>
        </div>
        {checks && (
          <ul className="space-y-1">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-xs py-1 border-b border-border/30 last:border-0">
                {c.ok
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  : <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />}
                <span className="flex-1">{c.label}</span>
                <span className="text-muted-foreground font-mono text-[10px] text-right">{c.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rules */}
      <section className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Safe agent commerce</h2>
            {armed && <Badge className="text-[10px] bg-primary/15 text-primary border border-primary/30">armed</Badge>}
          </div>
          <Button size="sm" variant={armed ? 'secondary' : 'default'} onClick={toggleRules}>
            {armed ? 'Remove from Steve' : 'Arm these rules in chat'}
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {SAFE_COMMERCE_RULES.map((g) => (
            <div key={g.title} className="rounded-lg bg-secondary/30 p-3">
              <div className="text-xs font-semibold mb-1">{g.title}</div>
              <ul className="space-y-1">
                {g.points.map((p) => (
                  <li key={p} className="text-[11px] text-muted-foreground leading-snug pl-3 relative">
                    <span className="absolute left-0 text-primary">·</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-muted-foreground text-center">
        Adapted from{' '}
        <a className="underline hover:text-primary" href="https://github.com/Echolonius/the-penniless-agent" target="_blank" rel="noreferrer">
          Echolonius/the-penniless-agent
        </a>
      </p>
    </div>
  );
}
