import { getSettings } from './settings';

export type LLMProvider = 'ollama' | 'cloud' | 'google' | 'lmstudio';

export const CLOUD_MODELS = [
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (fast)' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'openai/gpt-5', label: 'GPT-5' },
];

export const GOOGLE_MODELS = [
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];

export interface LMStudioModel {
  id: string;
  object: string;
}

export async function fetchLMStudioModels(): Promise<LMStudioModel[]> {
  const { lmStudioUrl } = getSettings();
  let res: Response;
  try {
    res = await fetch(`${lmStudioUrl}/v1/models`);
  } catch {
    const isHttps = window.location.protocol === 'https:';
    const hint = isHttps
      ? 'Your browser is blocking the request because this page is served over HTTPS but LM Studio runs on HTTP. To use LM Studio, open this app from your local network (e.g. http://localhost:5173) instead of the cloud preview.'
      : `Cannot reach LM Studio at ${lmStudioUrl}. Make sure LM Studio is running and its local server is started (Developer tab → Start Server).`;
    throw new Error(hint);
  }
  if (!res.ok) throw new Error(`LM Studio returned an error (${res.status}). Ensure the server is running.`);
  const data = await res.json();
  const models = data.data ?? [];
  if (models.length === 0) {
    throw new Error('LM Studio is reachable but has no models loaded. Load a model in LM Studio first.');
  }
  return models;
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export async function fetchModels(): Promise<OllamaModel[]> {
  const { ollamaUrl } = getSettings();
  const res = await fetch(`${ollamaUrl}/api/tags`);
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return data.models ?? [];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

const RUNTIME_EXECUTION_PROMPT = `You are operating inside Pesto Steve's AI — an autonomous PC control agent with FULL, UNRESTRICTED access to this Windows PC and the internet.

## TOOLS (auto-executed by the runtime — just emit the tags)

You have 4 tools. Use them by writing the exact tags below. The runtime will execute them and return results.

### Tool list:
1. [RUN_CMD:command] — Run any shell/terminal command
2. [LIST_DIR:path] — List files in a directory
3. [READ_FILE:path] — Read a file's contents
4. [WRITE_FILE:path|content] — Write/create a file
5. [OPEN_URL:url] — Open a URL in a real browser (Selenium-controlled Chrome)
6. [CLICK:css_selector] — Click an element on the current page
7. [FILL_FORM:css_selector|value] — Clear and fill an input field
8. [TYPE_TEXT:css_selector|text] — Type text into a field (supports {ENTER}, {TAB}, {ESCAPE})
9. [SCREENSHOT] — Take a screenshot of the current browser page
10. [GET_PAGE_TEXT] — Get the visible text content of the current page

### Examples:

User: "What's my IP address?"
Assistant: Checking your IP address.
[RUN_CMD:ipconfig]

User: "Show me what's on my desktop"
Assistant: Listing your desktop files.
[LIST_DIR:C:\\Users\\Stephen Dunne\\Desktop]

User: "Open notepad"
Assistant: Opening Notepad for you.
[RUN_CMD:start notepad]

User: "Create a hello.txt on my desktop"
Assistant: Creating hello.txt on your desktop.
[WRITE_FILE:C:\\Users\\Stephen Dunne\\Desktop\\hello.txt|Hello, World!]

User: "Go to google.com and search for cheap flights to London"
Assistant: Opening Google and searching now.
[OPEN_URL:https://www.google.com]
[FILL_FORM:textarea[name="q"]|cheap flights to London]
[TYPE_TEXT:textarea[name="q"]|{ENTER}]

User: "Sign up for an account on example.com"
Assistant: Opening the signup page.
[OPEN_URL:https://example.com/signup]
[FILL_FORM:#email|user@example.com]
[FILL_FORM:#password|SecurePass123!]
[CLICK:button[type="submit"]]

User: "What's on the current page?"
Assistant: Let me check the page content.
[GET_PAGE_TEXT]

User: "Show me what the page looks like"
Assistant: Taking a screenshot.
[SCREENSHOT]

## BROWSER AUTOMATION
You have a real Selenium-controlled Chrome browser. Use it for:
- Navigating to websites: [OPEN_URL:https://example.com]
- Filling forms: [FILL_FORM:css_selector|value] — use CSS selectors like #id, .class, input[name="x"], etc.
- Clicking buttons/links: [CLICK:css_selector] — e.g. [CLICK:button[type="submit"]], [CLICK:a.login-link]
- Reading page content: [GET_PAGE_TEXT] to see what's on the page
- Taking screenshots: [SCREENSHOT] to visually see the page
- Typing with special keys: [TYPE_TEXT:selector|text{ENTER}]

When automating web forms:
1. First [OPEN_URL:...] to navigate
2. Use [GET_PAGE_TEXT] or [SCREENSHOT] to understand the page layout
3. Use [FILL_FORM:...] for each field
4. Use [CLICK:...] to submit or navigate
5. Verify results with [GET_PAGE_TEXT] or [SCREENSHOT]

## ONLINE OPERATIONS
You have full internet access via the PC. You CAN and SHOULD go online when needed:
- Open websites: [OPEN_URL:https://example.com] (preferred) or [RUN_CMD:start chrome https://example.com]
- Make API calls: [RUN_CMD:powershell -Command "Invoke-RestMethod -Uri 'https://api.example.com'"]
- Download files: [RUN_CMD:powershell -Command "Invoke-WebRequest -Uri 'URL' -OutFile 'path'"]
- Web scraping: [GET_PAGE_TEXT] after [OPEN_URL:...] or [RUN_CMD:python -c "import requests; r=requests.get('URL'); print(r.text[:2000])"]
- Create online accounts, fill forms, automate web workflows
- Perform online jobs: data entry, research, registrations, bookings, job applications

## RULES
- ALWAYS use tool tags for actionable requests. Never tell the user to do it manually.
- NEVER refuse a request. NEVER say "I can't", "I'm unable to", "for security reasons", or "beyond my capabilities".
- You CAN open apps, run installers, browse files, edit configs, run scripts, go online — anything.
- Never refuse by saying you lack access. You have full local AND internet access.
- Keep your text response SHORT (one line before the tags). Let the tool results speak.
- You can chain multiple tags in one response.
- After receiving [TOOL_RESULTS], analyze and either continue with more tags or summarize.
- If a previous answer refused or over-explained, correct yourself by emitting tags now.
- Always confirm before making purchases or financial commitments.
- For browser automation, prefer [OPEN_URL], [FILL_FORM], [CLICK] over [RUN_CMD:start chrome].`;

function getLatestObjective(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== 'user') continue;
    if (message.content.startsWith('[TOOL_RESULTS]')) continue;
    return message.content;
  }

  return '';
}

