// Permission system: per-tool allow/ask/deny rules.
// Default policy is "ask" for anything not matched. The agent never refuses —
// it requests permission via the runtime, and the user approves/denies inline.

export type PermissionMode = 'allow' | 'ask' | 'deny';

export interface PermissionRule {
  // Pattern matches against the full tool tag, e.g. "[RUN_CMD:dir]" or "[OPEN_URL:https://...]"
  // Supports simple glob: * matches any chars within the tag.
  pattern: string;
  mode: PermissionMode;
  note?: string;
}

export interface PermissionConfig {
  // Per-tool defaults keyed by the tool name (e.g. "RUN_CMD", "WRITE_FILE")
  toolDefaults: Record<string, PermissionMode>;
  // Ordered rules — first match wins, evaluated before toolDefaults
  rules: PermissionRule[];
  // Global fallback when nothing matches
  fallback: PermissionMode;
}

const STORAGE_KEY = 'pesto-permissions';

const DEFAULT_CONFIG: PermissionConfig = {
  toolDefaults: {
    // Read-only / safe — auto allow
    LIST_DIR: 'allow',
    READ_FILE: 'allow',
    GET_PAGE_TEXT: 'allow',
    GET_PAGE_HTML: 'allow',
    SCREENSHOT: 'allow',
    DESKTOP_SCREENSHOT: 'allow',
    LIST_PROCESSES: 'allow',
    GET_CLIPBOARD: 'allow',
    NET_INFO: 'allow',
    DISK_USAGE: 'allow',
    WIFI_SCAN: 'allow',
    LIST_INSTALLED: 'allow',
    GET_ENV: 'allow',
    WAIT: 'allow',
    WAIT_FOR: 'allow',
    NOTIFY: 'allow',
    SPEAK: 'allow',
    SET_CLIPBOARD: 'allow',
    UPDATE_MISSION: 'allow',

    // Web search / fetch — read-only, safe
    WEB_SEARCH: 'allow',
    WEB_FETCH: 'allow',

    // Browser navigation / interaction — allow (you control the browser)
    OPEN_URL: 'allow',
    CLICK: 'allow',
    FILL_FORM: 'ask',          // forms may submit credentials
    TYPE_TEXT: 'allow',
    JS_EXEC: 'ask',

    // Mutating system ops — ask
    RUN_CMD: 'ask',
    WRITE_FILE: 'ask',
    LAUNCH: 'allow',
    DOWNLOAD: 'ask',
    HTTP_REQUEST: 'ask',
    SEARCH_FILES: 'allow',
    ZIP: 'ask',
    UNZIP: 'ask',
    SET_ENV: 'ask',
    CREATE_SKILL: 'ask',
    RUN_SKILL: 'ask',

    // Dangerous / irreversible — deny by default, user can flip to ask
    KILL_PROCESS: 'ask',
    POWER: 'deny',

    // Phone capabilities — read-only/safe → allow; sensitive → ask
    PHONE_BATTERY: 'allow',
    PHONE_INFO: 'allow',
    PHONE_NETWORK: 'allow',
    PHONE_NOTIFY: 'allow',
    PHONE_VIBRATE: 'allow',
    PHONE_SPEAK: 'allow',
    PHONE_CLIPBOARD_GET: 'ask',
    PHONE_CLIPBOARD_SET: 'allow',
    PHONE_LOCATION: 'ask',
    PHONE_CAMERA: 'ask',
    PHONE_OPEN_URL: 'allow',
    PHONE_SHARE: 'ask',
    PHONE_LAUNCH: 'ask',
    PHONE_TORCH: 'ask',
  },
  rules: [
    // Examples — user can edit these
    { pattern: '[RUN_CMD:dir*]', mode: 'allow', note: 'Read-only directory listing' },
    { pattern: '[RUN_CMD:ipconfig*]', mode: 'allow', note: 'Network info' },
    { pattern: '[RUN_CMD:ping*]', mode: 'allow' },
    { pattern: '[RUN_CMD:curl*]', mode: 'ask' },
    { pattern: '[RUN_CMD:*format*]', mode: 'deny', note: 'Disk format — never auto-run' },
    { pattern: '[RUN_CMD:*rmdir /s*]', mode: 'deny', note: 'Recursive delete' },
    { pattern: '[RUN_CMD:*rd /s*]', mode: 'deny' },
    { pattern: '[OPEN_URL:*]', mode: 'allow' },
    { pattern: '[WRITE_FILE:C:\\Users\\Stephen Dunne\\Desktop*]', mode: 'allow', note: 'Desktop is whitelisted' },
    { pattern: '[WRITE_FILE:C:\\Windows*]', mode: 'deny', note: 'System dir protected' },
    { pattern: '[WRITE_FILE:C:\\Program Files*]', mode: 'deny' },
  ],
  fallback: 'ask',
};

