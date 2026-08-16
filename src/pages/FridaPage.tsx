import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Play, Square, RefreshCw, Bug } from 'lucide-react';
import { toast } from 'sonner';
import {
  installFrida, fridaListDevices, fridaListProcesses, fridaListApps,
  fridaSpawn, fridaTailLog, fridaKill,
} from '@/lib/mobile-lab';
import { SendToChatButton } from '@/components/SendToChatButton';

const DEFAULT_SCRIPT = `// Frida hook — logs every Java Activity onResume
Java.perform(function () {
  var Activity = Java.use('android.app.Activity');
  Activity.onResume.implementation = function () {
    console.log('[+] onResume ' + this.getClass().getName());
    return this.onResume();
  };
});`;

export default function FridaPage() {
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState('usb');
  const [pkg, setPkg] = useState('com.example.app');
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [devicesOut, setDevicesOut] = useState('');
  const [procs, setProcs] = useState('');
  const [session, setSession] = useState<{ logPath: string; pidPath: string } | null>(null);
  const [log, setLog] = useState('');

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (!session) return;
    const t = setInterval(async () => {
      try { const r = await fridaTailLog(session.logPath); setLog(r.stdout); } catch { /* ignore */ }
    }, 1500);
    return () => clearInterval(t);
  }, [session]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Bug className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Frida — Dynamic instrumentation</h1>
        <Badge variant="outline" className="text-[10px]">Attach only to apps you own</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Devices & processes</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await installFrida(); toast.success('Frida installed'); setDevicesOut(r.stdout); })}>
              <Download className="h-3 w-3 mr-1" />Install
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await fridaListDevices(); setDevicesOut(r.stdout); })}>
              <RefreshCw className="h-3 w-3 mr-1" />Devices
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" placeholder="device id (usb / emulator-5554)" value={device} onChange={e => setDevice(e.target.value)} />
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await fridaListProcesses(device); setProcs(r.stdout); })}>List processes</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await fridaListApps(device); setProcs(r.stdout); })}>List apps</Button>
          </div>
          {devicesOut && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-40 overflow-auto whitespace-pre-wrap font-mono">{devicesOut}</pre>}
          {procs && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-56 overflow-auto whitespace-pre-wrap font-mono">{procs}</pre>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Hook script</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Target package (com.example.app)" value={pkg} onChange={e => setPkg(e.target.value)} />
          <Textarea value={script} onChange={e => setScript(e.target.value)} className="min-h-[220px] font-mono text-xs" />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !!session || !pkg}
              onClick={() => wrap(async () => { const s = await fridaSpawn(pkg, script, device); setSession({ logPath: s.logPath, pidPath: s.pidPath }); toast.success('Spawned'); })}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-3 w-3 mr-1" />Spawn & hook</>}
            </Button>
            <Button variant="outline" disabled={busy || !session}
              onClick={() => wrap(async () => { if (session) { await fridaKill(session.pidPath); setSession(null); toast.success('Killed'); } })}>
              <Square className="h-3 w-3 mr-1" />Detach
            </Button>
            <SendToChatButton text={`[RUN_CMD:frida -D ${device} -f ${pkg} -l /path/to/hook.js --no-pause]`} label="Send to chat" variant="ghost" />
          </div>
          {log && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-72 overflow-auto whitespace-pre-wrap font-mono">{log}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
