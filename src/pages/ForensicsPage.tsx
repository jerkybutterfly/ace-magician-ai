import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SendToChatButton } from '@/components/SendToChatButton';
import { Microscope, Loader2 } from 'lucide-react';
import { hashFile, stringsFile, hexdump, exif, pwnedCheck } from '@/lib/kali';
import { getWifiNetworks } from '@/lib/agent';
import { toast } from 'sonner';

export default function ForensicsPage() {
  const [busy, setBusy] = useState(false);
  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  };

  const [hashPath, setHashPath] = useState('');
  const [hashRes, setHashRes] = useState<{ md5: string; sha1: string; sha256: string; size: number } | null>(null);

  const [strPath, setStrPath] = useState('');
  const [strRes, setStrRes] = useState<string[]>([]);

  const [hexPath, setHexPath] = useState('');
  const [hexOff, setHexOff] = useState('0');
  const [hexLen, setHexLen] = useState('512');
  const [hexOut, setHexOut] = useState('');

  const [exifPath, setExifPath] = useState('');
  const [exifOut, setExifOut] = useState<Record<string, string> | null>(null);

  const [pw, setPw] = useState('');
  const [pwOut, setPwOut] = useState<{ breached: boolean; count: number; strength: number } | null>(null);

  const [wifiOut, setWifiOut] = useState('');

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Microscope className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Forensics & Recon</h1>
      </div>

      <Tabs defaultValue="hash">
        <TabsList>
          <TabsTrigger value="hash">Hash</TabsTrigger>
          <TabsTrigger value="strings">Strings</TabsTrigger>
          <TabsTrigger value="hex">Hexdump</TabsTrigger>
          <TabsTrigger value="exif">EXIF</TabsTrigger>
          <TabsTrigger value="pwned">Password</TabsTrigger>
          <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
        </TabsList>

        <TabsContent value="hash">
          <Card><CardHeader><CardTitle className="text-base">File Hash (MD5 / SHA1 / SHA256)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="C:\path\to\file" value={hashPath} onChange={(e) => setHashPath(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { setHashRes(await hashFile(hashPath)); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hash'}
                </Button>
              </div>
              {hashRes && (
                <div className="text-xs font-mono space-y-1 bg-muted/30 rounded p-3">
                  <div><span className="text-muted-foreground">size:</span> {hashRes.size.toLocaleString()} bytes</div>
                  <div><span className="text-muted-foreground">md5:</span> {hashRes.md5}</div>
                  <div><span className="text-muted-foreground">sha1:</span> {hashRes.sha1}</div>
                  <div><span className="text-muted-foreground">sha256:</span> {hashRes.sha256}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strings">
          <Card><CardHeader><CardTitle className="text-base">Extract printable strings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input placeholder="path to binary" value={strPath} onChange={(e) => setStrPath(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await stringsFile(strPath); setStrRes(r.strings); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extract'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:strings ${strPath}]`} autorun={!!strPath.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              <ScrollArea className="h-80 rounded border bg-muted/20 p-2">
                <pre className="text-[11px] font-mono">{strRes.join('\n') || '—'}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hex">
          <Card><CardHeader><CardTitle className="text-base">Hexdump</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                <Input className="max-w-md" placeholder="path" value={hexPath} onChange={(e) => setHexPath(e.target.value)} />
                <Input className="max-w-[120px]" placeholder="offset" value={hexOff} onChange={(e) => setHexOff(e.target.value)} />
                <Input className="max-w-[120px]" placeholder="length" value={hexLen} onChange={(e) => setHexLen(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await hexdump(hexPath, +hexOff, +hexLen); setHexOut(r.dump); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Dump'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:xxd -s ${hexOff} -l ${hexLen} ${hexPath}]`} autorun={!!hexPath.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              <pre className="text-[11px] font-mono bg-muted/30 rounded p-3 max-h-96 overflow-auto whitespace-pre">{hexOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exif">
          <Card><CardHeader><CardTitle className="text-base">EXIF metadata</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input placeholder="path to image" value={exifPath} onChange={(e) => setExifPath(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await exif(exifPath); setExifOut(r.exif); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Read'}
                </Button>
                <SendToChatButton text={`[RUN_CMD:exiftool ${exifPath}]`} autorun={!!exifPath.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              {exifOut && (
                <ScrollArea className="h-80 rounded border">
                  <table className="w-full text-xs font-mono">
                    <tbody>
                      {Object.entries(exifOut).map(([k, v]) => (
                        <tr key={k} className="border-t border-border/40">
                          <td className="p-2 text-muted-foreground w-1/3">{k}</td>
                          <td className="p-2 truncate">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pwned">
          <Card><CardHeader><CardTitle className="text-base">Password breach check (k-anonymity)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">Only the first 5 chars of the SHA-1 hash leave your machine.</div>
              <div className="flex gap-2 items-center">
                <Input type="password" placeholder="password" value={pw} onChange={(e) => setPw(e.target.value)} />
                <Button disabled={busy} onClick={() => wrap(async () => { setPwOut(await pwnedCheck(pw)); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                </Button>
                <SendToChatButton text={`Check if password has been breached`} autorun={!!pw.trim()} variant="ghost" label="" title="Run in chat" />
              </div>
              {pwOut && (
                <div className="space-y-1 text-sm">
                  {pwOut.breached
                    ? <Badge variant="destructive">Found in {pwOut.count.toLocaleString()} known breaches</Badge>
                    : <Badge className="bg-primary/20 text-primary border-primary/40">Not found in known breaches</Badge>}
                  <div className="text-xs text-muted-foreground">Strength score: {pwOut.strength}/100</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wifi">
          <Card><CardHeader><CardTitle className="text-base">Nearby Wi-Fi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center">
                <Button disabled={busy} onClick={() => wrap(async () => { const r = await getWifiNetworks(); setWifiOut(r.output); })}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan'}
                </Button>
                <SendToChatButton text={`[WIFI_SCAN]`} autorun variant="ghost" label="" title="Run in chat" />
              </div>
              <pre className="text-xs font-mono bg-muted/30 rounded p-3 max-h-96 overflow-auto whitespace-pre-wrap">{wifiOut || '—'}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
