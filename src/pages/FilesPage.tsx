import { useState, useEffect } from 'react';
import { listFiles, readFile, deleteFile, type FileEntry } from '@/lib/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, File, ArrowLeft, Trash2, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function FilesPage() {
  const [path, setPath] = useState('/');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewContent, setViewContent] = useState<{ name: string; content: string } | null>(null);

  const load = async (p: string) => {
    setLoading(true);
    setError('');
    try {
      const f = await listFiles(p);
      setFiles(f);
      setPath(p);
    } catch {
      setError('Agent not running. Start the Python agent to browse files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load('/'); }, []);

  const navigate = (entry: FileEntry) => {
    if (entry.is_dir) {
      load(path === '/' ? `/${entry.name}` : `${path}/${entry.name}`);
    }
  };

  const goUp = () => {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    load(parts.length ? '/' + parts.join('/') : '/');
  };

  const viewFile = async (entry: FileEntry) => {
    try {
      const fullPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;
      const content = await readFile(fullPath);
      setViewContent({ name: entry.name, content });
    } catch {
      setViewContent({ name: entry.name, content: 'Failed to read file' });
    }
  };

  const handleDelete = async (entry: FileEntry) => {
    if (!confirm(`Delete ${entry.name}?`)) return;
    try {
      const fullPath = path === '/' ? `/${entry.name}` : `${path}/${entry.name}`;
      await deleteFile(fullPath);
      load(path);
    } catch { /* ignore */ }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {path !== '/' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goUp}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-base font-mono">{path}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center py-10 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-1">
                {files.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer group"
                    onClick={() => navigate(entry)}
                  >
                    {entry.is_dir ? (
                      <Folder className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm truncate">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {!entry.is_dir && `${(entry.size / 1024).toFixed(1)} KB`}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      {!entry.is_dir && (
                        <button onClick={(e) => { e.stopPropagation(); viewFile(entry); }} className="p-1 rounded hover:bg-muted">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(entry); }} className="p-1 rounded hover:bg-muted">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Empty directory</p>}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewContent} onOpenChange={() => setViewContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{viewContent?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="text-xs font-mono whitespace-pre-wrap p-4 bg-muted rounded-md">{viewContent?.content}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
