import { listFiles, readFile, writeFile, runCommand, browserNavigate, browserClick, browserFill, browserType, browserScreenshot, browserGetText } from './agent';

export interface ToolResult {
  tag: string;
  result: string;
}

const TOOL_PATTERNS = [
  { regex: /\[LIST_DIR:(.*?)\]/g, handler: handleListDir },
  { regex: /\[READ_FILE:(.*?)\]/g, handler: handleReadFile },
  { regex: /\[WRITE_FILE:(.*?)\|([\s\S]*?)\]/g, handler: handleWriteFile },
  { regex: /\[RUN_CMD:(.*?)\]/g, handler: handleRunCmd },
  { regex: /\[OPEN_URL:(.*?)\]/g, handler: handleOpenUrl },
  { regex: /\[CLICK:(.*?)\]/g, handler: handleClick },
  { regex: /\[FILL_FORM:(.*?)\|(.*?)\]/g, handler: handleFillForm },
  { regex: /\[TYPE_TEXT:(.*?)\|(.*?)\]/g, handler: handleTypeText },
  { regex: /\[SCREENSHOT\]/g, handler: handleScreenshot },
  { regex: /\[GET_PAGE_TEXT\]/g, handler: handleGetPageText },
];

async function handleListDir(match: RegExpMatchArray): Promise<ToolResult> {
  const path = match[1].trim();
  try {
    const files = await listFiles(path);
    const listing = files
      .map(f => `${f.is_dir ? '📁' : '📄'} ${f.name}${f.is_dir ? '/' : ` (${(f.size / 1024).toFixed(1)}KB)`}`)
      .join('\n');
    return { tag: match[0], result: `\n📂 Contents of \`${path}\`:\n\`\`\`\n${listing || '(empty directory)'}\n\`\`\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to list \`${path}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleReadFile(match: RegExpMatchArray): Promise<ToolResult> {
  const path = match[1].trim();
  try {
    const content = await readFile(path);
    const ext = path.split('.').pop() || '';
    return { tag: match[0], result: `\n📄 Contents of \`${path}\`:\n\`\`\`${ext}\n${content}\n\`\`\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to read \`${path}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleWriteFile(match: RegExpMatchArray): Promise<ToolResult> {
  const path = match[1].trim();
  const content = match[2];
  try {
    await writeFile(path, content);
    return { tag: match[0], result: `\n✅ Successfully wrote to \`${path}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to write \`${path}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleRunCmd(match: RegExpMatchArray): Promise<ToolResult> {
  const cmd = match[1].trim();
  try {
    const result = await runCommand(cmd);
    const output = result.stdout || result.stderr || '(no output)';
    return { tag: match[0], result: `\n💻 Command: \`${cmd}\`\n\`\`\`\n${output.trim()}\n\`\`\`\n${result.returncode !== 0 ? `Exit code: ${result.returncode}` : ''}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to run \`${cmd}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleOpenUrl(match: RegExpMatchArray): Promise<ToolResult> {
  const url = match[1].trim();
  try {
    const result = await browserNavigate(url);
    return { tag: match[0], result: `\n🌐 Navigated to: **${result.title}** (${result.url})` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to open \`${url}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleClick(match: RegExpMatchArray): Promise<ToolResult> {
  const selector = match[1].trim();
  try {
    const result = await browserClick(selector);
    return { tag: match[0], result: `\n🖱️ Clicked \`${selector}\` — now on: **${result.title}** (${result.url})` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to click \`${selector}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleFillForm(match: RegExpMatchArray): Promise<ToolResult> {
  const selector = match[1].trim();
  const value = match[2].trim();
  try {
    await browserFill(selector, value);
    return { tag: match[0], result: `\n📝 Filled \`${selector}\` with "${value}"` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to fill \`${selector}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleTypeText(match: RegExpMatchArray): Promise<ToolResult> {
  const selector = match[1].trim();
  const text = match[2].trim();
  try {
    await browserType(selector, text);
    return { tag: match[0], result: `\n⌨️ Typed into \`${selector}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to type into \`${selector}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleScreenshot(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const result = await browserScreenshot();
    return { tag: _match[0], result: `\n📸 Screenshot of **${result.title}** (${result.url})\n\n![screenshot](data:image/png;base64,${result.image})` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to take screenshot: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleGetPageText(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const result = await browserGetText();
    const truncated = result.text.length > 3000 ? result.text.slice(0, 3000) + '\n...(truncated)' : result.text;
    return { tag: _match[0], result: `\n📃 Page text from **${result.title}** (${result.url}):\n\`\`\`\n${truncated}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to get page text: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

/**
 * Check if an AI response contains tool commands.
 */
export function hasToolCommands(text: string): boolean {
  return TOOL_PATTERNS.some(({ regex }) => {
    regex.lastIndex = 0;
    return regex.test(text);
  });
}

/**
 * Execute all tool commands in the AI response and return the processed text.
 */
export async function executeToolCommands(text: string): Promise<{ processed: string; executed: boolean }> {
  let processed = text;
  let executed = false;

  for (const { regex, handler } of TOOL_PATTERNS) {
    regex.lastIndex = 0;
    const matches = [...text.matchAll(new RegExp(regex.source, regex.flags))];
    
    for (const match of matches) {
      const result = await handler(match);
      processed = processed.replace(result.tag, result.result);
      executed = true;
    }
  }

  return { processed, executed };
}