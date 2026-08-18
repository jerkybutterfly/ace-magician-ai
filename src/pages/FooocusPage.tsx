import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConversations } from '@/hooks/useConversations';
import { useToast } from '@/hooks/use-toast';
import {
  fooocusPing, getFooocusUrl, setFooocusUrl,
  installFooocus, startFooocus, stopFooocus, generate,
  type FooocusImage,
} from '@/lib/fooocus';
import { Image as ImageIcon, Download, Play, Square, Loader2, Wand2 } from 'lucide-react';

export default function FooocusPage() {
  const { conversations, currentConvoId, createNew, deleteConversation, setCurrentConvoId } = useConversations();
  const { toast } = useToast();

  const [url, setUrl] = useState(getFooocusUrl());
  const [online, setOnline] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('a serene alpine lake at dawn, cinematic, ultra detailed');
  const [negative, setNegative] = useState('low quality, blurry, deformed');
  const [aspect, setAspect] = useState('1152*896');
  const [perf, setPerf] = useState<'Speed' | 'Quality' | 'Extreme Speed' | 'Lightning'>('Speed');
  const [busy, setBusy] = useState<'install' | 'start' | 'stop' | 'gen' | null>(null);
  const [images, setImages] = useState<FooocusImage[]>([]);

  const ping = async () => setOnline(await fooocusPing());

  useEffect(() => { ping(); const t = setInterval(ping, 8000); return () => clearInterval(t); }, []);

  const saveUrl = () => { setFooocusUrl(url); ping(); toast({ title: 'Fooocus URL saved' }); };

  const wrap = async (kind: typeof busy, fn: () => Promise<unknown>, ok: string) => {
    setBusy(kind);
    try { await fn(); toast({ title: ok }); ping(); }
    catch (e) { toast({ title: 'Failed', description: String(e), variant: 'destructive' }); }
    finally { setBusy(null); }
  };

  const runGenerate = async () => {
    setBusy('gen');
    try {
      const out = await generate({ prompt, negative, aspect, performance: perf });
      setImages(out);
      toast({ title: `Generated ${out.length} image${out.length === 1 ? '' : 's'}` });
    } catch (e) {
      toast({ title: 'Generate failed', description: String(e), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={createNew}
        onSelectConvo={setCurrentConvoId}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="flex items-center gap-3 border-b border-border/50 px-4 h-14">
          <SidebarTrigger />
          <ImageIcon className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Fooocus · Local SDXL</h1>
          <Badge variant={online ? 'default' : 'secondary'} className="ml-2">
            {online === null ? 'checking…' : online ? 'online' : 'offline'}
          </Badge>
        </header>

        <div className="p-4 space-y-4 overflow-auto">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Host</span>
            </div>
            <div className="flex gap-2">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:7865" />
              <Button size="sm" variant="outline" onClick={saveUrl}>Save</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => wrap('install', installFooocus, 'Install triggered')}>
                {busy === 'install' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                Install on host
              </Button>
              <Button size="sm" disabled={busy !== null}
                onClick={() => wrap('start', startFooocus, 'Fooocus starting')}>
                {busy === 'start' ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                Start
              </Button>
              <Button size="sm" variant="outline" disabled={busy !== null}
                onClick={() => wrap('stop', stopFooocus, 'Fooocus stopped')}>
                <Square className="h-3 w-3 mr-1" /> Stop
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Uses <code>public/fooocus_install.sh</code> and <code>fooocus_start.sh</code>. On the AM06 Pro (no discrete GPU),
              the start script defaults to <code>--always-cpu</code> — expect a few minutes per image. For GPU, export
              <code> FOOOCUS_ARGS=""</code> before running.
            </p>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-sm font-medium">Prompt</div>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
            <div className="text-sm font-medium">Negative prompt</div>
            <Textarea value={negative} onChange={(e) => setNegative(e.target.value)} rows={2} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Aspect</div>
                <Select value={aspect} onValueChange={setAspect}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1152*896">Landscape 1152×896</SelectItem>
                    <SelectItem value="896*1152">Portrait 896×1152</SelectItem>
                    <SelectItem value="1024*1024">Square 1024×1024</SelectItem>
                    <SelectItem value="1344*768">Wide 1344×768</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Performance</div>
                <Select value={perf} onValueChange={(v) => setPerf(v as typeof perf)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lightning">Lightning (fastest)</SelectItem>
                    <SelectItem value="Extreme Speed">Extreme Speed</SelectItem>
                    <SelectItem value="Speed">Speed</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={runGenerate} disabled={busy !== null || !online} className="w-full">
              {busy === 'gen' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </Card>

          {images.length > 0 && (
            <Card className="p-4">
              <div className="text-sm font-medium mb-3">Output</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noreferrer" className="block">
                    <img src={img.url} alt={`Fooocus output ${i + 1}`} className="rounded-md w-full" />
                    {img.seed !== undefined && (
                      <div className="text-[10px] text-muted-foreground mt-1">seed {img.seed}</div>
                    )}
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>
      </SidebarInset>
    </div>
  );
}
