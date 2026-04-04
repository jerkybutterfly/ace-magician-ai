import { useState } from 'react';
import { getSettings, saveSettings, DEFAULT_SYSTEM_PROMPT, type AppSettings } from '@/lib/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    toast({ title: 'Settings saved', description: 'Configuration updated successfully.' });
  };

  const update = (key: keyof AppSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
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
          <CardTitle className="text-base">Agent Configuration</CardTitle>
          <CardDescription>Configure connection to the local Python agent for PC control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-url">Agent URL</Label>
            <Input id="agent-url" value={settings.agentUrl} onChange={(e) => update('agentUrl', e.target.value)} placeholder="http://localhost:8484" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Prompt</CardTitle>
          <CardDescription>Default system prompt for all conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={settings.systemPrompt} onChange={(e) => update('systemPrompt', e.target.value)} rows={4} placeholder="You are a helpful AI assistant..." />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" /> Save Settings
      </Button>
    </div>
  );
}
