import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Cpu, Smartphone, Copy, RefreshCw, ChevronDown, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { getSettings, saveSettings, isNativePlatform } from '@/lib/settings';
import { isPhone } from '@/lib/phone';
import { toast } from 'sonner';

const ON_DEVICE_URL = 'http://127.0.0.1:11434';

const RECOMMENDED = [
  { name: 'qwen2.5:0.5b', size: '~400 MB', note: 'Tiniest, fastest, OK for short replies' },
  { name: 'qwen2.5:1.5b', size: '~1.0 GB', note: 'Best balance for phones' },
  { name: 'llama3.2:1b', size: '~1.3 GB', note: 'Meta tiny, solid quality' },
  { name: 'llama3.2:3b', size: '~2.0 GB', note: 'Higher quality, needs 6GB+ RAM free' },
  { name: 'phi3.5:3.8b-mini-instruct-q4_K_M', size: '~2.2 GB', note: 'Good reasoning, tight quant' },
  { name: 'qwen2.5:3b', size: '~1.9 GB', note: 'Strong all-round small model' },
];

const TERMUX_STEPS: { label: string; cmd: string }[] = [
  { label: '1. Update packages', cmd: 'pkg update && pkg upgrade -y' },
  { label: '2. Install Ollama', cmd: 'pkg install -y ollama' },
  { label: '3. Start the server (keep tab open)', cmd: 'ollama serve' },
  { label: '4. In a new Termux session, pull a small model', cmd: 'ollama pull qwen2.5:1.5b' },
  { label: '5. Test it', cmd: 'ollama run qwen2.5:1.5b "Hello"' },
];

interface ReachState {
  checking: boolean;
  ok: boolean | null;
  models: string[];
  error?: string;
}

export default function OnDeviceModelPage() {
  const [reach, setReach] = useState<ReachState>({ checking: false, ok: null, models: [] });
  const [currentUrl, setCurrentUrl] = useState(getSettings().ollamaUrl);
  const onPhone = isPhone() || isNativePlatform();

  const ping = async () => {
    setReach((s) => ({ ...s, checking: true }));
    try {
      const r = await fetch(`${ON_DEVICE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const models = Array.isArray(j.models) ? j.models.map((m: { name: string }) => m.name) : [];
      setReach({ checking: false, ok: true, models });
    } catch (e) {
      setReach({ checking: false, ok: false, models: [], error: e instanceof Error ? e.message : String(e) });
    }
  };

  useEffect(() => { void ping(); }, []);

  const switchTo = (url: string, label: string) => {
    const s = getSettings();
    saveSettings({ ...s, ollamaUrl: url });
    setCurrentUrl(url);
    toast.success(`Ollama URL → ${label}`);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const usingOnDevice = currentUrl.includes('127.0.0.1') || currentUrl.includes('localhost');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Cpu className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">On-Device Model</h1>
          <p className="text-sm text-muted-foreground">Run Ollama directly on your Android phone via Termux.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            On-device Ollama status
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={ping} disabled={reach.checking}>
            <RefreshCw className={`h-4 w-4 ${reach.checking ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {reach.ok === null && <span className="text-muted-foreground">Checking…</span>}
            {reach.ok === true && (
              <>
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Reachable at <code className="text-xs">{ON_DEVICE_URL}</code></span>
              </>
            )}
            {reach.ok === false && (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">Not reachable — install + start Ollama in Termux below.</span>
              </>
            )}
          </div>
          {reach.ok && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Installed models ({reach.models.length}):</div>
              {reach.models.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">None yet — pull one from the list below.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {reach.models.map((m) => <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>)}
                </div>
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground border-t border-border/40 pt-2">
            Current Ollama URL: <code>{currentUrl}</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick switch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={usingOnDevice ? 'default' : 'outline'}
            onClick={() => switchTo(ON_DEVICE_URL, 'on-phone')}
          >
            Use on-phone model
          </Button>
          <Button
            size="sm"
            variant={!usingOnDevice ? 'default' : 'outline'}
            onClick={() => {
              const ip = window.prompt("PC LAN IP (e.g. 192.168.1.50)", currentUrl.replace(/^https?:\/\//, '').replace(/:\d+.*$/, ''));
              if (ip) switchTo(`http://${ip}:11434`, `PC at ${ip}`);
            }}
          >
            Use PC over LAN
          </Button>
          <Button size="sm" variant="ghost" onClick={ping} disabled={reach.checking}>
            Test connection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Install on your phone (Termux)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertTitle className="text-sm">Use Termux from F-Droid, not Play Store</AlertTitle>
            <AlertDescription className="text-xs">
              The Play Store version is outdated and the Ollama package won't install cleanly.
              Get it from <code>f-droid.org</code>. After install, disable battery optimization for Termux so the server keeps running.
            </AlertDescription>
          </Alert>
          <ol className="space-y-2">
            {TERMUX_STEPS.map((s) => (
              <li key={s.label} className="space-y-1">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted/50 rounded px-2 py-1.5 break-all">{s.cmd}</code>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(s.cmd)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Phone-friendly models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {RECOMMENDED.map((m) => (
              <div key={m.name} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card/40">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-mono truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.size} · {m.note}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => copy(`ollama pull ${m.name}`)}>
                  <Copy className="h-3 w-3 mr-1" /> pull
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> What won't work on-device</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Alert>
            <AlertDescription className="text-xs space-y-1">
              <p>• The Python <code>agent.py</code> (PC control, terminal, browser automation) needs a desktop OS.</p>
              <p>• Computer Use / <code>pyautogui</code> won't run on Android.</p>
              <p>• Phone-side actions (battery, GPS, notify, vibrate, etc.) still work — they go through the Capacitor phone runner.</p>
              <p>• Heavy 7B+ models will OOM or run at &lt;1 tok/s. Stick to 0.5B–3B quantized.</p>
              {!onPhone && <p className="text-muted-foreground pt-1">You're not on the Android build — these settings only matter once the Capacitor app is running on your phone.</p>}
            </AlertDescription>
          </Alert>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
