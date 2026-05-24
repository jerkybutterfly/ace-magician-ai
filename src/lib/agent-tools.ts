import { listFiles, readFile, writeFile, runCommand, browserNavigate, browserClick, browserFill, browserType, browserScreenshot, browserGetText, browserGetHtml, browserExecJS, browserWaitFor, updateMission, executeSkill, listSkills, listProcesses, killProcess, getClipboard, setClipboard, sendNotification, getNetworkInfo, httpRequest, downloadFile, searchFiles, zipFiles, unzipFile, systemPower, launchApp, textToSpeech, getDiskUsage, desktopScreenshot, getWifiNetworks, getInstalledPrograms, getEnvVars, setEnvVar, webSearch, webFetch } from './agent';
import { checkPermission, isSessionAllowed, sessionAllowOnce, allowForDuration, getToolName } from './permissions';
import { logEpisode, recordLesson, deriveLesson, type EpisodeOutcome } from './learning';

export interface ToolResult {
  tag: string;
  result: string;
}

export type PermissionDecision = 'approve' | 'approve-session' | 'approve-1h' | 'approve-pattern-1h' | 'deny';
export type PermissionPrompt = (info: { tag: string; tool: string; reason: string }) => Promise<PermissionDecision>;

/** Derive a glob pattern for the tool of this tag, e.g. "[RUN_CMD:ls]" → "[RUN_CMD:*]". */
function toolPatternFor(tag: string): string {
  const m = tag.match(/^\[([A-Z_]+):/);
  return m ? `[${m[1]}:*]` : tag;
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
  { regex: /\[HTTP_REQUEST:(GET|POST|PUT|DELETE|PATCH)\|(.*?)(?:\|([\s\S]*?))?\]/g, handler: handleHttpRequest },
  { regex: /\[DOWNLOAD:(.*?)\|(.*?)\]/g, handler: handleDownload },
  { regex: /\[SEARCH_FILES:(.*?)(?:\|(.*?))?\]/g, handler: handleSearchFiles },
  { regex: /\[ZIP:(.*?)\|(.*?)\]/g, handler: handleZip },
  { regex: /\[UNZIP:(.*?)(?:\|(.*?))?\]/g, handler: handleUnzip },
  { regex: /\[POWER:(shutdown|restart|sleep|lock|logoff)\]/g, handler: handlePower },
  { regex: /\[LAUNCH:(.*?)(?:\|(.*?))?\]/g, handler: handleLaunch },
  { regex: /\[SPEAK:(.*?)\]/g, handler: handleSpeak },
  { regex: /\[DISK_USAGE\]/g, handler: handleDiskUsage },
  { regex: /\[DESKTOP_SCREENSHOT\]/g, handler: handleDesktopScreenshot },
  { regex: /\[WIFI_SCAN\]/g, handler: handleWifiScan },
  { regex: /\[LIST_INSTALLED\]/g, handler: handleListInstalled },
  { regex: /\[GET_ENV\]/g, handler: handleGetEnv },
  { regex: /\[SET_ENV:(.*?)\|(.*?)\]/g, handler: handleSetEnv },
  { regex: /\[WEB_SEARCH:([\s\S]*?)\]/g, handler: handleWebSearch },
  { regex: /\[WEB_FETCH:(.*?)\]/g, handler: handleWebFetch },
  { regex: /\[NOTIFY:(.*?)\|([\s\S]*?)\]/g, handler: handleNotifyUser },
  { regex: /\[MQTT_PUBLISH:(.*?)\|([\s\S]*?)\]/g, handler: handleMqttPublish },
  { regex: /\[MQTT_SUBSCRIBE:(.*?)\]/g, handler: handleMqttSubscribe },
  { regex: /\[MQTT_RECENT:(.*?)\]/g, handler: handleMqttRecent },
  { regex: /\[SCAN_NETWORK\]/g, handler: handleScanNetwork },
  { regex: /\[RAG_QUERY:([\s\S]*?)\]/g, handler: handleRagQuery },
  { regex: /\[PHONE_[A-Z_]+(?::[\s\S]*?)?\]/g, handler: handlePhoneTag },
  { regex: /\[TRADE:([\s\S]*?)\]/g, handler: handleTrade },
];

async function handlePhoneTag(match: RegExpMatchArray): Promise<ToolResult> {
  const tag = match[0];
  try {
    const { isPhone, executePhoneTag } = await import('./phone');
    // Local execution path (chat is running on the phone)
    if (isPhone()) {
      const res = await executePhoneTag(tag);
      return { tag, result: `\n📱 ${res.output}` };
    }
    // Remote path: send to AM09 agent which dispatches to a paired phone
    const { getSettings } = await import('./settings');
    const { agentUrl } = getSettings();
    const r = await fetch(`${agentUrl}/phone/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, timeout_ms: 30000 }),
    });
    if (!r.ok) return { tag, result: `\n⚠️ Phone dispatch failed (${r.status}). Is a phone paired?` };
    const j = await r.json();
    return { tag, result: `\n📱 ${j.output ?? '(no output)'}` };
  } catch (e) {
    return { tag, result: `\n⚠️ Phone tag failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleMqttPublish(match: RegExpMatchArray): Promise<ToolResult> {
  const topic = match[1].trim();
  const payload = match[2].trim();
  try {
    const { mqttPublish } = await import('./mqtt');
    await mqttPublish(topic, payload);
    return { tag: match[0], result: `\n📡 MQTT → \`${topic}\`: \`${payload}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ MQTT publish failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleMqttSubscribe(match: RegExpMatchArray): Promise<ToolResult> {
  const topic = match[1].trim();
  try {
    const { mqttSubscribe } = await import('./mqtt');
    await mqttSubscribe(topic);
    return { tag: match[0], result: `\n📡 Subscribed to \`${topic}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ MQTT subscribe failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleMqttRecent(match: RegExpMatchArray): Promise<ToolResult> {
  const filter = match[1].trim();
  try {
    const { getMqttMessages } = await import('./mqtt');
    const { messages } = await getMqttMessages(0);
    const matched = messages.filter(m => !filter || m.topic.includes(filter)).slice(-20);
    if (!matched.length) return { tag: match[0], result: `\n📡 No recent MQTT messages for \`${filter || '*'}\`` };
    const list = matched.map(m => `- \`${m.topic}\`: ${m.payload}`).join('\n');
    return { tag: match[0], result: `\n📡 **Recent MQTT** (\`${filter || '*'}\`):\n${list}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ MQTT read failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleScanNetwork(match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const { startNetworkScan, getScanStatus } = await import('./network');
    const { scan_id } = await startNetworkScan();
    // Poll until done (max 60s)
    let status;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 1500));
      status = await getScanStatus(scan_id);
      if (status.status !== 'running') break;
    }
    if (!status || status.status === 'running') {
      return { tag: match[0], result: `\n🌐 Network scan still running — check the Network page.` };
    }
    if (status.status === 'error') {
      return { tag: match[0], result: `\n⚠️ Scan failed: ${status.error || 'unknown'}` };
    }
    const lines = status.devices
      .map(d => `- ${d.ip} | ${d.hostname || '—'} | ${d.mac || '—'} | ${d.vendor || 'Unknown'}`)
      .join('\n');
    return { tag: match[0], result: `\n🌐 **${status.devices.length} devices on LAN:**\n${lines}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Network scan failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleRagQuery(match: RegExpMatchArray): Promise<ToolResult> {
  const q = match[1].trim();
  try {
    const { ragQuery } = await import('./rag');
    const { chunks } = await ragQuery(q, 5);
    if (!chunks.length) return { tag: match[0], result: `\n📚 No matching document chunks for "${q}".` };
    const out = chunks.map((c, i) => `${i + 1}. **${c.path}** (score ${c.score.toFixed(3)})\n   > ${c.text.slice(0, 400).replace(/\n/g, ' ')}`).join('\n\n');
    return { tag: match[0], result: `\n📚 **RAG results for** "${q}":\n${out}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ RAG query failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleNotifyUser(match: RegExpMatchArray): Promise<ToolResult> {
  const title = match[1].trim();
  const body = match[2].trim();
  try {
    const { postAgentNotification } = await import('./agent');
    await postAgentNotification(title, body, 'self');
    return { tag: match[0], result: `\n🔔 Notification queued: **${title}** — ${body}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Notification failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

async function handleWebSearch(match: RegExpMatchArray): Promise<ToolResult> {
  const query = match[1].trim();
  try {
    const { results, provider } = await webSearch(query, 5);
    if (!results.length) {
      return { tag: match[0], result: `\n🔎 **Web search** "${query}" — no results.` };
    }
    const listing = results
      .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`)
      .join('\n\n');
    return { tag: match[0], result: `\n🔎 **Web search** "${query}" (via ${provider}):\n${listing}` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Web search failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleWebFetch(match: RegExpMatchArray): Promise<ToolResult> {
  const url = match[1].trim();
  try {
    const { title, text, url: finalUrl } = await webFetch(url);
    return { tag: match[0], result: `\n📄 **${title}**\n${finalUrl}\n\n\`\`\`\n${text}\n\`\`\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Web fetch failed for \`${url}\`: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

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

async function handleHttpRequest(match: RegExpMatchArray): Promise<ToolResult> {
  const method = match[1];
  const url = match[2].trim();
  const body = match[3]?.trim() || undefined;
  try {
    const result = await httpRequest(method, url, undefined, body);
    const bodyStr = typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2);
    const truncated = bodyStr.length > 3000 ? bodyStr.slice(0, 3000) + '\n...(truncated)' : bodyStr;
    return { tag: match[0], result: `\n🌐 **HTTP ${method}** ${url} → ${result.status_code}\n\`\`\`\n${truncated}\n\`\`\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ HTTP request failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleDownload(match: RegExpMatchArray): Promise<ToolResult> {
  const url = match[1].trim();
  const path = match[2].trim();
  try {
    const result = await downloadFile(url, path);
    return { tag: match[0], result: `\n⬇️ Downloaded to \`${result.path}\` (${(result.size / 1024).toFixed(1)}KB)` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Download failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleSearchFiles(match: RegExpMatchArray): Promise<ToolResult> {
  const pattern = match[1].trim();
  const path = match[2]?.trim() || '.';
  try {
    const results = await searchFiles(pattern, path);
    const listing = results.slice(0, 20).map(r => `${r.file}:${r.line}: ${r.text}`).join('\n');
    return { tag: match[0], result: `\n🔍 **Search "${pattern}"** (${results.length} matches)\n\`\`\`\n${listing || '(no matches)'}\n\`\`\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Search failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleZip(match: RegExpMatchArray): Promise<ToolResult> {
  const paths = match[1].trim().split(',').map(s => s.trim());
  const output = match[2].trim();
  try {
    const result = await zipFiles(paths, output);
    return { tag: match[0], result: `\n📦 Zipped to \`${result.output}\` (${(result.size / 1024).toFixed(1)}KB)` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Zip failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleUnzip(match: RegExpMatchArray): Promise<ToolResult> {
  const archive = match[1].trim();
  const dest = match[2]?.trim() || '.';
  try {
    const result = await unzipFile(archive, dest);
    return { tag: match[0], result: `\n📂 Extracted ${result.files.length} files to \`${result.destination}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Unzip failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handlePower(match: RegExpMatchArray): Promise<ToolResult> {
  const action = match[1].trim();
  try {
    await systemPower(action);
    return { tag: match[0], result: `\n⚡ System ${action} initiated.` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Power action failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleLaunch(match: RegExpMatchArray): Promise<ToolResult> {
  const app = match[1].trim();
  const args = match[2]?.trim();
  try {
    const result = await launchApp(app, args);
    return { tag: match[0], result: `\n🚀 Launched **${app}** (PID: ${result.pid})` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to launch ${app}: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleSpeak(match: RegExpMatchArray): Promise<ToolResult> {
  const text = match[1].trim();
  try {
    await textToSpeech(text);
    return { tag: match[0], result: `\n🔊 Speaking: "${text.slice(0, 60)}..."` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ TTS failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleDiskUsage(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const disks = await getDiskUsage();
    const listing = disks.map(d => `${d.device} (${d.mountpoint}) — ${d.used_gb}/${d.total_gb}GB (${d.percent}%)`).join('\n');
    return { tag: _match[0], result: `\n💾 **Disk Usage:**\n\`\`\`\n${listing}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to get disk usage: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleDesktopScreenshot(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const result = await desktopScreenshot();
    return { tag: _match[0], result: `\n🖥️ Desktop screenshot captured.\n\n![desktop](data:image/png;base64,${result.image})` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Desktop screenshot failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleWifiScan(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const result = await getWifiNetworks();
    return { tag: _match[0], result: `\n📶 **Wi-Fi Networks:**\n\`\`\`\n${result.output}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Wi-Fi scan failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleListInstalled(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const progs = await getInstalledPrograms();
    const listing = progs.slice(0, 50).map(p => `${p.DisplayName} (${p.DisplayVersion || 'n/a'})`).join('\n');
    return { tag: _match[0], result: `\n📦 **Installed Programs (${progs.length} total, showing 50):**\n\`\`\`\n${listing}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to list installed programs: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleGetEnv(_match: RegExpMatchArray): Promise<ToolResult> {
  try {
    const vars = await getEnvVars();
    const listing = vars.slice(0, 40).map(v => `${v.name}=${v.value}`).join('\n');
    return { tag: _match[0], result: `\n🔧 **Environment Variables (${vars.length} total):**\n\`\`\`\n${listing}\n\`\`\`` };
  } catch (e) {
    return { tag: _match[0], result: `\n⚠️ Failed to get env vars: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleSetEnv(match: RegExpMatchArray): Promise<ToolResult> {
  const name = match[1].trim();
  const value = match[2].trim();
  try {
    await setEnvVar(name, value);
    return { tag: match[0], result: `\n✅ Set env var \`${name}\`` };
  } catch (e) {
    return { tag: match[0], result: `\n⚠️ Failed to set env var: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function handleTrade(match: RegExpMatchArray): Promise<ToolResult> {
  const tag = match[0];
  const args = match[1].split(',').map(s => s.trim());
  const [verb, ...rest] = args;
  try {
    const { trading, fmtMoney, fmtPct } = await import('./trading');
    switch (verb.toLowerCase()) {
      case 'account': {
        const a = await trading.account();
        if (!a.connected) return { tag, result: `\n📉 Trading not connected. Open /trading to connect Alpaca.` };
        return { tag, result: `\n💹 **Account** (${a.paper ? 'PAPER' : 'LIVE'})\nEquity: ${fmtMoney(a.equity)}\nBuying power: ${fmtMoney(a.buying_power)}\nDay P&L: ${fmtMoney(a.day_pnl)} (${(a.day_pnl_pct * 100).toFixed(2)}%)` };
      }
      case 'positions': {
        const ps = await trading.positions();
        if (!ps.length) return { tag, result: `\n📭 No open positions.` };
        const list = ps.map(p => `- **${p.symbol}** ${p.qty} @ ${fmtMoney(p.avg_entry)} → ${fmtMoney(p.last)} (${fmtPct(p.unrealized_plpc)} / ${fmtMoney(p.unrealized_pl)})`).join('\n');
        return { tag, result: `\n📊 **Positions**\n${list}` };
      }
      case 'buy':
      case 'sell': {
        const [symbol, qtyStr, typeRaw, limitStr] = rest;
        if (!symbol || !qtyStr) return { tag, result: `\n⚠️ TRADE ${verb} needs symbol,qty (e.g. [TRADE:buy,AAPL,10,market])` };
        const type = (typeRaw?.toLowerCase() === 'limit' ? 'limit' : 'market') as 'limit' | 'market';
        const o = await trading.placeOrder({
          symbol: symbol.toUpperCase(),
          side: verb as 'buy' | 'sell',
          qty: Number(qtyStr),
          type,
          ...(type === 'limit' && limitStr ? { limit_price: Number(limitStr) } : {}),
        });
        return { tag, result: `\n✅ Order submitted: ${verb.toUpperCase()} ${o.qty} ${o.symbol} (${o.type}) — id ${o.id.slice(0, 8)}…` };
      }
      case 'close_all': {
        const { closed } = await trading.closeAll();
        return { tag, result: `\n🛑 Flattened ${closed} positions and disabled all strategies.` };
      }
      case 'strategy_start':
      case 'strategy_stop': {
        const [id] = rest;
        if (!id) return { tag, result: `\n⚠️ Need strategy id.` };
        const s = await trading.toggleStrategy(id);
        return { tag, result: `\n🤖 Strategy **${s.name}** is now ${s.enabled ? 'RUNNING' : 'STOPPED'}.` };
      }
      default:
        return { tag, result: `\n⚠️ Unknown TRADE verb \`${verb}\`. Try account, positions, buy, sell, close_all, strategy_start, strategy_stop.` };
    }
  } catch (e) {
    return { tag, result: `\n⚠️ Trade failed: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}




export function hasToolCommands(text: string): boolean {
  return TOOL_PATTERNS.some(({ regex }) => {
    regex.lastIndex = 0;
    return regex.test(text);
  });
}

/**
 * Execute all tool commands in the AI response, gated by the permissions system.
 * If a tag requires confirmation, `requestPermission` is called and the user's
 * decision determines whether it runs. Every outcome is logged as an episode,
 * and errors/denials are auto-reflected into lessons learned.
 */
export async function executeToolCommands(
  text: string,
  onStatus?: (status: string) => void,
  requestPermission?: PermissionPrompt,
  context?: { request?: string },
): Promise<{ processed: string; executed: boolean }> {
  let processed = text;
  let executed = false;
  const userRequest = context?.request ?? '';

  const record = async (
    tag: string,
    tool: string,
    outcome: EpisodeOutcome,
    summary: string,
  ) => {
    await logEpisode({ request: userRequest, tag, tool, outcome, summary });
    if (outcome !== 'success') {
      // Fire-and-forget Hermes-style LLM reflection
      import('./learning').then(({ llmReflectLesson }) => {
        llmReflectLesson(userRequest, tag, outcome, summary).catch(e => console.error('Reflection failed', e));
      });
    }
  };

  for (const { regex, handler } of TOOL_PATTERNS) {
    regex.lastIndex = 0;
    const matches = [...text.matchAll(new RegExp(regex.source, regex.flags))];

    for (const match of matches) {
      const tag = match[0];
      const toolName = getToolName(tag);

      // Permission check
      const { mode, reason } = checkPermission(tag);
      let allowed = mode === 'allow' || isSessionAllowed(tag);

      if (!allowed && mode === 'deny') {
        processed = processed.replace(tag, `\n🚫 **Blocked by permissions** — \`${tag}\` is denied (${reason}). Edit Permissions to change this.`);
        executed = true;
        await record(tag, toolName, 'blocked', reason || 'denied by permission rule');
        continue;
      }

      if (!allowed && mode === 'ask') {
        if (!requestPermission) {
          processed = processed.replace(tag, `\n⏸️ **Awaiting approval** — \`${tag}\` requires confirmation but no prompt handler is attached.`);
          executed = true;
          await record(tag, toolName, 'blocked', 'no prompt handler attached');
          continue;
        }
        if (onStatus) onStatus(`Awaiting approval for ${toolName}...`);
        const decision = await requestPermission({ tag, tool: toolName, reason });
        if (decision === 'deny') {
          processed = processed.replace(tag, `\n🚫 **Denied by user** — \`${tag}\` was not executed.`);
          executed = true;
          await record(tag, toolName, 'denied', 'user denied');
          continue;
        }
        if (decision === 'approve-session') sessionAllowOnce(tag);
        else if (decision === 'approve-1h') allowForDuration(tag, 60, 'approved for 1h from chat');
        else if (decision === 'approve-pattern-1h') allowForDuration(toolPatternFor(tag), 60, `1h allow for ${toolName}`);
        allowed = true;
      }


      if (!allowed) continue;

      if (onStatus) onStatus(`Running ${toolName}...`);
      try {
        const result = await handler(match);
        processed = processed.replace(tag, result.result);
        executed = true;
        const r = result.result || '';
        const looksLikeError = /^\s*\n?⚠️|\bfail|\berror\b|\bnot found\b|\bdenied\b/i.test(r);
        await record(tag, toolName, looksLikeError ? 'error' : 'success', r.slice(0, 400));
        if (onStatus) onStatus(`Finished ${toolName}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error';
        processed = processed.replace(tag, `\n⚠️ **Tool error** — \`${tag}\`: ${msg}`);
        executed = true;
        await record(tag, toolName, 'error', msg);
      }
    }
  }

  return { processed, executed };
}