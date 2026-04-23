import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Radio, Loader2, Plus, X, Send } from 'lucide-react';
import {
  getMqttConfig, saveMqttConfig, getMqttStatus, mqttConnect, mqttDisconnect,
  mqttPublish, mqttSubscribe, mqttUnsubscribe, getMqttMessages,
  type MqttConfig, type MqttStatus, type MqttMessage,
} from '@/lib/mqtt';
import { toast } from '@/hooks/use-toast';

export default function MqttPage() {
  const [config, setConfig] = useState<MqttConfig>({ host: '', port: 1883, username: '', password: '', enabled: false, subscriptions: [] });
  const [status, setStatus] = useState<MqttStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [pubTopic, setPubTopic] = useState('');
  const [pubPayload, setPubPayload] = useState('');
  const [pubRetain, setPubRetain] = useState(false);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const sinceRef = useRef(0);

  useEffect(() => {
    void refresh();
    const t = window.setInterval(pollMessages, 2000);
    return () => window.clearInterval(t);
  }, []);

  const refresh = async () => {
    try {
      const [c, s] = await Promise.all([getMqttConfig(), getMqttStatus()]);
      setConfig(c);
      setStatus(s);
    } catch (e) {
      toast({ title: 'MQTT error', description: e instanceof Error ? e.message : 'Cannot reach agent' });
    }
  };

  const pollMessages = async () => {
    try {
      const { messages: msgs, now } = await getMqttMessages(sinceRef.current);
      if (msgs.length) {
        setMessages(prev => [...msgs.reverse(), ...prev].slice(0, 200));
      }
      sinceRef.current = now;
    } catch {/* silent */}
  };

  const update = (patch: Partial<MqttConfig>) => setConfig(prev => ({ ...prev, ...patch }));

  const save = async () => {
    setBusy(true);
    try {
      const next = await saveMqttConfig(config);
      setConfig(next);
      toast({ title: 'MQTT config saved' });
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'unknown' });
    } finally { setBusy(false); }
  };

  const connect = async () => {
    setBusy(true);
    try {
      await saveMqttConfig(config);
      const s = await mqttConnect();
      setStatus(s);
      toast({ title: 'Connected to MQTT broker' });
    } catch (e) {
      toast({ title: 'Connect failed', description: e instanceof Error ? e.message : 'unknown' });
    } finally { setBusy(false); }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const s = await mqttDisconnect();
      setStatus(s);
    } finally { setBusy(false); }
  };

  const addSubscription = async () => {
    if (!newTopic.trim()) return;
    try {
      await mqttSubscribe(newTopic.trim());
      setNewTopic('');
      await refresh();
    } catch (e) {
      toast({ title: 'Subscribe failed', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  const removeSubscription = async (topic: string) => {
    try {
      await mqttUnsubscribe(topic);
      await refresh();
    } catch (e) {
      toast({ title: 'Unsubscribe failed', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  const publish = async () => {
    if (!pubTopic.trim()) return;
    try {
      await mqttPublish(pubTopic.trim(), pubPayload, pubRetain);
      toast({ title: 'Published' });
    } catch (e) {
      toast({ title: 'Publish failed', description: e instanceof Error ? e.message : 'unknown' });
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Radio className="h-4 w-4" /> MQTT Bridge</CardTitle>
            <CardDescription>Connect to Home Assistant, Zigbee2MQTT, or any MQTT broker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Host</Label>
                <Input value={config.host} onChange={(e) => update({ host: e.target.value })} placeholder="192.168.1.10" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Port</Label>
                <Input type="number" value={config.port} onChange={(e) => update({ port: parseInt(e.target.value) || 1883 })} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Username (optional)</Label>
                <Input value={config.username} onChange={(e) => update({ username: e.target.value })} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Password (optional)</Label>
                <Input type="password" value={config.password} onChange={(e) => update({ password: e.target.value })} className="h-8 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={config.enabled} onCheckedChange={(v) => update({ enabled: v })} />
              <Label className="text-xs">Auto-connect on agent boot</Label>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-3 py-2">
              <span className="text-xs">
                Status: {status?.connected ? <Badge variant="default" className="ml-1">Connected</Badge> : <Badge variant="secondary" className="ml-1">Disconnected</Badge>}
                {status?.last_error && <span className="text-destructive ml-2">{status.last_error}</span>}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={save} disabled={busy}>Save</Button>
                {status?.connected ? (
                  <Button size="sm" variant="outline" onClick={disconnect} disabled={busy}>Disconnect</Button>
                ) : (
                  <Button size="sm" onClick={connect} disabled={busy || !config.host}>
                    {busy && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}Connect
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Subscriptions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="zigbee2mqtt/# or homeassistant/sensor/+/state" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addSubscription()} />
              <Button size="sm" onClick={addSubscription}><Plus className="h-3 w-3 mr-1" />Subscribe</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(status?.subscriptions || config.subscriptions || []).map(t => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button onClick={() => removeSubscription(t)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              {(status?.subscriptions || config.subscriptions || []).length === 0 && (
                <span className="text-xs text-muted-foreground">No subscriptions yet</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input value={pubTopic} onChange={(e) => setPubTopic(e.target.value)} placeholder="topic" className="h-8 text-sm" />
            <Input value={pubPayload} onChange={(e) => setPubPayload(e.target.value)} placeholder='payload (e.g. {"state":"ON"})' className="h-8 text-sm font-mono" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs"><Switch checked={pubRetain} onCheckedChange={setPubRetain} /> Retain</label>
              <Button size="sm" onClick={publish} disabled={!pubTopic.trim()}><Send className="h-3 w-3 mr-1" />Publish</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Live Messages</CardTitle></CardHeader>
          <CardContent>
            <div className="border border-border/50 rounded-md max-h-96 overflow-y-auto">
              {messages.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">Waiting for messages…</p>}
              {messages.map((m, i) => (
                <div key={i} className="px-3 py-2 border-b border-border/30 last:border-0 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-primary truncate">{m.topic}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{new Date(m.ts * 1000).toLocaleTimeString()}</span>
                  </div>
                  <pre className="font-mono text-[11px] mt-1 break-all whitespace-pre-wrap">{m.payload}</pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
