import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { installOpenBB, openbbQuote, openbbNews, openbbFundamentals, openbbHistorical } from '@/lib/openbb';

export default function OpenBBPage() {
  const [busy, setBusy] = useState(false);
  const [sym, setSym] = useState('AAPL');
  const [out, setOut] = useState('');

  const wrap = async (label: string, fn: () => Promise<any>) => {
    setBusy(true);
    try {
      const r = await fn();
      setOut((r.stdout || '') + (r.stderr ? `\n---stderr---\n${r.stderr}` : ''));
      toast.success(`${label} done`);
    } catch (e: any) { toast.error(`${label} failed: ${e.message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">OpenBB</h1>
        <p className="text-sm text-muted-foreground">Research-grade financial data platform (equity, news, fundamentals, historicals).</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent><Button disabled={busy} onClick={() => wrap('Install', installOpenBB)}>Install / update on host</Button></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Query</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={sym} onChange={(e) => setSym(e.target.value.toUpperCase())} placeholder="Ticker (e.g. AAPL)" />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !sym} onClick={() => wrap('Quote', () => openbbQuote(sym))}>Quote</Button>
            <Button disabled={busy || !sym} onClick={() => wrap('News', () => openbbNews(sym))}>News</Button>
            <Button disabled={busy || !sym} onClick={() => wrap('Fundamentals', () => openbbFundamentals(sym))}>Fundamentals</Button>
            <Button disabled={busy || !sym} onClick={() => wrap('Historical', () => openbbHistorical(sym))}>Historical</Button>
          </div>
          {out && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap max-h-[500px] overflow-auto">{out}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
