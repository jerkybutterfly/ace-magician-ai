import { useState, useEffect } from 'react';
import { listCronJobs, createCronJob, deleteCronJob, type CronJob } from '@/lib/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, RefreshCw, Clock, Terminal } from 'lucide-react';

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [interval, setInterval_] = useState('60');

  const refresh = async () => {
    setLoading(true);
    try {
      setJobs(await listCronJobs());
    } catch {
      toast({ title: 'Error', description: 'Failed to load cron jobs. Is the agent running?' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); const id = setInterval(refresh, 10000); return () => clearInterval(id); }, []);

  const handleCreate = async () => {
    if (!name.trim() || !command.trim()) return;
    try {
      await createCronJob(name.trim(), command.trim(), parseInt(interval) || 60);
      setName(''); setCommand(''); setInterval_('60');
      await refresh();
      toast({ title: 'Created', description: `Cron job "${name}" scheduled.` });
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to create cron job.' });
    }
  };

  const handleDelete = async (jobName: string) => {
    try {
      await deleteCronJob(jobName);
      await refresh();
      toast({ title: 'Deleted', description: `Cron job "${jobName}" removed.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete cron job.' });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 overflow-y-auto h-full pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cron Jobs</h1>
        <Button variant="ghost" size="icon" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New Scheduled Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Job name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Command to run" value={command} onChange={e => setCommand(e.target.value)} />
          <div className="flex gap-2 items-center">
            <Input placeholder="Interval (seconds)" type="number" value={interval} onChange={e => setInterval_(e.target.value)} className="w-40" />
            <span className="text-xs text-muted-foreground">seconds between runs</span>
          </div>
          <Button onClick={handleCreate} disabled={!name.trim() || !command.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Create Job
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No scheduled tasks yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Card key={job.name}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{job.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(job.name)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Terminal className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">{job.command}</code>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Every {job.interval_seconds}s</span>
                  <span>Runs: {job.run_count}</span>
                </div>
                {job.last_result && (
                  <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-24 whitespace-pre-wrap">
                    {job.last_result.stdout || job.last_result.stderr || '(no output)'}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
