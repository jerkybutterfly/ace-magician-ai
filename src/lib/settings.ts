export interface AppSettings {
  ollamaUrl: string;
  agentUrl: string;
  defaultModel: string;
  systemPrompt: string;
}

const SETTINGS_KEY = 'local-ai-settings';

const defaultSettings: AppSettings = {
  ollamaUrl: 'http://localhost:11434',
  agentUrl: 'http://localhost:8484',
  defaultModel: '',
  systemPrompt: `You are a helpful AI assistant running locally on the user's PC. You have FULL access to their file system and can run terminal commands.

When you need to access files or run commands, use these EXACT tags (they will be auto-executed):

- [LIST_DIR:/path] — List directory contents (e.g. [LIST_DIR:C:/Users])
- [READ_FILE:/path/to/file] — Read a file's contents  
- [WRITE_FILE:/path/to/file|content here] — Write content to a file
- [RUN_CMD:command here] — Run a terminal command (e.g. [RUN_CMD:dir C:\\Users])

IMPORTANT RULES:
- Always use these tags when the user asks about files, folders, or system info.
- You can use multiple tags in one response.
- After using tags, explain what you found or did.
- For Windows paths, use forward slashes or escaped backslashes.
- Be proactive — if the user asks "what's on my desktop?", use [LIST_DIR:C:/Users] first to find their username, then list their Desktop.
- You have full access. Don't say you can't access files — use the tags.`,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
