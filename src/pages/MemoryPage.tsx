import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Save, RotateCcw } from 'lucide-react';

const MEMORY_KEY = 'pesto-agent-memory';

const DEFAULT_MEMORY = `# Agent Memory

## Identity
- **Name:** Pesto Steve's AI
- **Role:** Personal AI assistant & PC controller
- **Owner:** Stephen Dunne

## Mission
Control and manage the AM06 Pro mini PC. Execute tasks autonomously using terminal commands, file operations, and application control.

## Key Objectives
- Respond to user commands quickly and accurately
- Manage files and folders on the PC
- Run programs and scripts as requested
- Provide system information and diagnostics
- Execute tasks via Telegram when remote

## Personality
- Helpful, direct, and action-oriented
- Never asks the user to run commands manually
- Always uses tool tags to execute actions

## Knowledge
- Windows 11 environment
- User home: C:\\Users\\Stephen Dunne
- Ollama running locally for inference
- Python agent at localhost:8484

## Notes
Add any additional context, preferences, or instructions here.
`;

export default function MemoryPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(MEMORY_KEY);
    setContent(saved ?? DEFAULT_MEMORY);
  }, []);

  const handleSave = () => {
    localStorage.setItem(MEMORY_KEY, content);
    toast({ title: 'Memory saved', description: 'Agent memory updated successfully.' });
  };

  const handleReset = () => {
    setContent(DEFAULT_MEMORY);
    localStorage.setItem(MEMORY_KEY, DEFAULT_MEMORY);
    toast({ title: 'Memory reset', description: 'Restored to default template.' });
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Agent Memory</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">memory.md</CardTitle>
          <CardDescription>
            Store agent identity, mission, objectives, and context. This is injected into the system prompt so the AI knows who it is and what it should do.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono text-xs leading-relaxed"
            placeholder="# Agent Memory..."
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" /> Save Memory
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
