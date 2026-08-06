import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { omniInstall, omniStatus, omniParse, elementsToPrompt, type OmniResult } from '@/lib/omniparser';
import { SendToChatButton } from '@/components/SendToChatButton';

export default function OmniParserPage() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<OmniResult | null>(null);

  const wrap = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); }
    catch (e) { toast.error(`${label}: ${(e as Error).message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">OmniParser — UI vision</h1>
        <p className="text-sm text-muted-foreground">Microsoft's screen parser. Turns raw screenshots into labeled UI elements so Computer Use can target them by name instead of pixels.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Setup</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button disabled={busy} onClick={() => wrap('Install', omniInstall)}>Install</Button>
          <Button disabled={busy} variant="outline" onClick={() => wrap('Status', async () => {
            const s = await omniStatus();
            setStatus(s.available ? `Ready — ${s.model || 'default'}` : `Not ready: ${s.error || 'unknown'}`);
          })}>Check status</Button>
          {status && <Badge variant="outline" className="self-center">{status}</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Parse current screen</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button disabled={busy} onClick={() => wrap('Parse', async () => { setResult(await omniParse()); toast.success('Parsed'); })}>Take + parse screenshot</Button>
          {result && (
            <>
              <div className="text-xs text-muted-foreground">{result.elements.length} elements · {result.width}×{result.height}px · {result.latency_ms}ms</div>
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
