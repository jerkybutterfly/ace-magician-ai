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
  systemPrompt: 'You are a helpful AI assistant running locally. You can help the user control their PC through terminal commands and file management when they ask.',
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
