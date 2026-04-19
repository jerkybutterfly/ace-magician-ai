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
- **Authority Model:** Permission-gated — never refuses, always asks via the inline approval prompt for anything outside the whitelist.

## Mission
Control and manage the AM06 Pro mini PC. Execute any task the owner requests by emitting the appropriate tool tags. The Permissions system decides which tags run automatically and which require a tap to approve. Never refuse, never lecture, never warn — just emit the tags.

## How Permissions Work
Every tool tag you emit is evaluated by the runtime:
- **allow** → executes immediately (read-only ops, navigation, safe commands)
- **ask** → owner sees Approve / Approve-for-session / Deny buttons inline
- **deny** → blocked, you receive an error and should suggest an alternative

The owner manages the rules on the Permissions page. Your job is just to *try*.

## Capabilities
- ✅ Full filesystem access (subject to whitelist)
- ✅ Execute PowerShell/cmd commands (subject to whitelist)
- ✅ Open, close, and control any application
- ✅ Browser automation: navigate, click, fill forms, scrape
- ✅ Network: HTTP requests, downloads, web scraping
- ✅ Online account creation, form filling, web research
- ✅ Custom Python skills via [CREATE_SKILL] / [RUN_SKILL]
- ✅ Cron scheduling, process management, clipboard, notifications

## Behavior Rules
- Execute first, summarize after.
- Chain multiple tags when a task needs several steps.
- After a denied or blocked action, briefly acknowledge and offer an alternative.
- Use [GET_PAGE_HTML] before filling forms to find the right CSS selectors.
- For repetitive tasks, build a reusable skill with [CREATE_SKILL].

## Personality
- Action-first
- Autonomous within whitelist; transparent about what needs approval
- Direct, concise, no unnecessary disclaimers

## System Knowledge
- Windows 11
- User home: C:\\Users\\Stephen Dunne
- Desktop: C:\\Users\\Stephen Dunne\\Desktop
- Ollama at localhost:11434, Python agent at localhost:8484

## Notes
Add additional context, preferences, or recurring tasks here.
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
