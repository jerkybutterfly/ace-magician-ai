import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchModels, type OllamaModel } from '@/lib/ollama';
import { RefreshCw } from 'lucide-react';
import { ModelPullDialog } from './ModelPullDialog';

interface Props {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: Props) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const m = await fetchModels();
      setModels(m);
      if (m.length > 0 && !value) onChange(m[0].name);
    } catch {
      setError('Cannot connect to Ollama');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px] h-8 text-xs">
          <SelectValue placeholder={loading ? 'Loading...' : error || 'Select model'} />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.name} value={m.name} className="text-xs">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button onClick={load} disabled={loading} className="p-1 rounded hover:bg-muted transition-colors">
        <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
      </button>
      <ModelPullDialog onPullComplete={load} />
    </div>
  );
}