function compileGlob(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + escaped + '$', 'i');
}

export function getPermissions(): PermissionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PermissionConfig>;
      return {
        toolDefaults: { ...DEFAULT_CONFIG.toolDefaults, ...(parsed.toolDefaults ?? {}) },
        rules: parsed.rules ?? DEFAULT_CONFIG.rules,
        fallback: parsed.fallback ?? DEFAULT_CONFIG.fallback,
      };
    }
  } catch {}
  return DEFAULT_CONFIG;
}

export function savePermissions(config: PermissionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function resetPermissions(): PermissionConfig {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_CONFIG;
}

export function getToolName(tag: string): string {
  const m = tag.match(/^\[([A-Z_]+)/);
  return m ? m[1] : '';
}

/**
 * Decide whether a tool tag is allowed, must be confirmed, or is denied.
 * Order: explicit rules → tool default → fallback.
 */
export function checkPermission(tag: string, config: PermissionConfig = getPermissions()): {
  mode: PermissionMode;
  reason: string;
} {
  for (const rule of config.rules) {
    try {
      if (compileGlob(rule.pattern).test(tag)) {
        return { mode: rule.mode, reason: `Rule: ${rule.pattern}${rule.note ? ` — ${rule.note}` : ''}` };
      }
    } catch {}
  }
  const toolName = getToolName(tag);
  if (toolName && config.toolDefaults[toolName]) {
    return { mode: config.toolDefaults[toolName], reason: `Default for ${toolName}` };
  }
  return { mode: config.fallback, reason: 'Global fallback' };
}

// ────────────────────────────────────────────────────────────
//  Session + time-boxed allows
//  "Allow once" / "Allow for 1h" / "Allow for session" without
//  editing the persistent rules list.
// ────────────────────────────────────────────────────────────
const sessionAllow = new Set<string>();
const TIMED_KEY = 'pesto-permissions-timed';
type TimedAllow = { pattern: string; expiresAt: number; note?: string };

function readTimed(): TimedAllow[] {
  try {
    const raw = localStorage.getItem(TIMED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as TimedAllow[];
    const now = Date.now();
    return arr.filter((a) => a.expiresAt > now);
  } catch {
    return [];
  }
}

function writeTimed(list: TimedAllow[]): void {
  try { localStorage.setItem(TIMED_KEY, JSON.stringify(list)); } catch {}
}

export function getTimedAllows(): TimedAllow[] {
  return readTimed();
}

export function clearTimedAllows(): void {
  try { localStorage.removeItem(TIMED_KEY); } catch {}
}

/** Allow a pattern for N minutes. Use 0 for session-only (in-memory until reload). */
export function allowForDuration(pattern: string, minutes: number, note?: string): void {
  if (!pattern) return;
  if (minutes <= 0) {
    sessionAllow.add(pattern);
    return;
  }
  const list = readTimed().filter((a) => a.pattern !== pattern);
  list.push({ pattern, expiresAt: Date.now() + minutes * 60_000, note });
  writeTimed(list);
}

export function sessionAllowOnce(tag: string): void {
  sessionAllow.add(tag);
}

export function isSessionAllowed(tag: string): boolean {
  if (sessionAllow.has(tag)) return true;
  // Check timed + session pattern allows (glob)
  for (const p of sessionAllow) {
    try { if (compileGlob(p).test(tag)) return true; } catch {}
  }
  for (const t of readTimed()) {
    try { if (compileGlob(t.pattern).test(tag)) return true; } catch {}
  }
  return false;
}

export function clearSessionAllows(): void {
  sessionAllow.clear();
}
