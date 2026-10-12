import { useCallback, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SearchCode, RefreshCw, Download, FileCode2, Binary, Globe, Braces } from 'lucide-react';
import { rea } from '@/lib/rea';
import { useNavigate } from 'react-router-dom';

type TargetKind = 'js' | 'go' | 'dotnet' | 'har';

const KINDS: { id: TargetKind; label: string; hint: string; icon: typeof FileCode2 }[] = [
  { id: 'js', label: 'JavaScript / Electron app', hint: 'Path to an extracted app folder or .asar file, e.g. D:\\apps\\example', icon: FileCode2 },
  { id: 'go', label: 'Go binary', hint: 'Path to a Go program file (.exe, ELF or Mach-O)', icon: Binary },
  { id: 'dotnet', label: '.NET assembly', hint: 'Path to a .dll or .exe built with .NET', icon: Braces },
  { id: 'har', label: 'Network capture (HAR)', hint: 'Path to a .har file saved from your browser', icon: Globe },
];

export default function ReaPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [installed, setInstalled] = useState(false);
  const [kind, setKind] = useState<TargetKind>('js');
  const [target, setTarget] = useState('');

  const refresh = useCallback(async () => {
    const r = await rea.checkInstalled().catch(() => ({ stdout: '' }));
    const out = r.stdout || '';
    setInstalled(out.length > 0 && !out.includes('NOT_INSTALLED') && !out.includes('not recognized'));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const run = async (label: string, fn: () => Promise<{ stdout: string; stderr: string }>) => {
    setBusy(label);
    setOutput('');
    try {
      const r = await fn();
      setOutput((r.stdout || '') + (r.stderr ? `\n${r.stderr}` : ''));
      toast.success(`${label} finished`);
      await refresh();
    } catch (e) {
      toast.error(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const analyze = () => {
    const path = target.trim();
    if (!path) { toast.error('Enter a path on the mini PC first'); return; }
    const fn = kind === 'js' ? () => rea.analyzeJs(path)
      : kind === 'go' ? () => rea.inspectGo(path)
      : kind === 'dotnet' ? () => rea.inspectDotnet(path)
      : () => rea.analyzeHar(path);
    run('Analyze', fn);
  };

  const active = KINDS.find((k) => k.id === kind)!;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        conversations={conversations}
        currentConvoId={currentConvoId}
        onNewChat={() => { createConversation(); navigate('/chat'); }}
        onSelectConvo={(id) => { selectConversation(id); navigate('/chat'); }}
        onDeleteConvo={deleteConversation}
      />
      <SidebarInset>
        <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3">
          <SidebarTrigger />
          <SearchCode className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">REA — Reverse Engineer Anything</h1>
          <Badge variant={installed ? 'default' : 'outline'} className="ml-2 text-[10px] font-mono">
            {installed ? 'INSTALLED' : 'NOT INSTALLED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3" /></Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 — Install on your mini PC</div>
            <p className="text-sm text-muted-foreground">
              REA lets your assistant take apart apps and files to explain how they work — JavaScript and Electron
              apps, Go programs, .NET assemblies, websites and saved network captures. Every answer comes with the
              evidence behind it. It runs locally on your mini PC and needs Node.js 22 or newer — no Docker, no
              graphics card.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Check Node.js', rea.checkNode)}>
                Check Node.js
              </Button>
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', rea.install)}>
                <Download className="h-3 w-3 mr-1" /> {busy === 'Install' ? 'Installing…' : 'Install REA'}
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('Update', rea.update)}>
                Update
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy || !installed} onClick={() => run('All commands', rea.help)}>
                All commands
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Native binary analysis (pseudocode, assembly) additionally needs Hopper, Ghidra or IDA installed —
              everything else works without them.
            </p>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step 2 — Analyze a target</div>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <Button
                  key={k.id}
                  size="sm"
                  variant={kind === k.id ? 'default' : 'outline'}
                  onClick={() => setKind(k.id)}
                >
                  <k.icon className="h-3 w-3 mr-1" /> {k.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={active.hint}
                className="font-mono text-xs"
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
              />
              <Button size="sm" disabled={!!busy || !installed} onClick={analyze}>
                {busy === 'Analyze' ? 'Analyzing…' : 'Analyze'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The path is on your mini PC, not this phone. Results appear in the output box below as structured
              findings with evidence — modules, imports, routes, calls and references depending on the target.
            </p>
          </Card>

          {output && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
              <ScrollArea className="h-96">
                <pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre>
              </ScrollArea>
            </Card>
          )}
        </main>
      </SidebarInset>
    </div>
  );
}
