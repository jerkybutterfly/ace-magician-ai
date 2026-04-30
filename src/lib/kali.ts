import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

async function post<T>(path: string, body: unknown, lab = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (lab) headers['I-Own-This'] = 'yes';
  const res = await fetch(url(path), { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let msg = `${res.status}`;
    try { const j = await res.json(); msg = j.detail || j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ── Recon ──
export interface OpenPort { port: number; service: string; banner: string }
export interface PortScanResult { target: string; ip: string; scanned: number; open: OpenPort[] }
export const portScan = (target: string, ports?: string, timeout = 0.5) =>
  post<PortScanResult>('/recon/portscan', { target, ports, timeout });

export const traceroute = (target: string) =>
  post<{ target: string; output: string }>('/recon/traceroute', { target });

export const dnsLookup = (name: string) =>
  post<{ name: string; records: { A: string[]; AAAA: string[]; PTR: string | null; CNAME: string[]; error?: string } }>('/recon/dns', { name });

export const whois = (domain: string) =>
  post<{ domain: string; output: string }>('/recon/whois', { domain });

export const geoip = (ip: string) =>
  post<Record<string, unknown>>('/recon/geoip', { ip });

// ── Forensics ──
export const hashFile = (path: string) =>
  post<{ path: string; size: number; md5: string; sha1: string; sha256: string }>('/recon/hash', { path });

export const stringsFile = (path: string, min_len = 6, limit = 500) =>
  post<{ path: string; count: number; strings: string[] }>('/recon/strings', { path, min_len, limit });

export const hexdump = (path: string, offset = 0, length = 512) =>
  post<{ path: string; offset: number; length: number; dump: string }>('/recon/hexdump', { path, offset, length });

export const exif = (path: string) =>
  post<{ path: string; format: string; size: [number, number]; mode: string; exif: Record<string, string> }>('/recon/exif', { path });

export const pwnedCheck = (password: string) =>
  post<{ breached: boolean; count: number; strength: number }>('/recon/pwned', { password });

// ── Audit ──
export interface AuditFinding { level: 'info' | 'warn' | 'error'; title: string; detail: string }
export interface AuditResult {
  system: string;
  hostname: string;
  listening_ports: { port: number; ip: string; pid: number }[];
  firewall: string;
  failed_logins: string;
  users: string[];
  encryption: string;
  findings: AuditFinding[];
}
export const runAudit = () => get<AuditResult>('/audit/run');

// ── Lab Mode (gated) ──
export const labDirbust = (base_url: string, extra_paths: string[] = []) =>
  post<{ base_url: string; checked: number; found: { path: string; url: string; status: number; len: number }[] }>('/labmode/dirbust', { base_url, extra_paths }, true);

export const labSubdomains = (domain: string, words: string[] = []) =>
  post<{ domain: string; checked: number; found: { host: string; ip: string }[] }>('/labmode/subdomain', { domain, words }, true);

export const labLoginProbe = (params: {
  url: string; user_field?: string; pass_field?: string; username: string; password: string; fail_text?: string;
}) => post<{ status: number; len: number; likely_success: boolean; snippet: string; error?: string }>('/labmode/login_probe', params, true);
