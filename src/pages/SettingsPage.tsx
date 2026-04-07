import { useEffect, useState } from 'react';
import { connectTelegram, disconnectTelegram, getTelegramStatus, type TelegramStatus } from '@/lib/agent';
import { getSettings, saveSettings, DEFAULT_SYSTEM_PROMPT, type AppSettings } from '@/lib/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

function createEmptyTelegramStatus(): TelegramStatus {
  return {
    enabled: false,
    connected: false,
    running: false,
    username: null,
    model: null,
    error: null,
    updated_at: null,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    if (error.message === 'Not Found') {
      return 'Your local agent is running, but it is missing the Telegram endpoints. Run the latest public/agent.py and restart it.';
    }

    return error.message === 'Failed to fetch'
      ? 'Local agent unavailable at the configured Agent URL.'
      : error.message;
  }

  return fallback;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>(createEmptyTelegramStatus);
  const [telegramLoading, setTelegramLoading] = useState(true);
  const [telegramAction, setTelegramAction] = useState<'connect' | 'disconnect' | null>(null);

  const telegramBusy = telegramAction !== null;

  const update = (key: keyof AppSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    toast({ title: 'Settings saved', description: 'Configuration updated successfully.' });
  };

  const refreshTelegramStatus = async () => {
    setTelegramLoading(true);

    try {
      setTelegramStatus(await getTelegramStatus());
    } catch (error) {
      setTelegramStatus({
        ...createEmptyTelegramStatus(),
        error: getErrorMessage(error, 'Failed to load Telegram status.'),
      });
    } finally {
      setTelegramLoading(false);
    }
  };

  useEffect(() => {
    void refreshTelegramStatus();
  }, []);

  useEffect(() => {
    if (!(telegramStatus.running && !telegramStatus.enabled)) return;

    const timeoutId = window.setTimeout(() => {
      void refreshTelegramStatus();
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [telegramStatus.running, telegramStatus.enabled]);

  const handleConnectTelegram = async () => {
    if (!settings.telegramBotToken.trim()) {
      toast({ title: 'Telegram token required', description: 'Paste your bot token first.' });
      return;
    }

    saveSettings(settings);
    setTelegramAction('connect');

    try {
      const status = await connectTelegram(settings.telegramBotToken, settings.defaultModel || undefined);
      setTelegramStatus(status);
      toast({
        title: status.status === 'already_connected' ? 'Telegram already connected' : 'Telegram connected',
        description: status.username ? `Bot @${status.username} is now running.` : 'Telegram bot is now running.',
      });
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to connect Telegram.');
      setTelegramStatus({ ...createEmptyTelegramStatus(), error: message });
      toast({ title: 'Telegram connection failed', description: message });
    } finally {
      setTelegramAction(null);
    }
  };

  const handleDisconnectTelegram = async () => {
    saveSettings(settings);
    setTelegramAction('disconnect');

    try {
      const status = await disconnectTelegram();
      setTelegramStatus(status);
      toast({
        title: status.status === 'disconnecting' ? 'Disconnecting Telegram' : 'Telegram disconnected',
        description: status.status === 'disconnecting' ? 'Stopping the bot on your local agent.' : 'Telegram bot stopped.',
      });
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to disconnect Telegram.');
      setTelegramStatus({ ...createEmptyTelegramStatus(), error: message });
      toast({ title: 'Telegram disconnect failed', description: message });
    } finally {
      setTelegramAction(null);
    }
  };

  const telegramStatusText = (() => {
    if (telegramAction === 'connect') return 'Connecting Telegram bot...';
    if (telegramAction === 'disconnect') return 'Disconnecting Telegram bot...';
    if (telegramLoading) return 'Checking the local agent...';
    if (telegramStatus.running && !telegramStatus.enabled) return 'Disconnecting Telegram bot...';
    if (telegramStatus.connected) {
      const identity = telegramStatus.username ? `@${telegramStatus.username}` : 'your Telegram bot';
      const modelText = telegramStatus.model ? ` using ${telegramStatus.model}` : '';
      return `Connected as ${identity}${modelText}.`;
    }
    if (telegramStatus.error) return telegramStatus.error;
    return 'Telegram bot is not connected.';
  })();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 overflow-y-auto h-full pb-8">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ollama Configuration</CardTitle>
          <CardDescription>Configure connection to your local Ollama instance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ollama-url">Ollama URL</Label>
            <Input id="ollama-url" value={settings.ollamaUrl} onChange={(e) => update('ollamaUrl', e.target.value)} placeholder="http://localhost:11434" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-model">Default Model</Label>
            <Input id="default-model" value={settings.defaultModel} onChange={(e) => update('defaultModel', e.target.value)} placeholder="e.g. llama3.2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LM Studio Configuration</CardTitle>
          <CardDescription>Connect to a local LM Studio server for running models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lmstudio-url">LM Studio URL</Label>
            <Input id="lmstudio-url" value={settings.lmStudioUrl} onChange={(e) => update('lmStudioUrl', e.target.value)} placeholder="http://localhost:1234" />
            <p className="text-xs text-muted-foreground">
              Start LM Studio&apos;s local server (Developer tab → Start Server) then select &quot;LM Studio&quot; as a provider in Chat.
            </p>
          </div>
        </CardContent>
      </Card>

        <CardHeader>
          <CardTitle className="text-base">Agent Configuration</CardTitle>
          <CardDescription>Configure connection to the local Python agent for PC control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-url">Agent URL</Label>
            <Input id="agent-url" value={settings.agentUrl} onChange={(e) => update('agentUrl', e.target.value)} placeholder="http://localhost:8484" />
            <p className="text-xs text-muted-foreground">
              Use <code className="text-xs bg-muted px-1 rounded">http://localhost:8484</code> on the same PC. From your phone or another device, use your PC&apos;s LAN IP instead.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Telegram Integration</CardTitle>
          <CardDescription>Control your PC remotely via Telegram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram-token">Bot Token</Label>
            <Input id="telegram-token" type="password" value={settings.telegramBotToken} onChange={(e) => update('telegramBotToken', e.target.value)} placeholder="123456:ABC-DEF..." />
            <p className="text-xs text-muted-foreground">
              Get a token from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline text-primary">@BotFather</a>, then tap Connect Telegram to start the bot on the running local agent.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground break-words">{telegramStatusText}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={handleConnectTelegram}
              disabled={telegramBusy || telegramLoading || !settings.telegramBotToken.trim()}
              className="sm:flex-1"
            >
              {telegramAction === 'connect' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Connect Telegram
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDisconnectTelegram}
              disabled={telegramBusy || telegramLoading || (!telegramStatus.running && !telegramStatus.connected)}
              className="sm:flex-1"
            >
              {telegramAction === 'disconnect' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Prompt</CardTitle>
          <CardDescription>Default system prompt for all conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={settings.systemPrompt} onChange={(e) => update('systemPrompt', e.target.value)} rows={6} placeholder="You are a helpful AI assistant..." className="font-mono text-xs" />
          <Button variant="outline" size="sm" onClick={() => update('systemPrompt', DEFAULT_SYSTEM_PROMPT)}>
            Reset to Default
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" /> Save Settings
      </Button>
    </div>
  );
}
