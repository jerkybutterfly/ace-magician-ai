import { listFiles, readFile, writeFile, runCommand, browserNavigate, browserClick, browserFill, browserType, browserScreenshot, browserGetText, browserGetHtml, browserExecJS, browserWaitFor, updateMission, executeSkill, listSkills, listProcesses, killProcess, getClipboard, setClipboard, sendNotification, getNetworkInfo } from './agent';

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
  { regex: /\[GET_PAGE_HTML\]/g, handler: handleGetPageHtml },
  { regex: /\[JS_EXEC:(.*?)\]/g, handler: handleJSExec },
  { regex: /\[WAIT:(.*?)\]/g, handler: handleWait },
  { regex: /\[WAIT_FOR:(.*?)\]/g, handler: handleWaitFor },
  { regex: /\[UPDATE_MISSION:(.*?)\|(.*?)\|(.*?)\]/g, handler: handleUpdateMission },
  { regex: /\[CREATE_SKILL:(.*?)\|([\s\S]*?)\]/g, handler: handleCreateSkill },
  { regex: /\[RUN_SKILL:(.*?)\|(.*?)\]/g, handler: handleRunSkill },
  { regex: /\[LIST_PROCESSES\]/g, handler: handleListProcesses },
  { regex: /\[KILL_PROCESS:(\d+)\]/g, handler: handleKillProcess },
  { regex: /\[GET_CLIPBOARD\]/g, handler: handleGetClipboard },
  { regex: /\[SET_CLIPBOARD:([\s\S]*?)\]/g, handler: handleSetClipboard },
  { regex: /\[NOTIFY:(.*?)\|(.*?)\]/g, handler: handleNotify },
  { regex: /\[NET_INFO\]/g, handler: handleNetInfo },
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

async function handleGetPageHtml(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const result = await browserGetHtml();
    const truncated = result.html.length > 5000 ? result.html.slice(0, 5000) + '\n...(truncated)' : result.html;
    return { tag: _match[0], result: `\n🔍 Interactive elements on **${result.title}** (${result.url}):\n\`\`\`json\n${truncated}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to get page HTML: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleJSExec(match: RegExpMatchArray): Promise<ToolResult> {
  const code = match[1].trim();
  try {
    const result = await browserExecJS(code);
    return { tag: match[0], result: `\n📜 JS executed: ${result.result || '(no return value)'}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ JS execution failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleWait(match: RegExpMatchArray): Promise<ToolResult> {
  const seconds = Math.min(parseFloat(match[1].trim()) || 2, 30);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  return { tag: match[0], result: `\n⏳ Waited ${seconds}s` };
}

async function handleWaitFor(match: RegExpMatchArray): Promise<ToolResult> {
  const selector = match[1].trim();
  try {
    const result = await browserWaitFor(selector);
    if (result.found) {
      return { tag: match[0], result: `\n✅ Element found: \`${selector}\`` };
    }
    return { tag: match[0], result: `\n⏰ Timed out waiting for: \`${selector}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Wait failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleUpdateMission(match: RegExpMatchArray): Promise<ToolResult> {
  const goal = match[1].trim();
  const status = match[2].trim();
  const nextSteps = match[3].split(',').map(s => s.trim());
  try {
    await updateMission(goal, status, nextSteps);
    return { tag: match[0], result: `\n🎯 **Mission Updated**\nGoal: ${goal}\nStatus: ${status}\nNext Steps: ${nextSteps.join(', ')}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to update mission: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleCreateSkill(match: RegExpMatchArray): Promise<ToolResult> {
  const name = match[1].trim();
  const code = match[2];
  const path = `public/skills/${name}.py`;
  try {
    await writeFile(path, code);
    return { tag: match[0], result: `\n🛠️ **Skill Created**: \`${name}\`\nSaved to \`${path}\`. You can now use \`[RUN_SKILL:${name}|args]\`.` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to create skill \`${name}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleRunSkill(match: RegExpMatchArray): Promise<ToolResult> {
  const name = match[1].trim();
  const args = match[2].trim();
  try {
    const result = await executeSkill(name, args);
    const output = result.stdout || result.stderr || '(no output)';
    return { tag: match[0], result: `\n🚀 **Executed Skill**: \`${name} ${args}\`\n\`\`\`\n${output.trim()}\n\`\`\`\n${result.returncode !== 0 ? `Exit code: ${result.returncode}` : ''}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to run skill \`${name}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
}

async function handleListProcesses(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const procs = await listProcesses();
    const listing = procs.slice(0, 30).map(p => `PID ${p.pid} | ${p.name} | CPU ${p.cpu_percent}% | ${p.memory_mb}MB`).join('\n');
    return { tag: _match[0], result: `\n📋 **Running Processes (top 30):**\n\`\`\`\n${listing}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to list processes: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleKillProcess(match: RegExpMatchArray): Promise<ToolResult> {
  const pid = parseInt(match[1], 10);
  try {
    await killProcess(pid);
    return { tag: match[0], result: `\n🛑 Process ${pid} terminated.` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to kill PID ${pid}: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleGetClipboard(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const text = await getClipboard();
    return { tag: _match[0], result: `\n📋 **Clipboard:**\n\`\`\`\n${text}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to read clipboard: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleSetClipboard(match: RegExpMatchArray): Promise<ToolResult> {
  const text = match[1];
  try {
    await setClipboard(text);
    return { tag: match[0], result: `\n✅ Clipboard set.` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to set clipboard: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleNotify(match: RegExpMatchArray): Promise<ToolResult> {
  const title = match[1].trim();
  const message = match[2].trim();
  try {
    await sendNotification(title, message);
    return { tag: match[0], result: `\n🔔 Notification sent: "${title}"` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to send notification: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleNetInfo(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const info = await getNetworkInfo();
    const ifaces = info.interfaces.map(i => `${i.name}: ${i.ip} (${i.netmask})`).join('\n');
    const sent = (info.bytes_sent / 1048576).toFixed(1);
    const recv = (info.bytes_recv / 1048576).toFixed(1);
    return { tag: _match[0], result: `\n🌐 **Network Info** (${info.hostname})\n\`\`\`\n${ifaces}\n\nSent: ${sent}MB | Received: ${recv}MB\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to get network info: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
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
export async function executeToolCommands(
  text: string, 
  onStatus?: (status: string) => void
): Promise<{ processed: string; executed: boolean }> {
  let processed = text;
  let executed = false;

  for (const { regex, handler } of TOOL_PATTERNS) {
    regex.lastIndex = 0;
    const matches = [...text.matchAll(new RegExp(regex.source, regex.flags))];
    
    for (const match of matches) {
      const tag = match[0];
      const toolName = tag.split(':')[0].replace('[', '');
      
      if (onStatus) onStatus(`Running ${toolName}...`);
      
      const result = await handler(match);
      processed = processed.replace(tag, result.result);
      executed = true;
      
      if (onStatus) onStatus(`Finished ${toolName}`);
    }
  }

  return { processed, executed };
}