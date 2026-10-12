import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';
import { polybot } from '@/lib/polybot';

export default function PolybotPage() {
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [st, setSt] = useState<any>(null);
  const [win, setWin] = useState<5 | 15>(15);
  const [edge, setEdge] = useState('0.06');
  const [stake, setStake] = useState('10');
  const [live, setLive] = useState(false);
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    const id = setInterval(() => polybot.status().then(setSt).catch(() => setSt(null)), 1000);
    return () => clearInterval(id);
  }, []);

  const run = async (label: string, fn: () => Promise<{ stdout: string; stderr: string }>) => {
    setBusy(label); setOutput('');
    try { const r = await fn(); setOutput((r.stdout || '') + (r.stderr ? `\n${r.stderr}` : '')); toast.success(`${label} finished`); }
    catch (e) { toast.error(`${label} failed: ${(e as Error).message}`); }
    finally { setBusy(null); }
  };

  const start = () => {
    if (live && confirm !== 'ENABLE LIVE') { toast.error('Type ENABLE LIVE to use real money'); return; }
    run('Start', () => polybot.start({ window: win, edge: Number(edge), stake: Number(stake), live }));
  };

  const f = (n: any, d = 3) => (n == null ? '—' : Number(n).toFixed(d));

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar conversations={conversations} currentConvoId={currentConvoId} onNewChat={createConversation} onSelectConvo={selectConversation} onDeleteConvo={deleteConversation} />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b border-border p-3">
          <SidebarTrigger />
          <Zap className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Polymarket Speed Bot</h1>
          <Badge variant={st ? (st.mode === 'LIVE' ? 'destructive' : 'default') : 'secondary'} className="ml-auto">
            {st ? `${st.mode} · ${st.running ? 'RUNNING' : 'PAUSED'}` : 'OFF'}
          </Badge>
        </header>
        <div className="space-y-4 p-4">
          {st && (
            <Card className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="BTC" value={st.btc ? `$${Number(st.btc).toLocaleString()}` : '—'} />
                <Stat label="Binance delay" value={`${f(st.binance_lag_ms, 0)} ms`} />
                <Stat label="Polymarket delay" value={`${f(st.clob_lag_ms, 0)} ms`} />
                <Stat label="Decision time" value={`${st.decide_us ?? '—'} µs`} />
                <Stat label="Fair chance Up" value={st.fair_up != null ? `${(st.fair_up * 100).toFixed(1)}%` : '—'} />
                <Stat label="Up / Down price" value={`${f(st.asks?.UP, 2)} / ${f(st.asks?.DOWN, 2)}`} />
                <Stat label="Wins / losses" value={`${st.wins} / ${st.losses}`} />
                <Stat label="Profit" value={`$${f(st.pnl, 2)}`} />
              </div>
              <div className="flex gap-2">
                {st.running
                  ? <Button variant="destructive" onClick={() => polybot.pause()}>Kill switch</Button>
                  : <Button onClick={() => polybot.resume()}>Resume</Button>}
                <Button variant="outline" onClick={() => run('Stop', polybot.stopProcess)}>Shut down bot</Button>
              </div>
              <div className="max-h-48 overflow-auto rounded bg-muted p-2 font-mono text-xs">
                {[...(st.log ?? [])].reverse().map((l: string, i: number) => <div key={i}>{l}</div>)}
              </div>
            </Card>
          )}

          <Card className="space-y-3 p-4">
            <h2 className="font-medium">Step 1 — Set up on the mini PC</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={!!busy} onClick={() => run('Check Python', polybot.checkPython)}>Check Python</Button>
              <Button disabled={!!busy} onClick={() => run('Install', polybot.install)}>Install bot</Button>
              <Button variant="outline" disabled={!!busy} onClick={() => run('Install live tools', polybot.installLive)}>Install real-money tools</Button>
              <Button variant="outline" disabled={!!busy} onClick={() => run('Logs', polybot.logs)}>Logs</Button>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="font-medium">Step 2 — Start</h2>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <label>Market length
                <select className="mt-1 w-full rounded border border-input bg-background p-2" value={win} onChange={(e) => setWin(Number(e.target.value) as 5 | 15)}>
                  <option value={15}>15 min</option><option value={5}>5 min</option>
                </select>
              </label>
              <label>Min edge<Input value={edge} onChange={(e) => setEdge(e.target.value)} /></label>
              <label>$ per bet<Input value={stake} onChange={(e) => setStake(e.target.value)} /></label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> Use real money
            </label>
            {live && (
              <div className="space-y-2 rounded border border-destructive p-3 text-sm">
                <p>Real money needs your Polymarket wallet key saved on the mini PC as PM_PRIVATE_KEY (and PM_FUNDER if you log in by email). Losses are real.</p>
                <Input placeholder="Type ENABLE LIVE" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            )}
            <Button disabled={!!busy} onClick={start}>Start bot</Button>
          </Card>

          {output && <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{output}</pre>}
        </div>
      </SidebarInset>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-mono">{value}</div></div>;
}
