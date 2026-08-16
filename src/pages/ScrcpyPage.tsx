import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Download, Play, Square, RefreshCw, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import {
  installScrcpy, adbDevices, adbConnect, adbDisconnect,
  scrcpyStart, scrcpyStop, scrcpyRunning,
} from '@/lib/mobile-lab';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function ScrcpyPage() {
  const [busy, setBusy] = useState(false);
  const [devicesOut, setDevicesOut] = useState('');
  const [hostPort, setHostPort] = useState('192.168.1.100:5555');
  const [serial, setSerial] = useState('');
  const [bitrate, setBitrate] = useState('8');
  const [maxSize, setMaxSize] = useState('1600');
  const [noAudio, setNoAudio] = useState(false);
  const [record, setRecord] = useState('');
  const [status, setStatus] = useState('');

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">scrcpy — Mirror & control your device</h1>
        <Badge variant="outline" className="text-[10px]">USB or Wi-Fi ADB</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">ADB devices</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { await installScrcpy(); toast.success('scrcpy installed'); })}>
              <Download className="h-3 w-3 mr-1" />Install
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => wrap(async () => { const r = await adbDevices(); setDevicesOut(r.stdout); })}>
              <RefreshCw className="h-3 w-3 mr-1" />Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-xs" placeholder="192.168.x.x:5555" value={hostPort} onChange={e => setHostPort(e.target.value)} />
            <Button size="sm" variant="outline" disabled={busy || !hostPort} onClick={() => wrap(async () => { const r = await adbConnect(hostPort); setDevicesOut(r.stdout + r.stderr); })}>Connect</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => wrap(async () => { const r = await adbDisconnect(hostPort); setDevicesOut(r.stdout + r.stderr); })}>Disconnect</Button>
          </div>
          {devicesOut && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-40 overflow-auto whitespace-pre-wrap font-mono">{devicesOut}</pre>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Launch mirror</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="serial (optional)" value={serial} onChange={e => setSerial(e.target.value)} />
            <Input placeholder="bitrate (Mbps)" value={bitrate} onChange={e => setBitrate(e.target.value)} />
            <Input placeholder="max-size (px)" value={maxSize} onChange={e => setMaxSize(e.target.value)} />
            <Input placeholder="record path (optional .mp4)" value={record} onChange={e => setRecord(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs"><Checkbox checked={noAudio} onCheckedChange={(v) => setNoAudio(!!v)} /> No audio forwarding</label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy}
              onClick={() => wrap(async () => {
                const r = await scrcpyStart({
                  serial: serial || undefined,
                  bitrate: Number(bitrate) || undefined,
                  maxSize: Number(maxSize) || undefined,
                  recordPath: record || undefined,
                  noAudio,
                });
                setStatus(r.stdout + r.stderr);
                toast.success('scrcpy launched on the PC');
              })}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-3 w-3 mr-1" />Start</>}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => wrap(async () => { await scrcpyStop(); toast.success('Stopped'); })}>
              <Square className="h-3 w-3 mr-1" />Stop
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => wrap(async () => { const r = await scrcpyRunning(); setStatus(r.stdout); })}>Status</Button>
            <SendToChatButton text={`[RUN_CMD:scrcpy${serial ? ' -s ' + serial : ''} --video-bit-rate ${bitrate}M --max-size ${maxSize}]`} label="Send to chat" variant="ghost" />
          </div>
          {status && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-48 overflow-auto whitespace-pre-wrap font-mono">{status}</pre>}
          <p className="text-[11px] text-muted-foreground">scrcpy opens a window on the PC (not in the browser). Use RustDesk / your existing screen share to view it remotely.</p>
        </CardContent>
      </Card>
    </div>
  );
}
