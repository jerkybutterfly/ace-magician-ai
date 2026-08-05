// MCP (Model Context Protocol) client — talks to MCP servers via the local agent
// bridge (which handles stdio/streamable-http transports on the host PC).
// Config + saved servers live in localStorage.

import { getSettings } from './settings';

const KEY = 'local-ai-mcp';

export type McpTransport = 'stdio' | 'http' | 'sse';

export interface McpServer {
  id: string;
  name: string;
  transport: McpTransport;
  // stdio: command + args (e.g. 'npx -y @modelcontextprotocol/server-filesystem /tmp')
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  // http/sse:
  url?: string;
  headers?: Record<string, string>;
  enabled: boolean;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface McpToolCallResult {
  content: Array<{ type: string; text?: string; [k: string]: any }>;
  isError?: boolean;
}

export function getServers(): McpServer[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveServers(list: McpServer[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertServer(server: McpServer) {
  const all = getServers();
  const idx = all.findIndex((s) => s.id === server.id);
  if (idx >= 0) all[idx] = server;
  else all.push(server);
  saveServers(all);
}

export function removeServer(id: string) {
  saveServers(getServers().filter((s) => s.id !== id));
}

async function bridge<T = any>(path: string, body: any): Promise<T> {
  const { agentUrl } = getSettings();
  if (!agentUrl) throw new Error('Agent URL not set (Settings)');
  const res = await fetch(`${agentUrl.replace(/\/$/, '')}/mcp${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MCP bridge ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listTools(server: McpServer): Promise<McpTool[]> {
  const r = await bridge<{ tools: McpTool[] }>('/list_tools', { server });
  return r.tools || [];
}

export async function callTool(
  server: McpServer,
  name: string,
  args: Record<string, any> = {},
): Promise<McpToolCallResult> {
  return bridge<McpToolCallResult>('/call_tool', { server, name, args });
}

export async function pingServer(server: McpServer): Promise<{ ok: boolean; error?: string }> {
  try {
    await listTools(server);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

// Handy presets for the "add server" wizard.
export const PRESETS: Array<Omit<McpServer, 'id' | 'enabled'>> = [
  {
    name: 'Filesystem (/tmp)',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  },
  {
    name: 'GitHub',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' },
  },
  {
    name: 'Brave Search',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    env: { BRAVE_API_KEY: '' },
  },
  {
    name: 'Puppeteer',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
  },
  {
    name: 'SQLite',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', '/tmp/mcp.db'],
  },
];

export function newId() {
  return `mcp-${Math.random().toString(36).slice(2, 9)}`;
}
