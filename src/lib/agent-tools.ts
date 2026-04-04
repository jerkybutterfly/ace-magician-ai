import { listFiles, readFile, writeFile, runCommand } from './agent';

export interface ToolResult {
  tag: string;
  result: string;
}

const TOOL_PATTERNS = [
  { regex: /\[LIST_DIR:(.*?)\]/g, handler: handleListDir },
  { regex: /\[READ_FILE:(.*?)\]/g, handler: handleReadFile },
  { regex: /\[WRITE_FILE:(.*?)\|([\s\S]*?)\]/g, handler: handleWriteFile },
  { regex: /\[RUN_CMD:(.*?)\]/g, handler: handleRunCmd },
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
    // Reset regex lastIndex
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
