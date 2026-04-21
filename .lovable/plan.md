

## Goal
Give your local AI assistant the ability to fetch live data from the web (sports schedules, news, anything current) so it stops saying "I can't access external data."

## Why it's failing now
Your agent already has `browserNavigate` / `browserGetText` (Selenium) and `httpRequest` tools, but:
1. The model isn't reliably picking them for "live data" questions — no clear tool for "search the web."
2. Selenium is heavy and breaks on JS-heavy sports sites (ESPN, Sky Sports) without login.
3. There's no dedicated "web search" tool tag, so the model gives up.

## Solution: add a real web-search tool

Add two new agent tools the LLM can call, plus a system-prompt nudge so it actually uses them.

### 1. New backend endpoints in `public/agent.py`
- **`POST /web/search`** → DuckDuckGo HTML search (no API key needed). Returns top 5 `{title, url, snippet}`.
- **`POST /web/fetch`** → fetches a URL and returns clean readable text (strips nav/scripts using `trafilatura` or a simple BeautifulSoup fallback). Handles redirects, sets a real User-Agent.
- Optional fallback: if the user has set a `SERPAPI_KEY` or `BRAVE_SEARCH_KEY` env var, prefer that over DDG scraping for reliability.

Dependencies (one-time `pip install`): `beautifulsoup4`, `lxml`, `trafilatura` (already have `requests`).

### 2. New client wrappers in `src/lib/agent.ts`
- `webSearch(query: string)` → `WebSearchResult[]`
- `webFetch(url: string)` → `{ title, text, url }`

### 3. Two new tool tags in `src/lib/agent-tools.ts`
- `<web-search query="next Liverpool match" />`
- `<web-fetch url="https://..." />`

Both default to `allow` permission (read-only, safe).

### 4. System-prompt update in `src/lib/ollama-prompt.ts`
Add an explicit rule:
> When the user asks about anything time-sensitive (sports fixtures, news, prices, weather, "latest", "today", "this week"), you MUST call `<web-search>` first, then `<web-fetch>` on the most relevant result, then answer using that text. Never reply "I can't access live data" — use the tools.

### 5. Permissions page
Auto-register `web-search` and `web-fetch` with default `allow` so they don't prompt every time.

## Files touched
- `public/agent.py` — add `/web/search`, `/web/fetch`
- `src/lib/agent.ts` — add `webSearch`, `webFetch`
- `src/lib/agent-tools.ts` — register two new tool patterns + handlers
- `src/lib/ollama-prompt.ts` — add live-data instruction block
- `src/lib/permissions.ts` — add defaults for new tools
- `README.md` — note the new pip deps

## After it ships
1. Run once on your PC: `pip install beautifulsoup4 lxml trafilatura`
2. Restart `python public/agent.py`
3. Ask: *"When is Liverpool's next match?"* — the model will search, fetch, and answer with a source link.

## Optional upgrades (say the word)
- Swap DDG scraping for the **Firecrawl** connector (more reliable, handles JS sites, 500 free scrapes/month) — no PC deps needed.
- Add a **Perplexity** connector tool tag for one-shot grounded answers with citations.

