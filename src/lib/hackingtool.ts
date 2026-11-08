import { getSettings } from './settings';

export interface HackingToolEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  project_url: string;
}
export interface HackingToolCatalog {
  loaded: boolean;
  count: number;
  commit: string;
  mode: 'read-only';
  tools: HackingToolEntry[];
}

async function request<T>(path: string, method = 'GET'): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${getSettings().agentUrl.replace(/\/$/, '')}/hackingtool/${path}`, {
      method, signal: controller.signal,
    });
    if (response.status === 404) throw new Error('Update the mini PC helper and restart it to connect HackingTool.');
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Catalogue request failed');
    return data as T;
  } finally { window.clearTimeout(timer); }
}

export const hackingtool = {
  catalog: () => request<HackingToolCatalog>('catalog'),
  download: () => request<Omit<HackingToolCatalog, 'tools'>>('catalog', 'POST'),
};