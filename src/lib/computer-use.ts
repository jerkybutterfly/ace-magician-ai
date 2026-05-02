import { supabase } from '@/integrations/supabase/client';
import { getSettings } from './settings';

export interface CUAction {
  type: 'click' | 'double_click' | 'right_click' | 'move' | 'type' | 'key' | 'hotkey' | 'scroll' | 'wait' | 'done' | 'fail';
  x?: number;
  y?: number;
  text?: string;
  key?: string;
  keys?: string[];
  amount?: number;
  ms?: number;
  reason?: string;
}

export interface CUDecision {
  thought: string;
  action: CUAction;
  needs_approval: boolean;
  risk: 'low' | 'medium' | 'high';
}

export interface CUHistoryEntry {
  summary: string;
}

function agentUrl(p: string) { return `${getSettings().agentUrl}${p}`; }

export async function cuScreenshot(): Promise<{ image: string; width?: number; height?: number }> {
  const r = await fetch(agentUrl('/screenshot'));
  if (!r.ok) throw new Error('Screenshot failed — install pyautogui on the agent host');
  return r.json();
}

export async function cuScreenSize(): Promise<{ width: number; height: number; available: boolean; error?: string }> {
  const r = await fetch(agentUrl('/computer-use/screen-size'));
  return r.json();
}

export async function cuExecute(action: CUAction): Promise<void> {
  const r = await fetch(agentUrl('/computer-use/act'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  if (!r.ok) {
    let msg = 'Action failed';
    try { msg = (await r.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
}

export async function cuDecide(goal: string, image: string, history: CUHistoryEntry[]): Promise<CUDecision> {
  const { data, error } = await supabase.functions.invoke('computer-use', {
    body: { goal, image, history },
  });
  if (error) throw error;
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as CUDecision;
}

export function summarizeAction(a: CUAction): string {
  switch (a.type) {
    case 'click': return `click @ (${a.x},${a.y})`;
    case 'double_click': return `double-click @ (${a.x},${a.y})`;
    case 'right_click': return `right-click @ (${a.x},${a.y})`;
    case 'move': return `move @ (${a.x},${a.y})`;
    case 'type': return `type "${(a.text || '').slice(0, 40)}"${a.x !== undefined ? ` @ (${a.x},${a.y})` : ''}`;
    case 'key': return `press ${a.key}`;
    case 'hotkey': return `hotkey ${(a.keys || []).join('+')}`;
    case 'scroll': return `scroll ${a.amount}`;
    case 'wait': return `wait ${a.ms}ms`;
    case 'done': return `DONE — ${a.reason || ''}`;
    case 'fail': return `FAIL — ${a.reason || ''}`;
    default: return a.type;
  }
}
