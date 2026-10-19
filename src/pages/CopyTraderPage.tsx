import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  CopyCheck,
  Zap,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Play,
  Square,
  RefreshCw,
  Trash2,
  Terminal,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Award,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { copyTrader, CopyTraderStatus } from '@/lib/copytrader';

export default function CopyTraderPage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [st, setSt] = useState<CopyTraderStatus | null>(null);
  const [stake, setStake] = useState('1');
  const [minPrice, setMinPrice] = useState('0.45');
  const [maxPrice, setMaxPrice] = useState('0.85');
  const [maxPerWindow, setMaxPerWindow] = useState('2');
  const [noHedging, setNoHedging] = useState(true);
  const [live, setLive] = useState(false);
  const [confirmLive, setConfirmLive] = useState('');
  const [privateKey, setPrivateKey] = useState(() => localStorage.getItem('pm_private_key') || '');
  const [funderAddress, setFunderAddress] = useState(() => localStorage.getItem('pm_funder') || '');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const targetWallet = '0xc53375ff94e96100f2b30a4b5775db35218d69a9';
  const targetHandle = 'dangerously-skip-permissions';

  useEffect(() => {
    const poll = () => {
      copyTrader.status()
        .then(setSt)
        .catch(() => setSt(null));
    };
    poll();
    const id = setInterval(poll, 1500);
    return () => clearInterval(id);
  }, []);

  const run = async (label: string, fn: () => Promise<{ ok?: boolean; stdout?: string; stderr?: string }>) => {
    setBusy(label);
    setOutput('');
    try {
      const r = await fn();
      setOutput((r.stdout || '') + (r.stderr ? `\n${r.stderr}` : ''));
      toast.success(`${label} completed`);
    } catch (e) {
      toast.error(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const handleStart = () => {
    if (live) {
      if (!privateKey.trim()) {
        toast.error('Please enter your Polygon Private Key');
        return;
      }
      if (confirmLive !== 'ENABLE LIVE') {
        toast.error('Type ENABLE LIVE to confirm real-money trading');
        return;
      }
      localStorage.setItem('pm_private_key', privateKey.trim());
      if (funderAddress.trim()) {
        localStorage.setItem('pm_funder', funderAddress.trim());
      }
    }
    run('Start Copy Trader', () =>
      copyTrader.start({
        stake: Number(stake) || 10,
        minPrice: Number(minPrice) || 0.45,
        maxPrice: Number(maxPrice) || 0.85,
        maxPerWindow: Number(maxPerWindow) || 2,
        noHedging,
        live,
        privateKey: live ? privateKey.trim() : undefined,
        funderAddress: live && funderAddress.trim() ? funderAddress.trim() : undefined,
      })
    );
  };

  const handleClearHistory = async () => {
    try {
      await copyTrader.clearHistory();
      toast.success('History cleared');
    } catch (e) {
      toast.error('Failed to clear history');
    }
  };

  const formatUsd = (n: number | null | undefined) =>
    n == null ? '—' : `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatTime = (ts: number) => {
    if (!ts) return '—';
    const d = new Date(ts > 1e11 ? ts : ts * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={createConversation}
        onSelectConvo={selectConversation}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="flex items-center gap-3 border-b border-border p-4 bg-card/40 backdrop-blur">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CopyCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg flex items-center gap-2">
                Polymarket Copy Trader
                <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                  @{targetHandle}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Autonomous trade replication engine targeting high-volume short-interval market snipers
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant={st ? (st.mode === 'LIVE' ? 'destructive' : 'default') : 'secondary'}
              className="text-xs px-2.5 py-1 font-mono tracking-wide"
            >
              {st ? `${st.mode} · ${st.running ? 'RUNNING' : 'PAUSED'}` : 'OFFLINE'}
            </Badge>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Target Profile Hero Banner */}
          <Card className="p-5 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-background to-card relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-sm border border-emerald-500/30">
                    <Activity className="h-4 w-4" /> Target Trader Profile
                  </span>
                  <a
                    href={`https://polymarket.com/@${targetHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-400 transition-colors"
                  >
                    View on Polymarket <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={`https://polygonscan.com/address/${targetWallet}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-400 transition-colors"
                  >
                    PolygonScan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <h2 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                  @{targetHandle}
                </h2>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  Wallet: <span className="text-foreground/90">{targetWallet}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Specialization: High-frequency automated binary scalping on 5-min &amp; 15-min Bitcoin/Ethereum Up/Down windows.
                </p>
              </div>

              {/* Target Trader Historical Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-card/60 border border-border/80">
                  <div className="text-xs text-muted-foreground mb-1">Target PnL</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">+$326.0K</div>
                </div>
                <div className="p-3 rounded-lg bg-card/60 border border-border/80">
                  <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                  <div className="text-lg font-bold text-foreground font-mono">$18.9M</div>
                </div>
                <div className="p-3 rounded-lg bg-card/60 border border-border/80">
                  <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
                  <div className="text-lg font-bold text-foreground font-mono">25,874</div>
                </div>
                <div className="p-3 rounded-lg bg-card/60 border border-border/80">
                  <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                  <div className="text-lg font-bold text-foreground font-mono">50.0%</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Bot Performance Stats */}
          {st && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 space-y-1 bg-card/60 border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Your Copied PnL</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className={`text-2xl font-bold font-mono ${st.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {st.pnl >= 0 ? `+${formatUsd(st.pnl)}` : formatUsd(st.pnl)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Simulated / live returns
                </div>
              </Card>

              <Card className="p-4 space-y-1 bg-card/60 border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Trades Executed</span>
                  <CopyCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {st.total_copied}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Win/Loss: {st.wins}W - {st.losses}L
                </div>
              </Card>

              <Card className="p-4 space-y-1 bg-card/60 border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Bet Stake Size</span>
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-foreground">
                  ${st.stake.toFixed(2)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Max price cap: ${st.max_price.toFixed(2)}
                </div>
              </Card>

              <Card className="p-4 space-y-1 bg-card/60 border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Engine Heartbeat</span>
                  <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                </div>
                <div className="text-lg font-bold font-mono text-foreground truncate">
                  {st.last_check_ts ? formatTime(st.last_check_ts) : 'Polling...'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Check rate: every {st.poll_interval}s
                </div>
              </Card>
            </div>
          )}

          {/* Quick Actions & Live Control */}
          {st && (
            <Card className="p-4 flex flex-wrap items-center justify-between gap-3 bg-muted/40 border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quick Bot Controls:</span>
                {st.running ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => copyTrader.pause().then(() => toast.info('Bot paused'))}
                    className="h-8 gap-1"
                  >
                    <Square className="h-3.5 w-3.5" /> Pause Execution
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => copyTrader.resume().then(() => toast.success('Bot resumed'))}
                    className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Play className="h-3.5 w-3.5" /> Resume Copying
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => run('Stop Bot', copyTrader.stopProcess)}
                  className="h-8"
                >
                  Shut Down Process
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearHistory}
                  className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear History
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                Port: 8486 · Target: @{targetHandle}
              </div>
            </Card>
          )}

          {/* Configuration & Start Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4 border-border bg-card/60">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                <h3 className="font-semibold text-base">Setup &amp; Requirements</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Installs the standalone copy-trading engine (`public/polymarket_copy_trader.py`) into your local environment.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!busy}
                  onClick={() => run('Install Copy Engine', copyTrader.install)}
                >
                  Install Engine
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!busy}
                  onClick={() => run('Read Logs', copyTrader.logs)}
                >
                  <Terminal className="h-3.5 w-3.5 mr-1" /> View Engine Logs
                </Button>
              </div>
            </Card>

            <Card className="p-5 space-y-4 border-border bg-card/60">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                <h3 className="font-semibold text-base">Launch Parameters</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Win-Rate Strategy Preset:</span>
                  <span className="text-[11px] text-muted-foreground">Click to auto-tune parameters</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={minPrice === '0.50' && maxPrice === '0.80' && maxPerWindow === '1' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-[11px] px-2 font-medium"
                    onClick={() => {
                      setMinPrice('0.50');
                      setMaxPrice('0.80');
                      setMaxPerWindow('1');
                      setNoHedging(true);
                      toast.success('Sniper Mode applied (Target ~80% Win Rate)');
                    }}
                  >
                    🎯 Sniper (~80% WR)
                  </Button>
                  <Button
                    type="button"
                    variant={minPrice === '0.35' && maxPrice === '0.85' && maxPerWindow === '2' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-[11px] px-2 font-medium"
                    onClick={() => {
                      setMinPrice('0.35');
                      setMaxPrice('0.85');
                      setMaxPerWindow('2');
                      setNoHedging(true);
                      toast.success('Balanced Mode applied (Target ~65% Win Rate)');
                    }}
                  >
                    ⚖️ Balanced (~65% WR)
                  </Button>
                  <Button
                    type="button"
                    variant={minPrice === '0.05' && maxPerWindow === '10' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-[11px] px-2 font-medium"
                    onClick={() => {
                      setMinPrice('0.05');
                      setMaxPrice('0.90');
                      setMaxPerWindow('10');
                      setNoHedging(false);
                      toast.info('Raw Whale Mirror applied');
                    }}
                  >
                    🌊 Raw Mirror (~50%)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Stake ($ per Trade)</label>
                  <Input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max Trades / 5m Window</label>
                  <Input
                    type="number"
                    value={maxPerWindow}
                    onChange={(e) => setMaxPerWindow(e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Min Buy Price ($)</span>
                    <span className="text-[10px] text-emerald-400">Filters lottery bets</span>
                  </label>
                  <Input
                    type="number"
                    step="0.05"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="0.45"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Max Buy Price ($)</span>
                    <span className="text-[10px] text-amber-400">Caps slippage</span>
                  </label>
                  <Input
                    type="number"
                    step="0.05"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="0.85"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="no-hedging-chk"
                  checked={noHedging}
                  onChange={(e) => setNoHedging(e.target.checked)}
                  className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="no-hedging-chk" className="cursor-pointer text-muted-foreground hover:text-foreground">
                  <strong>Prevent Self-Hedging</strong> (Never bet both Up &amp; Down in the same 5-minute round)
                </label>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-medium">Live Money Trading:</span>{' '}
                    <span className={live ? 'text-rose-400 font-semibold' : 'text-muted-foreground'}>
                      {live ? 'ENABLED (Real Funds)' : 'DISABLED (Paper Money)'}
                    </span>
                  </div>
                  <Button
                    variant={live ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setLive(!live)}
                  >
                    {live ? 'Switch to Paper Mode' : 'Switch to Live Mode'}
                  </Button>
                </div>

                {live && (
                  <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-3">
                    <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                      <ShieldAlert className="h-4 w-4" /> Live Money Configuration
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Polygon Private Key (PM_PRIVATE_KEY) *</span>
                        <button
                          type="button"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10px]"
                        >
                          {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showPrivateKey ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPrivateKey ? 'text' : 'password'}
                          placeholder="0x... (64 hex characters from MetaMask or reveal.magic.link)"
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          className="font-mono text-xs bg-background/80 pr-8"
                        />
                        <Key className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        From MetaMask (Account Details → Show Private Key) or reveal.magic.link/polymarket. Stored locally on this PC.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground block">
                        Polymarket Funder Address (PM_FUNDER)
                      </label>
                      <Input
                        type="text"
                        placeholder="0x... (Only required if you login via Email / Google / Magic)"
                        value={funderAddress}
                        onChange={(e) => setFunderAddress(e.target.value)}
                        className="font-mono text-xs bg-background/80"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Your Polymarket deposit / profile wallet address holding the USDC. Leave blank if using MetaMask directly.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-rose-500/20 space-y-1">
                      <p className="font-semibold text-rose-300 text-[11px]">Safety Confirmation:</p>
                      <p className="text-[10px] text-muted-foreground">Type <strong>ENABLE LIVE</strong> to authorize real orders:</p>
                      <Input
                        placeholder="ENABLE LIVE"
                        value={confirmLive}
                        onChange={(e) => setConfirmLive(e.target.value)}
                        className="font-mono text-xs bg-background/80"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                disabled={!!busy}
                onClick={handleStart}
              >
                <Play className="h-4 w-4 mr-1.5" />
                {st?.running ? 'Update & Run Copy Trader' : `Start Copy Trading @${targetHandle}`}
              </Button>
            </Card>
          </div>

          {/* Terminal / Output Card if busy */}
          {output && (
            <Card className="p-4 space-y-2 bg-black border-border font-mono text-xs">
              <div className="flex items-center justify-between text-muted-foreground border-b border-border/40 pb-2">
                <span>Output Console</span>
                <Button variant="ghost" size="sm" onClick={() => setOutput('')} className="h-6 px-2 text-xs">Clear</Button>
              </div>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-emerald-400">{output}</pre>
            </Card>
          )}

          {/* Dual Feed Tabs: Target Live Feed & Your Copied Trades */}
          <Tabs defaultValue="target-feed" className="w-full space-y-4">
            <TabsList className="grid grid-cols-3 max-w-md bg-muted/60 p-1">
              <TabsTrigger value="target-feed" className="text-xs">
                Target's Trades ({st?.recent_target_trades?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="my-trades" className="text-xs">
                Your Copies ({st?.my_trades?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs">
                Bot Logs ({st?.log?.length ?? 0})
              </TabsTrigger>
            </TabsList>

            {/* Target Trader's Live Feed */}
            <TabsContent value="target-feed" className="space-y-3">
              <Card className="p-4 border-border bg-card/60">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Live Activity Stream for @{targetHandle}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    Polymarket Data API · Auto-refreshes
                  </span>
                </div>

                <div className="divide-y divide-border/40 mt-2">
                  {st?.recent_target_trades && st.recent_target_trades.length > 0 ? (
                    st.recent_target_trades.map((t, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-medium text-foreground truncate max-w-lg">
                            {t.title}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
                            <span>{formatTime(t.timestamp)}</span>
                            <span>•</span>
                            <span className={t.side === 'BUY' ? 'text-emerald-400' : 'text-amber-400'}>{t.side}</span>
                            <span>•</span>
                            <span>{t.size ? `${Number(t.size).toFixed(1)} shares` : ''}</span>
                            {t.transactionHash && (
                              <a
                                href={`https://polygonscan.com/tx/${t.transactionHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-emerald-400 underline"
                              >
                                tx:{t.transactionHash.slice(0, 8)}...
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <Badge
                            variant={t.outcome === 'Up' ? 'default' : 'secondary'}
                            className={`font-mono text-xs ${
                              t.outcome === 'Up'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {t.outcome === 'Up' ? (
                              <ArrowUpRight className="h-3 w-3 inline mr-0.5" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 inline mr-0.5" />
                            )}
                            {t.outcome || 'Share'} @ ${Number(t.price).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      {st ? 'Listening for new trades from @dangerously-skip-permissions...' : 'Start the bot to connect to Polymarket stream'}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Your Copied Trades */}
            <TabsContent value="my-trades" className="space-y-3">
              <Card className="p-4 border-border bg-card/60">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <CopyCheck className="h-4 w-4 text-emerald-400" />
                    Your Replicated Positions
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    Total: {st?.total_copied ?? 0} trades
                  </span>
                </div>

                <div className="divide-y divide-border/40 mt-2">
                  {st?.my_trades && st.my_trades.length > 0 ? (
                    st.my_trades.map((m) => (
                      <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-medium text-foreground truncate max-w-lg">
                            {m.title}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
                            <span>{formatTime(m.copied_at)}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{m.mode}</span>
                            <span>•</span>
                            <span>Stake: ${m.stake.toFixed(2)}</span>
                            <span>•</span>
                            <span>{m.shares} shares @ ${m.my_price.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <Badge
                            variant={m.status === 'WON' ? 'default' : m.status === 'LOST' ? 'destructive' : 'outline'}
                            className="font-mono text-xs"
                          >
                            {m.status}
                          </Badge>
                          <div className={`font-mono font-bold ${m.pnl > 0 ? 'text-emerald-400' : m.pnl < 0 ? 'text-rose-400' : 'text-muted-foreground'}`}>
                            {m.pnl ? `${m.pnl > 0 ? '+' : ''}$${m.pnl.toFixed(2)}` : '—'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      No copied trades yet. Once @dangerously-skip-permissions places a trade, it will be automatically cloned here.
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Engine Logs */}
            <TabsContent value="logs" className="space-y-3">
              <Card className="p-4 border-border bg-black font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/40 text-muted-foreground">
                  <span>Engine Activity Log</span>
                  <span>{st?.log?.length ?? 0} entries</span>
                </div>
                <div className="max-h-64 overflow-auto space-y-1 mt-2 text-foreground/80">
                  {st?.log && st.log.length > 0 ? (
                    [...st.log].reverse().map((line, idx) => (
                      <div key={idx} className="whitespace-pre-wrap">{line}</div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">Log is empty</div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </div>
  );
}
