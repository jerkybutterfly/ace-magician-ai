import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface NetworkDevice {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  last_seen: string;
}

export interface ScanStatus {
  status: 'running' | 'done' | 'error';
  devices: NetworkDevice[];
  started_at?: string;
  finished_at?: string;
  error?: string;
}

export async function startNetworkScan(): Promise<{ scan_id: string }> {
  const res = await fetch(url('/network/scan'), { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start scan');
  return res.json();
}

export async function getScanStatus(id: string): Promise<ScanStatus> {
  const res = await fetch(url(`/network/scan/${id}`));
  if (!res.ok) throw new Error('Scan not found');
  return res.json();
}

export async function getLastDevices(): Promise<{ devices: NetworkDevice[]; finished_at: string | null }> {
  const res = await fetch(url('/network/devices'));
  if (!res.ok) throw new Error('Failed to load devices');
  return res.json();
}
