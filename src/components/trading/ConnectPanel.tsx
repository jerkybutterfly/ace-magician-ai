import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { trading } from '@/lib/trading';
import { toast } from 'sonner';

export function ConnectPanel({ onConnected }: { onConnected: () => void }) {
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [paper, setPaper] = useState(true);
  const [maxNotional, setMaxNotional] = useState('500');
  const [dailyLoss, setDailyLoss] = useState('200');
  const [unlock, setUnlock] = useState('');
  const [busy, setBusy] = useState(false);
  const [liveUnlocked, setLiveUnlocked] = useState(false);

  useEffect(() => {
    trading.settings()
      .then((s) => { setMaxNotional(String(s.max_notional)); setDailyLoss(String(s.daily_loss_limit)); setLiveUnlocked(s.live_unlocked); })
      .catch(() => {/* agent offline */});
  }, []);

  const connect = async () => {
    if (!key || !secret) { toast.error('Key and secret required'); return; }
    if (!paper && !liveUnlocked) { toast.error('Live trading is locked. Type ENABLE LIVE below first.'); return; }
    setBusy(true);
    try {
      const a = await trading.connect(key, secret, paper);
      toast.success(`Connected — ${a.paper ? 'paper' : 'LIVE'} equity ${a.equity.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
      onConnected();
    } catch (e) {
      toast.error(`Connect failed: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setBusy(false);
    }
  };

  const saveSettings = async () => {
    try {
      const r = await trading.updateSettings({
        max_notional: Number(maxNotional),
        daily_loss_limit: Number(dailyLoss),
        ...(unlock ? { unlock_phrase: unlock } : {}),
      });
      setLiveUnlocked(r.live_unlocked);
      setUnlock('');
      toast.success(`Settings saved${r.live_unlocked ? ' — LIVE trading unlocked' : ''}`);
    } catch (e) {
      toast.error(`Save failed: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  };

  return (
    <Card className="p-4 border-border/50 bg-card/50 space-y-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Settings</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Alpaca Key</Label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="PK…" />
        </div>
        <div>
          <Label className="text-xs">Alpaca Secret</Label>
          <Input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="••••••••" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Paper trading</Label>
          <div className="text-[11px] text-muted-foreground">Use paper-api.alpaca.markets — no real money.</div>
        </div>
        <Switch checked={paper} onCheckedChange={setPaper} disabled={!liveUnlocked} />
      </div>

      <Button onClick={connect} disabled={busy} className="w-full">
        {busy ? 'Connecting…' : `Connect ${paper ? 'paper' : 'LIVE'} account`}
      </Button>

      <div className="border-t border-border/40 pt-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Risk Limits</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Max $ per order</Label>
            <Input type="number" value={maxNotional} onChange={(e) => setMaxNotional(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Daily loss limit $</Label>
            <Input type="number" value={dailyLoss} onChange={(e) => setDailyLoss(e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Unlock live trading</Label>
          <Input value={unlock} onChange={(e) => setUnlock(e.target.value)} placeholder='Type "ENABLE LIVE" exactly' />
          <div className="text-[11px] text-muted-foreground mt-1">
            Currently: {liveUnlocked ? <span className="text-destructive">LIVE UNLOCKED</span> : 'paper-only'}
          </div>
        </div>
        <Button onClick={saveSettings} variant="outline" className="w-full">Save settings</Button>
      </div>
    </Card>
  );
}
