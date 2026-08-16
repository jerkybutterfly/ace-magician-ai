import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Play, Square, RefreshCw, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  installMobsf, startMobsf, stopMobsf, mobsfStatus, mobsfLogs,
  mobsfUpload, mobsfScan, mobsfReportUrl, MOBSF_URL, MOBSF_DEFAULT_APIKEY_HINT,
} from '@/lib/mobile-lab';
import { SendToChatButton } from '@/components/SendToChatButton';

const KEY_STORAGE = 'mobsf-api-key';

export default function MobsfPage() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('unknown');
  const [logs, setLogs] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '');
  const [apkPath, setApkPath] = useState('/root/samples/example.apk');
  const [hash, setHash] = useState('');

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  useEffect(() => { localStorage.setItem(KEY_STORAGE, apiKey); }, [apiKey]);
  useEffect(() => { refresh(); }, []);

  const refresh = () => wrap(async () => {
    const s = await mobsfStatus();
    setStatus(s.stdout.trim() || 'stopped');
  });

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">MobSF — Mobile Security Framework</h1>
        <Badge variant="outline" className="text-[10px]">APK / IPA static + dynamic analysis</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Container</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { await installMobsf(); toast.success('MobSF image pulled'); })}>
              <Download className="h-3 w-3 mr-1" />Pull image
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { await startMobsf(); toast.success('MobSF started'); await refresh(); })}>
              <Play className="h-3 w-3 mr-1" />Start
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { await stopMobsf(); toast.success('MobSF stopped'); await refresh(); })}>
              <Square className="h-3 w-3 mr-1" />Stop
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={refresh}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
            <Button size="sm" variant="ghost" asChild><a href={MOBSF_URL} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Open UI</a></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs"><span className="text-muted-foreground">Status:</span> <span className="font-mono">{status}</span></div>
          <Input placeholder="MobSF API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <p className="text-[11px] text-muted-foreground">{MOBSF_DEFAULT_APIKEY_HINT}</p>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await mobsfLogs(); setLogs(r.stdout); })}>Fetch logs</Button>
          {logs && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-56 overflow-auto whitespace-pre-wrap">{logs}</pre>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Scan an APK / IPA</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Absolute path to APK/IPA on the PC" value={apkPath} onChange={e => setApkPath(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !apiKey || !apkPath}
              onClick={() => wrap(async () => {
                const r = await mobsfUpload(apkPath, apiKey);
                if (r?.hash) { setHash(r.hash); toast.success(`Uploaded — hash ${r.hash.slice(0, 12)}…`); }
                else throw new Error(JSON.stringify(r));
              })}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
            </Button>
            <Button disabled={busy || !apiKey || !hash} variant="outline"
              onClick={() => wrap(async () => { await mobsfScan(hash, apiKey); toast.success('Scan complete'); })}>
              Static scan
            </Button>
            {hash && (
              <Button variant="ghost" asChild>
                <a href={mobsfReportUrl(hash)} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />Open report
                </a>
              </Button>
            )}
            <SendToChatButton text={`[RUN_CMD:curl -s -F "file=@${apkPath}" -H "Authorization: ${apiKey || 'YOUR_KEY'}" ${MOBSF_URL}/api/v1/upload]`} label="Send to chat" variant="ghost" />
          </div>
          {hash && <div className="text-xs font-mono text-muted-foreground">hash: {hash}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
