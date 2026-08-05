import { getSettings } from './settings';

const agent = (p: string) => `${getSettings().agentUrl}${p}`;

interface TerminalResult { returncode: number; stdout: string; stderr: string }

async function run(command: string, timeout = 900): Promise<TerminalResult> {
  const res = await fetch(agent('/terminal'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, timeout }),
  });
  if (!res.ok) throw new Error(`Agent error: ${res.status}`);
  return res.json();
}

// ── Install helpers ──────────────────────────────────────────────────────────
export const installNuclei = () =>
  run('command -v nuclei || (curl -sL https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_linux_amd64.zip -o /tmp/n.zip && unzip -o /tmp/n.zip -d /usr/local/bin/ && chmod +x /usr/local/bin/nuclei) && nuclei -version', 300);

export const updateNucleiTemplates = () => run('nuclei -update-templates', 600);

export const installReconftw = () =>
  run('test -d /opt/reconftw || git clone https://github.com/six2dez/reconftw /opt/reconftw && cd /opt/reconftw && ls install.sh', 300);

// ── Nuclei ───────────────────────────────────────────────────────────────────
export interface NucleiFinding {
  templateID: string;
  info: { name: string; severity: string; tags?: string[] };
  host: string;
  matched: string;
}

export async function nucleiScan(opts: {
  target: string;
  severity?: string;   // e.g. "medium,high,critical"
  tags?: string;       // e.g. "cve,exposure"
  templates?: string;  // e.g. "cves/,exposures/"
  rateLimit?: number;
}): Promise<{ raw: string; findings: NucleiFinding[] }> {
  const parts = ['nuclei', '-u', JSON.stringify(opts.target), '-jsonl', '-silent', '-nc'];
  if (opts.severity) parts.push('-severity', opts.severity);
  if (opts.tags) parts.push('-tags', opts.tags);
  if (opts.templates) parts.push('-t', opts.templates);
  parts.push('-rl', String(opts.rateLimit ?? 50));
  const cmd = parts.join(' ');
  const res = await run(cmd, 1200);
  const findings: NucleiFinding[] = [];
  for (const line of (res.stdout || '').split('\n')) {
    if (!line.trim()) continue;
    try {
      const j = JSON.parse(line);
      findings.push({
        templateID: j['template-id'] || j.templateID || '',
        info: j.info || { name: '', severity: 'info' },
        host: j.host || j.matched || '',
        matched: j['matched-at'] || j.matched || '',
      });
    } catch { /* ignore non-json lines */ }
  }
  return { raw: res.stdout, findings };
}

// ── ReconFTW ─────────────────────────────────────────────────────────────────
export const reconftwRun = (domain: string, mode: 'passive' | 'subdomains' | 'full' = 'passive') => {
  const flag = { passive: '-p', subdomains: '-s', full: '-a' }[mode];
  return run(`cd /opt/reconftw && ./reconftw.sh -d ${JSON.stringify(domain)} ${flag} -o /tmp/reconftw-${domain}`, 3000);
};

export const reconftwReadReport = (domain: string) =>
  fetch(agent(`/files/read?path=${encodeURIComponent(`/tmp/reconftw-${domain}/${domain}/recon.md`)}`))
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
    .then((d: { content: string }) => d.content);

// ── Extra individual offensive helpers routed through /terminal ──────────────
export const runNikto = (target: string) => run(`nikto -host ${JSON.stringify(target)} -maxtime 300`, 600);
export const runWhatweb = (target: string) => run(`whatweb -a 3 ${JSON.stringify(target)}`, 120);
export const runFfuf = (url: string, wordlist = '/usr/share/wordlists/dirb/common.txt') =>
  run(`ffuf -u ${JSON.stringify(url + '/FUZZ')} -w ${wordlist} -mc 200,301,302,401,403 -s`, 600);
export const runSubfinder = (domain: string) => run(`subfinder -d ${JSON.stringify(domain)} -silent`, 300);
export const runNaabu = (target: string) => run(`naabu -host ${JSON.stringify(target)} -silent -top-ports 1000`, 300);
export const runHttpx = (targetsCsv: string) =>
  run(`echo ${JSON.stringify(targetsCsv.replace(/,/g, '\n'))} | httpx -silent -title -tech-detect -status-code`, 300);
