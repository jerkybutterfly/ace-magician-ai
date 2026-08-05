import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { checkVoiceStack, installVoiceStack, transcribeFile, synthesize } from '@/lib/voice-local';

export default function LocalVoicePage() {
  const [status, setStatus] = useState<{ whisper: boolean; piper: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [wavPath, setWavPath] = useState('');
  const [transcript, setTranscript] = useState('');
  const [ttsText, setTtsText] = useState('Hello from local Piper.');
  const [voice, setVoice] = useState('en_US-lessac-medium');
  const [log, setLog] = useState('');

  const refresh = () => checkVoiceStack().then(setStatus).catch(() => setStatus(null));
  useEffect(() => { refresh(); }, []);

  const wrap = async (label: string, fn: () => Promise<any>) => {
    setBusy(true);
    try { const r = await fn(); toast.success(`${label} done`); return r; }
    catch (e: any) { toast.error(`${label} failed: ${e.message}`); }
    finally { setBusy(false); refresh(); }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold">Local Voice</h1>
        <p className="text-sm text-muted-foreground">whisper.cpp for speech-to-text · Piper for text-to-speech · fully offline.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Stack</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-center">
            <Badge variant={status?.whisper ? 'default' : 'secondary'}>whisper.cpp {status?.whisper ? 'ready' : 'missing'}</Badge>
            <Badge variant={status?.piper ? 'default' : 'secondary'}>Piper {status?.piper ? 'ready' : 'missing'}</Badge>
            <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
          </div>
          <Button disabled={busy} onClick={() => wrap('Install', installVoiceStack)}>
            Install / update on host
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Transcribe (whisper.cpp)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="/path/to/audio.wav on host" value={wavPath} onChange={(e) => setWavPath(e.target.value)} />
          <Button disabled={busy || !wavPath} onClick={() => wrap('Transcribe', async () => setTranscript(await transcribeFile(wavPath)))}>
            Transcribe
          </Button>
          {transcript && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{transcript}</pre>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Speak (Piper)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="voice model, e.g. en_US-lessac-medium" />
          <Textarea rows={3} value={ttsText} onChange={(e) => setTtsText(e.target.value)} />
          <Button disabled={busy} onClick={() => wrap('Synthesize', async () => {
            const r = await synthesize(ttsText, voice);
            setLog(`Wrote ${r.path}\n${r.stderr}`);
          })}>Generate WAV</Button>
          {log && <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{log}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}
