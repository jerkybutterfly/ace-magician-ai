import { useState, useRef, useEffect } from 'react';
import { runCommand, type CommandResult } from '@/lib/agent';
import { Terminal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalEntry {
  command: string;
  result?: CommandResult;
  error?: string;
}

export function TerminalWidget() {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const execute = async () => {
    const cmd = input.trim();
    if (!cmd || running) return;
    setInput('');
    setRunning(true);
    const entry: TerminalEntry = { command: cmd };
    setEntries((prev) => [...prev, entry]);

    try {
      const result = await runCommand(cmd);
      setEntries((prev) => prev.map((e, i) => (i === prev.length - 1 ? { ...e, result } : e)));
    } catch (err) {
      setEntries((prev) => prev.map((e, i) => (i === prev.length - 1 ? { ...e, error: 'Agent not running or unreachable' } : e)));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Terminal className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Terminal</span>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="font-mono text-xs space-y-2">
          {entries.map((entry, i) => (
            <div key={i}>
              <div className="text-primary">$ {entry.command}</div>
              {entry.result && (
                <>
                  {entry.result.stdout && <pre className="text-foreground/80 whitespace-pre-wrap">{entry.result.stdout}</pre>}
                  {entry.result.stderr && <pre className="text-destructive whitespace-pre-wrap">{entry.result.stderr}</pre>}
                  {entry.result.returncode !== 0 && (
                    <div className="text-destructive text-[10px]">Exit code: {entry.result.returncode}</div>
                  )}
                </>
              )}
              {entry.error && <div className="text-destructive">{entry.error}</div>}
            </div>
          ))}
          {running && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="p-2 border-t">
        <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2">
          <span className="text-xs text-primary font-mono">$</span>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && execute()}
            placeholder="Type a command..."
            className="border-0 bg-transparent h-8 text-xs font-mono focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
            disabled={running}
          />
        </div>
      </div>
    </div>
  );
}
