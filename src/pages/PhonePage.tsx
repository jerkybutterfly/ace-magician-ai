import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Battery, MapPin, Bell, Vibrate, Volume2, RefreshCw } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { isPhone, executePhoneTag, getOrCreateDeviceId } from '@/lib/phone';
import { startPhoneRunner } from '@/lib/phone-runner';
import { toast } from 'sonner';

interface PairedDevice {
  device_id: string;
  name?: string;
  last_seen?: number;
  battery?: number | null;
  charging?: boolean;
}

export default function PhonePage() {
  const [devices, setDevices] = useState<PairedDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const onPhone = isPhone();

  const refresh = async () => {
    setLoading(true);
    try {
      const { agentUrl } = getSettings();
      const r = await fetch(`${agentUrl}/phone/status`);
      if (r.ok) {
        const j = await r.json();
        setDevices(Array.isArray(j.devices) ? j.devices : []);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const pair = () => {
    startPhoneRunner();
    toast.success(`Paired as ${getOrCreateDeviceId()}`);
    setTimeout(() => void refresh(), 1500);
  };

  const runLocal = async (tag: string) => {
    const res = await executePhoneTag(tag);
    res.ok ? toast.success(res.output) : toast.error(res.output);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Smartphone className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Phone</h1>
          <p className="text-sm text-muted-foreground">Control your Android device from any chat.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pairing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {onPhone ? (
            <>
              <p className="text-sm text-muted-foreground">
                You're on the phone. Tap below to register this device with the agent so the PC can send it commands.
              </p>
              <Button onClick={pair}>Pair with this device</Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Open this app on your Android phone and tap <em>Pair</em> there. The phone will appear in the list below.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Paired devices</CardTitle>
          <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No phones paired yet.</p>
          ) : (
            <div className="space-y-2">
              {devices.map(d => (
                <div key={d.device_id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/40">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{d.name || d.device_id}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.device_id} • {d.last_seen ? new Date(d.last_seen).toLocaleTimeString() : 'never'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.battery != null && (
                      <Badge variant="secondary" className="gap-1">
                        <Battery className="h-3 w-3" />
                        {d.battery}%{d.charging ? ' ⚡' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {onPhone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test panel</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Button variant="outline" onClick={() => runLocal('[PHONE_BATTERY]')}><Battery className="h-4 w-4 mr-1.5" />Battery</Button>
            <Button variant="outline" onClick={() => runLocal('[PHONE_LOCATION]')}><MapPin className="h-4 w-4 mr-1.5" />Location</Button>
            <Button variant="outline" onClick={() => runLocal('[PHONE_VIBRATE:400]')}><Vibrate className="h-4 w-4 mr-1.5" />Vibrate</Button>
            <Button variant="outline" onClick={() => runLocal('[PHONE_NOTIFY:Hi|It works!]')}><Bell className="h-4 w-4 mr-1.5" />Notify</Button>
            <Button variant="outline" onClick={() => runLocal('[PHONE_SPEAK:Hello from Pesto Steve]')}><Volume2 className="h-4 w-4 mr-1.5" />Speak</Button>
            <Button variant="outline" onClick={() => runLocal('[PHONE_NETWORK]')}>Network</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
