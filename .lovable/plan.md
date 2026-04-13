

# Add OpenClaw-Inspired Tools and Features

Based on OpenClaw's feature set, here are the most impactful additions that align with your existing agent architecture.

## What We Will Add

### 1. Cron Jobs / Scheduled Tasks
A scheduler system so the AI can set up recurring tasks (e.g., "check crypto prices every hour", "backup files daily"). Adds a `/cron` endpoint to agent.py and a Cron Jobs UI panel in the sidebar.

### 2. Webhook Endpoint
A `/webhook` endpoint on agent.py that accepts external HTTP triggers and routes them to the AI. Useful for receiving notifications from services, GitHub events, etc.

### 3. Discord Bot Integration
Similar to the existing Telegram integration -- connect a Discord bot token in Settings so the AI can respond on Discord channels. Uses discord.py in agent.py.

### 4. Skills Management Page
A dedicated page to browse, view, edit, delete, and create skills with a code editor UI. Currently skills are only manageable via tool tags -- this adds a visual interface.

### 5. Process Manager Tool
New tool tags `[LIST_PROCESSES]` and `[KILL_PROCESS:pid]` so the AI can monitor and manage running processes on the PC, plus a "Processes" panel in the sidebar.

### 6. Clipboard Tool
New tool tags `[GET_CLIPBOARD]` and `[SET_CLIPBOARD:text]` for reading/writing the system clipboard.

### 7. Notification Tool
`[NOTIFY:title|message]` to show desktop notifications via the agent (using Windows toast notifications).

### 8. Network Info Tool
`[NET_INFO]` to get network interfaces, IP addresses, Wi-Fi info, and active connections.

---

## Technical Details

### Agent (public/agent.py) changes:
- Add cron scheduler using `sched` or `schedule` library with a background thread
- Add `/cron` CRUD endpoints (list, create, delete scheduled tasks)
- Add `/webhook` POST endpoint that queues messages for processing
- Add `/discord/connect`, `/discord/disconnect`, `/discord/status` endpoints using discord.py
- Add `/processes` GET endpoint (psutil process listing)
- Add `/processes/kill` POST endpoint
- Add `/clipboard/get`, `/clipboard/set` endpoints (using pyperclip)
- Add `/notify` POST endpoint (using win10toast or plyer)
- Add `/network` GET endpoint

### Frontend changes:
- **src/lib/agent.ts**: Add API functions for all new endpoints
- **src/lib/agent-tools.ts**: Add tool handlers for `LIST_PROCESSES`, `KILL_PROCESS`, `GET_CLIPBOARD`, `SET_CLIPBOARD`, `NOTIFY`, `NET_INFO`
- **src/lib/ollama.ts**: Update RUNTIME_EXECUTION_PROMPT with new tool documentation
- **src/pages/SkillsPage.tsx**: New page for skills management with code editor
- **src/pages/CronPage.tsx**: New page to view/create/delete cron jobs
- **src/components/AppSidebar.tsx**: Add nav links for Skills and Cron pages
- **src/pages/SettingsPage.tsx**: Add Discord bot configuration section
- **src/App.tsx**: Add routes for new pages

### New tool tags added to the prompt:
```
18. [LIST_PROCESSES] — List running processes with PID, name, CPU%, memory
19. [KILL_PROCESS:pid] — Kill a process by PID
20. [GET_CLIPBOARD] — Read current clipboard content
21. [SET_CLIPBOARD:text] — Copy text to clipboard
22. [NOTIFY:title|message] — Show a desktop notification
23. [NET_INFO] — Get network interfaces and IP addresses
```

