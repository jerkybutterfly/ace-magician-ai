import { getSettings } from './settings';

function agentUrl(path: string): string {
  return `${getSettings().agentUrl}${path}`;
}

export interface SystemInfo {
  cpu_percent: number;
  memory: { total: number; used: number; percent: number };
  disk: { total: number; used: number; percent: number };
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const res = await fetch(agentUrl('/system'));
  if (!res.ok) throw new Error('Agent unavailable');
  return res.json();
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  returncode: number;
}

export async function runCommand(command: string): Promise<CommandResult> {
  const res = await fetch(agentUrl('/terminal'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  if (!res.ok) throw new Error('Command failed');
  return res.json();
}

export interface FileEntry {
  name: string;
  is_dir: boolean;
  size: number;
  modified: string;
}

export async function listFiles(path: string): Promise<FileEntry[]> {
  const res = await fetch(agentUrl(`/files?path=${encodeURIComponent(path)}`));
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}

export async function readFile(path: string): Promise<string> {
  const res = await fetch(agentUrl(`/files/read?path=${encodeURIComponent(path)}`));
  if (!res.ok) throw new Error('Failed to read file');
  const data = await res.json();
  return data.content;
}

export async function writeFile(path: string, content: string): Promise<void> {
  const res = await fetch(agentUrl('/files/write'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error('Failed to write file');
}

export async function deleteFile(path: string): Promise<void> {
  const res = await fetch(agentUrl('/files/delete'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('Failed to delete file');
}
