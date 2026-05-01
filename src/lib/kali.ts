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

// ── Extended offensive toolkit ──
export interface HeaderFinding { level: 'info' | 'warn' | 'error'; title: string; detail: string }
export const labHeaders = (url: string, method: 'GET' | 'HEAD' = 'GET') =>
  post<{ url: string; final_url: string; status: number; headers: Record<string, string>; findings: HeaderFinding[]; body_preview: string; error?: string }>('/labmode/headers', { url, method }, true);

export const labSsl = (host: string, port = 443) =>
  post<{ host: string; port: number; tls_version: string; cipher: [string, string, number]; cert: Record<string, unknown>; pem_preview: string; error?: string }>('/labmode/ssl', { host, port }, true);

export interface VulnProbeResult { payload: string; value: string; status: number; reflected: boolean; error_signature: string | null; ssti_eval: boolean; suspicious: boolean }
export const labVulnProbe = (url: string, param = 'q') =>
  post<{ url: string; param: string; results: VulnProbeResult[] }>('/labmode/vuln_probe', { url, param }, true);

export const labHostSweep = (cidr: string) =>
  post<{ cidr: string; scanned: number; alive: { ip: string; hostname: string }[] }>('/labmode/host_sweep', { cidr }, true);

export const labBanner = (host: string, port: number, probe?: string) =>
  post<{ host: string; port: number; bytes: number; banner: string; error?: string }>('/labmode/banner', { host, port, probe }, true);

export const labSpray = (params: {
  url: string; usernames: string[]; password: string; user_field?: string; pass_field?: string; fail_text?: string; delay?: number;
}) => post<{ url: string; tried: number; hits: { user: string; status: number; likely_success: boolean }[]; results: { user: string; status: number; likely_success: boolean; error?: string }[] }>('/labmode/spray', params, true);

export const labRobots = (base_url: string) =>
  post<{ base_url: string; robots: string; sitemap_urls: string[]; disallow: string[]; allow: string[]; sitemap_locs?: string[]; robots_error?: string }>('/labmode/robots', { base_url }, true);

export interface CorsResult { origin: string; acao?: string; acac?: string; vulnerable?: boolean; error?: string }
export const labCors = (url: string) =>
  post<{ url: string; results: CorsResult[] }>('/labmode/cors', { url }, true);
