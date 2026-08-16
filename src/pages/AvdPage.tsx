import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, RefreshCw, Plus, Package, Camera, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import {
  androidCheckSdk, listAvds, createAvd, startAvd, stopAvd,
  installApk, snapshotSave, snapshotLoad,
} from '@/lib/mobile-lab';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function AvdPage() {
  const [busy, setBusy] = useState(false);
  const [sdkInfo, setSdkInfo] = useState('');
  const [avds, setAvds] = useState<string[]>([]);
  const [newName, setNewName] = useState('lab_pixel_34');
  const [image, setImage] = useState('system-images;android-34;google_apis;x86_64');
  const [runName, setRunName] = useState('');
  const [apkPath, setApkPath] = useState('/root/samples/example.apk');
  const [serial, setSerial] = useState('emulator-5554');
  const [snapName, setSnapName] = useState('clean');
  const [out, setOut] = useState('');

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  const refresh = () => wrap(async () => {
    const s = await androidCheckSdk(); setSdkInfo(s.stdout + s.stderr);
    const r = await listAvds();
    setAvds(r.stdout.split('\n').map(l => l.trim()).filter(l => l && !l.includes('=')));
  });

  useEffect(() => { refresh(); }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Android Emulator — AVD lab</h1>
        <Badge variant="outline" className="text-[10px]">Requires Android SDK (sdkmanager / emulator on PATH)</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">SDK & devices</CardTitle>
          <Button size="sm" variant="ghost" disabled={busy} onClick={refresh}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {sdkInfo && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-40 overflow-auto whitespace-pre-wrap font-mono">{sdkInfo}</pre>}
          <div className="flex flex-wrap gap-2">
            {avds.length === 0 && <span className="text-xs text-muted-foreground">No AVDs found.</span>}
            {avds.map(name => (
              <Button key={name} size="sm" variant={runName === name ? 'default' : 'outline'} onClick={() => { setRunName(name); }}>{name}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Create AVD</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="AVD name" value={newName} onChange={e => setNewName(e.target.value)} />
            <Input placeholder="system-images;android-34;google_apis;x86_64" value={image} onChange={e => setImage(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button disabled={busy || !newName} onClick={() => wrap(async () => { const r = await createAvd(newName, image); setOut(r.stdout + r.stderr); toast.success('AVD created'); await refresh(); })}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-3 w-3 mr-1" />Create</>}
            </Button>
            <SendToChatButton text={`[RUN_CMD:yes | sdkmanager --install "${image}" && echo no | avdmanager create avd -n ${newName} -k "${image}" -d pixel_6 --force]`} label="Send to chat" variant="ghost" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Run</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="AVD name to run" value={runName} onChange={e => setRunName(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || !runName} onClick={() => wrap(async () => { const r = await startAvd(runName); setOut(r.stdout + r.stderr); toast.success('Emulator starting'); })}>
              <Play className="h-3 w-3 mr-1" />Start
            </Button>
            <Button variant="outline" disabled={busy || !runName} onClick={() => wrap(async () => { await stopAvd(runName); toast.success('Stopped'); })}>
              <Square className="h-3 w-3 mr-1" />Stop
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="APK path on PC" value={apkPath} onChange={e => setApkPath(e.target.value)} />
            <Input placeholder="adb serial (emulator-5554)" value={serial} onChange={e => setSerial(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy || !apkPath} onClick={() => wrap(async () => { const r = await installApk(apkPath, serial); setOut(r.stdout + r.stderr); toast.success('APK installed'); })}>
              <Package className="h-3 w-3 mr-1" />Install APK
            </Button>
            <Input className="max-w-[180px]" placeholder="snapshot name" value={snapName} onChange={e => setSnapName(e.target.value)} />
            <Button variant="outline" disabled={busy || !serial} onClick={() => wrap(async () => { const r = await snapshotSave(serial, snapName); setOut(r.stdout + r.stderr); toast.success('Snapshot saved'); })}>
              <Camera className="h-3 w-3 mr-1" />Save
            </Button>
            <Button variant="ghost" disabled={busy || !serial} onClick={() => wrap(async () => { const r = await snapshotLoad(serial, snapName); setOut(r.stdout + r.stderr); toast.success('Snapshot loaded'); })}>
              Load
            </Button>
          </div>
          {out && <pre className="text-[11px] bg-muted/30 rounded p-3 max-h-72 overflow-auto whitespace-pre-wrap font-mono">{out}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
