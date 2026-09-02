import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useConversations } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Download, RefreshCw, Trash2, Youtube, ListVideo, Captions } from 'lucide-react';
import { ytdlp, type YtFormat } from '@/lib/ytdlp';
import { useNavigate } from 'react-router-dom';

const FORMATS: { id: YtFormat; label: string }[] = [
  { id: 'best', label: 'Best quality' },
  { id: 'video1080', label: 'MP4 1080p' },
  { id: 'video720', label: 'MP4 720p' },
  { id: 'audio', label: 'MP3 audio' },
];

export default function YtDlpPage() {
  const navigate = useNavigate();
  const { conversations, currentConvoId, createConversation, selectConversation, deleteConversation } = useConversations();
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<YtFormat>('best');
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [version, setVersion] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  const refresh = async () => {
    const [v, l] = await Promise.all([
      ytdlp.version().catch(() => ({ stdout: '' })),
      ytdlp.list().catch(() => ({ stdout: '' })),
    ]);
    setVersion((v.stdout || '').trim().split('\n')[0] || '');
    setFiles((l.stdout || '').trim().split('\n').filter(Boolean));
  };
  useEffect(() => { refresh(); }, []);

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

  const needsUrl = () => {
    if (!url.trim()) { toast.error('Enter a URL first'); return true; }
    return false;
  };

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
          <Youtube className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">yt-dlp — Media Downloader</h1>
          <Badge variant={version ? 'default' : 'outline'} className="ml-2 text-[10px] font-mono">
            {version ? version : 'NOT INSTALLED'}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-3 w-3" /></Button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-5xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Setup</div>
            <p className="text-sm text-muted-foreground">
              Installs <code className="text-xs">yt-dlp</code> and ffmpeg on the AM06 host. Downloads land in{' '}
              <code className="text-xs">{ytdlp.dir}</code>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy} onClick={() => run('Install', ytdlp.install)}>
                <Download className="h-3 w-3 mr-1" /> Install
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('Update', ytdlp.update)}>
                Update
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Download</div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-9 font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <Button
                  key={f.id}
                  size="sm"
                  variant={format === f.id ? 'default' : 'outline'}
                  onClick={() => setFormat(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!!busy} onClick={() => !needsUrl() && run('Download', () => ytdlp.download(url.trim(), format))}>
                <Download className="h-3 w-3 mr-1" /> {busy === 'Download' ? 'Downloading…' : 'Download'}
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => !needsUrl() && run('Formats', () => ytdlp.listFormats(url.trim()))}>
                <ListVideo className="h-3 w-3 mr-1" /> List formats
              </Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => !needsUrl() && run('Subtitles', () => ytdlp.subtitles(url.trim()))}>
                <Captions className="h-3 w-3 mr-1" /> Subtitles only
              </Button>
            </div>
          </Card>

          {output && (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Output</div>
              <ScrollArea className="h-64">
                <pre className="p-3 text-[11px] font-mono whitespace-pre-wrap">{output}</pre>
              </ScrollArea>
            </Card>
          )}

          <Card className="p-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Library ({files.length})</div>
            {files.length === 0 && <p className="text-sm text-muted-foreground">No downloads yet.</p>}
            <div className="space-y-1">
              {files.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs font-mono border-b border-border/40 py-1">
                  <span className="truncate flex-1">{f}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    disabled={!!busy}
                    onClick={() => run('Delete', () => ytdlp.remove(f))}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
}
