import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { pullModel, deleteModel, type PullProgress } from '@/lib/ollama';
import { Download, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  onPullComplete?: () => void;
}

export function ModelPullDialog({ onPullComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [modelName, setModelName] = useState('');
  const [pulling, setPulling] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setModelName('');
    setPulling(false);
    setStatus('');
    setProgress(0);
    setDone(false);
    setError('');
  };

  const handlePull = async () => {
    if (!modelName.trim() || pulling) return;
    setPulling(true);
    setDone(false);
    setError('');
    setProgress(0);
    setStatus('Starting download...');

    try {
      for await (const update of pullModel(modelName.trim())) {
        setStatus(update.status);
        if (update.total && update.completed) {
          setProgress(Math.round((update.completed / update.total) * 100));
        }
      }
      setDone(true);
      setProgress(100);
      setStatus('Download complete!');
      toast({ title: 'Model downloaded', description: `${modelName} is ready to use.` });
      onPullComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull model');
    } finally {
      setPulling(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  const suggestions = [
    { name: 'gemma3:4b', desc: 'Great for 32GB RAM' },
    { name: 'llama3.2:3b', desc: 'Fast & capable' },
    { name: 'mistral:7b', desc: 'Strong reasoning' },
    { name: 'qwen2.5:7b', desc: 'Multilingual' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Pull Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Ollama Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePull()}
              placeholder="e.g. gemma3:4b, llama3.2:3b"
              disabled={pulling}
              className="text-sm"
            />
            <Button onClick={handlePull} disabled={pulling || !modelName.trim()} size="sm" className="shrink-0">
              {pulling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
          </div>

          {!pulling && !done && !error && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Suggested models for your hardware:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setModelName(s.name)}
                    className="text-left p-2 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    <div className="text-xs font-medium">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(pulling || done || error) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {done && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {error && <XCircle className="h-4 w-4 text-destructive" />}
                {pulling && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <span className="text-xs text-muted-foreground truncate">{error || status}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-[10px] text-muted-foreground text-right">{progress}%</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
