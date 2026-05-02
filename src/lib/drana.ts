import { getSettings } from './settings';
import { supabase } from '@/integrations/supabase/client';
import toolsCatalog from '@/data/drana-tools.json';
import commandsCatalog from '@/data/drana-commands.json';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface DranaTool {
  id: number;
  tool_name: string;
  version_command: string;
  install_link: string;
  icon_class: string;
}

export interface DranaCommand {
  command: string;
  prompt: string;
  output: string;
  result: string;
  mslec: number;
}

export type DranaCategory = 'WAF' | 'PORTSCAN' | 'WEBTECH' | 'SUBDOMAIN' | 'GETURL';

export const DRANA_TOOLS: DranaTool[] = toolsCatalog as DranaTool[];
export const DRANA_COMMANDS = commandsCatalog as Record<DranaCategory, Record<string, DranaCommand>>;

export interface ToolStatus {
  tool: string;
  installed: boolean;
  version: string | null;
  path?: string;
  error?: string;
}

export async function checkInstalledTools(): Promise<ToolStatus[]> {
  const res = await fetch(url('/drana/tools/check'));
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  const data = await res.json();
  return data.tools as ToolStatus[];
}

export interface DranaRunResult {
  command: string;
  tool: string;
  returncode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export async function runDranaCommand(command: string, target: string, timeout = 90): Promise<DranaRunResult> {
  const res = await fetch(url('/drana/run'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'I-Own-This': 'yes' },
    body: JSON.stringify({ command, target, timeout }),
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try { const j = await res.json(); msg = j.detail || j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/** Sends raw tool output to the LLM with Drana's strict JSON parser prompt. */
export async function aiParseOutput(prompt: string, output: string): Promise<unknown> {
  const filled = prompt.replace('OUTPUT_HERE', output.slice(0, 8000));
  // Stream chat-google for parsing; aggregate to a single string
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a strict parser. Return ONLY valid JSON, no markdown, no explanation.' },
        { role: 'user', content: filled },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI parse failed: ${res.status}`);
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') continue;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) text += c;
      } catch {}
    }
  }
  // Strip code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch { return { raw: text }; }
}

// Suppress unused supabase import warning — reserved for future direct invokes
void supabase;
