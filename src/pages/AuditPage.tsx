import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { runAudit, type AuditResult } from '@/lib/kali';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditPage() {
  const [data, setData] = useState<AuditResult | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try { setData(await runAudit()); }
    catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  useEffect(() => { run(); }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Security Audit</h1>
        <Button size="sm" variant="outline" className="ml-auto" onClick={run} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Re-scan'}
        </Button>
      </div>

      {!data ? (
        <div className="text-sm text-muted-foreground">Running local hardening checks…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Findings</CardTitle></CardHeader>
              <CardContent>
                {data.findings.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" /> No issues detected by quick scan
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.findings.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${f.level === 'error' ? 'text-destructive' : f.level === 'warn' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="font-medium">{f.title}</div>
                          <div className="text-xs text-muted-foreground whitespace-pre-wrap">{f.detail}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">System</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">Host:</span> {data.hostname} ({data.system})</div>
                <div><span className="text-muted-foreground">Failed logins:</span> {data.failed_logins}</div>
                <div><span className="text-muted-foreground">Users:</span> {data.users.join(', ') || '—'}</div>
                <div className="pt-2 text-xs text-muted-foreground">Firewall</div>
                <pre className="text-xs font-mono bg-muted/30 rounded p-2 whitespace-pre-wrap max-h-32 overflow-auto">{data.firewall}</pre>
                <div className="pt-2 text-xs text-muted-foreground">Encryption</div>
                <pre className="text-xs font-mono bg-muted/30 rounded p-2 whitespace-pre-wrap max-h-32 overflow-auto">{data.encryption}</pre>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Listening Ports ({data.listening_ports.length})</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-72 rounded border">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr><th className="text-left p-2">Port</th><th className="text-left p-2">Bind</th><th className="text-left p-2">PID</th><th className="text-left p-2">Risk</th></tr>
                  </thead>
                  <tbody>
                    {data.listening_ports.map((p, i) => {
                      const risky = (p.ip === '0.0.0.0' || p.ip === '::') && [21,23,135,139,445,3389,5900,6379,9200,11211,27017].includes(p.port);
                      return (
                        <tr key={i} className="border-t border-border/40">
                          <td className="p-2 text-primary">{p.port}</td>
                          <td className="p-2">{p.ip}</td>
                          <td className="p-2 text-muted-foreground">{p.pid || '—'}</td>
                          <td className="p-2">{risky ? <Badge variant="destructive" className="text-[10px]">exposed</Badge> : <span className="text-muted-foreground">ok</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
