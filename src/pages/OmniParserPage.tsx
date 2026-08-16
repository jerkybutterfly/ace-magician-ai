import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { omniInstall, omniStatus, omniParse, elementsToPrompt, type OmniResult, type OmniVersion } from '@/lib/omniparser';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function OmniParserPage() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<OmniResult | null>(null);
  const [version, setVersion] = useState<OmniVersion>('v2');
  const [caption, setCaption] = useState(true);

  const wrap = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); }
    catch (e) { toast.error(`${label}: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">OmniParser {version === 'v2' && <Badge className="ml-2">v2</Badge>}</h1>
        <p className="text-sm text-muted-foreground">Microsoft's screen parser. v2 adds Florence-2 icon captioning and ~60% faster inference vs v1. Turns raw screenshots into labeled UI elements so Computer Use can target them by name instead of pixels.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent className="flex gap-3 flex-wrap items-center">
          <div className="flex gap-1">
            <Button size="sm" variant={version === 'v2' ? 'default' : 'outline'} onClick={() => setVersion('v2')}>v2</Button>
            <Button size="sm" variant={version === 'v1' ? 'default' : 'outline'} onClick={() => setVersion('v1')}>v1</Button>
          </div>
          <Button disabled={busy} onClick={() => wrap('Install', async () => {
            const r = await omniInstall(version);
            toast.success(`Installed OmniParser ${version}`);
            console.log(r.log);
          })}>Install / upgrade {version}</Button>
          <Button disabled={busy} variant="outline" onClick={() => wrap('Status', async () => {
            const s = await omniStatus();
            setStatus(s.available
              ? `Ready — ${s.version || version} · ${s.device || 'cpu'}${s.caption_model ? ' · captions' : ''}`
              : `Not ready: ${s.error || 'unknown'}`);
          })}>Check status</Button>
          {status && <Badge variant="outline" className="self-center">{status}</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Parse current screen</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {version === 'v2' && (
            <div className="flex items-center gap-2">
              <Switch id="cap" checked={caption} onCheckedChange={setCaption} />
              <Label htmlFor="cap" className="text-sm">Caption icons (Florence-2)</Label>
            </div>
          )}
          <Button disabled={busy} onClick={() => wrap('Parse', async () => {
            setResult(await omniParse(undefined, { version, caption_icons: caption }));
            toast.success('Parsed');
          })}>Take + parse screenshot</Button>
          {result && (
            <>
              <div className="text-xs text-muted-foreground">{result.elements.length} elements · {result.width}×{result.height}px · {result.latency_ms}ms · {result.version}</div>
              {result.annotated_image && (
                <img src={`data:image/png;base64,${result.annotated_image}`} alt="annotated" className="border rounded max-h-96" />
              )}
              <pre className="text-xs bg-muted p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">{elementsToPrompt(result)}</pre>
              <SendToChatButton text={`Screen elements:\n${elementsToPrompt(result)}\n\nWhat should I click next?`} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
