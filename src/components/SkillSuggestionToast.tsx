import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, X } from 'lucide-react';
import { dismissSuggestion, markSaved, generateSkillCode, type SkillSuggestion } from '@/lib/skill-detector';
import { writeFile } from '@/lib/agent';
import { toast } from '@/hooks/use-toast';

interface Props {
  suggestion: SkillSuggestion | null;
  onClose: () => void;
}

export function SkillSuggestionToast({ suggestion, onClose }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (suggestion) {
      const seed = suggestion.rawSequence[0]?.tag.toLowerCase() || 'task';
      setName(`${seed}_skill`);
    }
  }, [suggestion]);

  if (!suggestion) return null;

  const handleSave = async () => {
    const trimmed = name.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!trimmed) return;
    try {
      const code = generateSkillCode(trimmed, suggestion);
      await writeFile(`public/skills/${trimmed}.py`, code);
      markSaved(suggestion.id);
      toast({ title: 'Skill saved', description: `Created public/skills/${trimmed}.py` });
      onClose();
    } catch (e) {
      toast({ title: 'Failed to save skill', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  const handleDismiss = () => {
    dismissSuggestion(suggestion.id);
    onClose();
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 p-3 shadow-lg border-primary/40 bg-card">
      <div className="flex items-start gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Save as a skill?</p>
          <p className="text-xs text-muted-foreground">
            You've done this {suggestion.occurrences}× — turn it into a reusable skill.
          </p>
        </div>
        <Button size="icon" variant="ghost" className="h-6 w-6 -mr-1 -mt-1" onClick={handleDismiss}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <pre className="text-[10px] bg-muted/50 rounded p-2 mb-2 overflow-hidden text-muted-foreground whitespace-pre-wrap line-clamp-3">
        {suggestion.template}
      </pre>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="skill name" className="h-8 text-xs" />
        <Button size="sm" onClick={handleSave} className="h-8">Save</Button>
      </div>
    </Card>
  );
}
