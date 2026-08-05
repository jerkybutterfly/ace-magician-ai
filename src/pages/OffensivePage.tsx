import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Bug, Download, RefreshCw, Skull } from 'lucide-react';
import { toast } from 'sonner';
import {
  installNuclei, updateNucleiTemplates, nucleiScan,
  installReconftw, reconftwRun, reconftwReadReport,
  runNikto, runWhatweb, runFfuf, runSubfinder, runNaabu, runHttpx,
  type NucleiFinding,
} from '@/lib/offensive';
import { SendToChatButton } from '@/components/SendToChatButton';

const sevColor = (s: string) => ({
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  info: 'bg-muted text-muted-foreground border-border',
}[s.toLowerCase()] || 'bg-muted text-muted-foreground');

export default function OffensivePage() {
  const [busy, setBusy] = useState(false);
  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  // Nuclei
  const [nTarget, setNTarget] = useState('https://example.com');
  const [nSeverity, setNSeverity] = useState('medium,high,critical');
  const [nTags, setNTags] = useState('');
  const [nFindings, setNFindings] = useState<NucleiFinding[]>([]);
  const [nRaw, setNRaw] = useState('');

  // ReconFTW
  const [rDomain, setRDomain] = useState('example.com');
  const [rMode, setRMode] = useState<'passive' | 'subdomains' | 'full'>('passive');
  const [rReport, setRReport] = useState('');

  // Toolkit
  const [tk, setTk] = useState('https://example.com');
  const [tkOut, setTkOut] = useState('');

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Skull className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Offensive Toolkit</h1>
        <Badge variant="outline" className="text-[10px]">Scan only what you own · I-Own-This</Badge>
      </div>

      <Tabs defaultValue="nuclei">
        <TabsList>
          <TabsTrigger value="nuclei"><Bug className="h-3 w-3 mr-1" />Nuclei</TabsTrigger>
          <TabsTrigger value="reconftw">ReconFTW</TabsTrigger>
          <TabsTrigger value="toolkit">Toolkit</TabsTrigger>
        </TabsList>

        {/* Nuclei */}
        <TabsContent value="nuclei" className="space-y-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Nuclei — CVE / exposure scanner</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => wrap(async () => { const r = await installNuclei(); toast.success('Nuclei installed'); setNRaw(r.stdout + r.stderr); })}>
                  <Download className="h-3 w-3 mr-1" />Install
                </Button>
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => wrap(async () => { await updateNucleiTemplates(); toast.success('Templates updated'); })}>
                  <RefreshCw className="h-3 w-3 mr-1" />Update templates
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="target URL or host" value={nTarget} onChange={e => setNTarget(e.target.value)} />
                <Input placeholder="severity (info,low,medium,high,critical)" value={nSeverity} onChange={e => setNSeverity(e.target.value)} />
                <Input placeholder="tags (optional, e.g. cve,exposure)" value={nTags} onChange={e => setNTags(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button disabled={busy || !nTarget}
                  onClick={() => wrap(async () => {
                    setNFindings([]);
                    const { raw, findings } = await nucleiScan({ target: nTarget, severity: nSeverity, tags: nTags || undefined });
                    setNRaw(raw); setNFindings(findings);
                    toast.success(`${findings.length} finding(s)`);
                  })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:nuclei -u ${nTarget} -severity ${nSeverity} -silent]`} label="Send to chat" variant="ghost" />
              </div>

              {nFindings.length > 0 && (
                <ScrollArea className="h-80 rounded border">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr><th className="text-left p-2">Severity</th><th className="text-left p-2">Template</th><th className="text-left p-2">Name</th><th className="text-left p-2">Matched</th></tr>
                    </thead>
                    <tbody>
                      {nFindings.map((f, i) => (
                        <tr key={i} className="border-t border-border/40">
                          <td className="p-2"><Badge variant="outline" className={sevColor(f.info.severity)}>{f.info.severity}</Badge></td>
                          <td className="p-2 text-primary">{f.templateID}</td>
                          <td className="p-2">{f.info.name}</td>
                          <td className="p-2 text-muted-foreground truncate max-w-sm">{f.matched}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
              {nRaw && !nFindings.length && (
                <pre className="text-xs bg-muted/30 rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap">{nRaw}</pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ReconFTW */}
        <TabsContent value="reconftw" className="space-y-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">ReconFTW — full recon pipeline</CardTitle>
              <Button size="sm" variant="outline" disabled={busy}
                onClick={() => wrap(async () => { await installReconftw(); toast.success('Cloned to /opt/reconftw. Run install.sh once to fetch tools.'); })}>
                <Download className="h-3 w-3 mr-1" />Clone repo
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Input className="max-w-xs" placeholder="domain (e.g. example.com)" value={rDomain} onChange={e => setRDomain(e.target.value)} />
                <Select value={rMode} onValueChange={(v) => setRMode(v as typeof rMode)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passive">Passive (-p)</SelectItem>
                    <SelectItem value="subdomains">Subdomains (-s)</SelectItem>
                    <SelectItem value="full">Full (-a)</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={busy || !rDomain}
                  onClick={() => wrap(async () => {
                    toast.info(`Starting ReconFTW ${rMode} scan (may take a while)`);
                    const r = await reconftwRun(rDomain, rMode);
                    setRReport(r.stdout + '\n' + r.stderr);
                    try { setRReport(await reconftwReadReport(rDomain)); } catch { /* no report yet */ }
                  })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:cd /opt/reconftw && ./reconftw.sh -d ${rDomain} -p]`} label="Send to chat" variant="ghost" />
              </div>
              <pre className="text-xs bg-muted/30 rounded p-3 max-h-96 overflow-auto whitespace-pre-wrap">{rReport || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Toolkit */}
        <TabsContent value="toolkit" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Individual tools</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input value={tk} onChange={e => setTk(e.target.value)} placeholder="target URL or domain" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await runNikto(tk); setTkOut(r.stdout + r.stderr); })}>nikto</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await runWhatweb(tk); setTkOut(r.stdout + r.stderr); })}>whatweb</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await runFfuf(tk); setTkOut(r.stdout + r.stderr); })}>ffuf dir</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await runSubfinder(tk); setTkOut(r.stdout + r.stderr); })}>subfinder</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await runNaabu(tk); setTkOut(r.stdout + r.stderr); })}>naabu</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await runHttpx(tk); setTkOut(r.stdout + r.stderr); })}>httpx</Button>
              </div>
              <pre className="text-xs bg-muted/30 rounded p-3 max-h-96 overflow-auto whitespace-pre-wrap font-mono">{tkOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
