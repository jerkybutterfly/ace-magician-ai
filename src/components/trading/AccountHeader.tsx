import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trading, fmtMoney, type Account } from '@/lib/trading';
import { TrendingDown, TrendingUp, WifiOff } from 'lucide-react';

export function AccountHeader({ refreshKey }: { refreshKey: number }) {
  const [acct, setAcct] = useState<Account | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    trading.account()
      .then((a) => !cancelled && (setAcct(a), setErr(null)))
      .catch((e) => !cancelled && setErr(e.message));
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (err || !acct?.connected) {
    return (
      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <WifiOff className="h-4 w-4" />
          {err ? `Agent offline — ${err}` : 'Not connected to Alpaca. Open Settings below to connect.'}
        </div>
      </Card>
    );
  }

  const up = acct.day_pnl >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <Card className="p-4 border-border/50 bg-card/50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Account</div>
        <Badge variant={acct.paper ? 'secondary' : 'destructive'} className="text-[10px]">
          {acct.paper ? 'PAPER' : 'LIVE'}
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Equity" value={fmtMoney(acct.equity)} />
        <Stat label="Buying Power" value={fmtMoney(acct.buying_power)} />
        <Stat label="Cash" value={fmtMoney(acct.cash)} />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Day P&amp;L</div>
          <div className={`text-lg font-semibold flex items-center gap-1 ${up ? 'text-primary' : 'text-destructive'}`}>
            <Icon className="h-4 w-4" />
            {fmtMoney(acct.day_pnl)}
            <span className="text-xs font-normal">({(acct.day_pnl_pct * 100).toFixed(2)}%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