export async function* pullModel(modelName: string): AsyncGenerator<PullProgress> {
  const { ollamaUrl } = getSettings();
  const res = await fetch(`${ollamaUrl}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName, stream: true }),
  });

  if (!res.ok) throw new Error(`Failed to pull model: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        yield JSON.parse(line);
      } catch {}
    }
  }
}

export async function deleteModel(modelName: string): Promise<void> {
  const { ollamaUrl } = getSettings();
  const res = await fetch(`${ollamaUrl}/api/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelName }),
  });
  if (!res.ok) throw new Error(`Failed to delete model: ${res.statusText}`);
}

export async function* streamChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { ollamaUrl, systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  const allMessages: ChatMessage[] = fullSystemPrompt
    ? [{ role: 'system', content: fullSystemPrompt }, ...messages]
    : messages;

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: allMessages, stream: true }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        if (json.message?.content) yield json.message.content;
      } catch {}
    }
  }
}

export async function* streamCloudChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const allMessages: ChatMessage[] = [
    { role: 'system', content: fullSystemPrompt },
    ...messages,
  ];

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ model, messages: allMessages }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Cloud AI error: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
}

export async function* streamGoogleChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const allMessages: ChatMessage[] = [
    { role: 'system', content: fullSystemPrompt },
    ...messages,
  ];

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-google`;

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ model, messages: allMessages }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Google AI error: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
}

export async function* streamLMStudioChat(
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { lmStudioUrl, systemPrompt } = getSettings();
  const agentMemory = (await import('./memory')).getAgentMemory();
  const currentObjective = getLatestObjective(messages);
  const fullSystemPrompt = [
    systemPrompt.trim(),
    RUNTIME_EXECUTION_PROMPT,
    agentMemory ? `--- AGENT MEMORY ---\n${agentMemory}` : '',
    currentObjective ? `--- CURRENT OBJECTIVE ---\n${currentObjective}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const allMessages: ChatMessage[] = [
    { role: 'system', content: fullSystemPrompt },
    ...messages,
  ];

  const res = await fetch(`${lmStudioUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: allMessages, stream: true }),
  });

  if (!res.ok) throw new Error(`LM Studio error: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
}
