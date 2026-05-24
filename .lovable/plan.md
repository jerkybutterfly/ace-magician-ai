# Trading Module — Alpaca + Automated Strategies (Fincept as research layer)

Goal: trade stocks, ETFs, and crypto from your AM06 Pro using your Alpaca account, with fully automated strategies running locally. Fincept Terminal stays as the research/charts layer; this module is the *execution + automation* layer wired into your existing chat + agent.

## Why this shape

- Fincept Terminal itself has no live broker execution — it's research/data. Trying to bolt orders onto it via AGPL fork is overkill for solo use.
- Alpaca has the cleanest retail API (single key+secret, JSON REST + WebSocket, free paper account, stocks + crypto on one endpoint). You already have an account.
- Your existing Python agent at `localhost:8484` already runs commands and controls the PC — extend it with a `/trading` namespace instead of standing up a second service.
- Strategies run on the AM06, not in the browser, so they keep working when the UI is closed.

---

## What gets built

### 1. Backend — extend `agent.py` with a `/trading` namespace

New FastAPI endpoints on the existing agent:

```
POST   /trading/connect              save Alpaca key+secret, test, return account
GET    /trading/account              equity, buying power, day P&L, paper|live
GET    /trading/positions            open positions with live unrealized P&L
GET    /trading/orders?status=       order history
POST   /trading/order                place market/limit/stop order
DELETE /trading/order/{id}           cancel
POST   /trading/close_all            flatten everything
GET    /trading/bars?symbol=&tf=     OHLCV for chart drawer
GET    /trading/strategies           list registered strategies + status
POST   /trading/strategies/{id}/toggle
GET    /trading/strategies/{id}/logs
```

Uses `alpaca-py`. Key+secret stored in `~/.local-ai/trading.json` on the AM06 (never in browser, never in repo). A `paper: true|false` flag picks the Alpaca endpoint — defaults to paper.

### 2. Strategy runner (background task inside agent.py)

- Loads enabled strategies on startup
- Subscribes to Alpaca's WebSocket for each strategy's symbols
- On bar close, calls the strategy's `signal(df)` → returns `buy | sell | hold` + size
- Routes every order through the same `/trading/order` code path so risk checks apply once
- Logs every signal + fill to a local SQLite (`trades.db`) for the audit trail

Ships with **3 starter strategies** you can toggle on day one:

1. **SMA crossover** (50/200) — trend follower, daily bars, stocks/ETFs
2. **RSI mean-reversion** — buy <30, sell >70, 15-min bars, large caps
3. **Crypto breakout** — Donchian channel on BTC/ETH, 1-hour bars, 24/7

Each is a single file in `agent_strategies/`. Edit, drop back in, it auto-registers.

### 3. Fincept Terminal integration (lightweight)

- Sidebar launcher tile "Fincept Terminal" → chat sends `[RUN_CMD:FinceptTerminal.exe]` via your existing agent.
- A small "Send to Strategy" handoff: when Fincept research surfaces a ticker you like, paste it into the Quick Order panel or into chat as `"buy 10 AAPL"`.
- No AGPL entanglement — Fincept runs as a separate process you launch.

### 4. Frontend — new `/trading` page

Top to bottom:

- **Account header** — equity, day P&L, buying power, **paper/live badge (red if live)**
- **Quick order** — symbol search, buy/sell, market/limit, qty or $ notional, submit
- **Positions table** — symbol, qty, entry, last, unrealized P&L %, close button
- **Strategies grid** — card per strategy: status pill, last signal, all-time P&L, toggle switch, "view logs"
- **Recent orders** — last 20 with status badges
- **Chart drawer** — opens on row click, lightweight-charts candles with entry/exit markers

Uses your existing semantic tokens (green primary, dark theme). All buttons use the `SendToChatButton` pattern so any position, order, or strategy log can be piped into chat for the LLM to analyze.

### 5. Chat integration

Extend the chat command router (same pattern as your existing `[RUN_CMD:...]`) with trading verbs:

- `"buy 10 AAPL"` → `[TRADE:buy,AAPL,10,market]`
- `"what's my P&L"` → `[TRADE:account]`
- `"close all positions"` → `[TRADE:close_all]` (confirmation prompt if live)
- `"start sma on TSLA"` → `[TRADE:strategy_start,sma_crossover,TSLA]`
- `"analyze my AAPL position"` → fetches position + recent bars, feeds to Ollama

Results render as cards in the chat stream, not raw JSON.

### 6. Safety rails (non-negotiable before any live order)

- **Paper-only by default.** Switching to live requires typing `ENABLE LIVE` in Settings → Trading.
- **Per-order max notional** (default $500) — enforced server-side in agent.py before the order reaches Alpaca.
- **Daily loss limit** — if realized + unrealized day P&L breaches it, runner auto-disables all strategies and pushes a chat notification.
- **Kill switch** — big red button in the page header: cancels all open orders + flattens positions + disables all strategies.
- Every order logged to `trades.db` and surfaced in your existing `AuditLogPage`.

---

## Files to touch

```text
agent.py                                  extend with /trading namespace + runner
agent_strategies/sma_crossover.py         new
agent_strategies/rsi_revert.py            new
agent_strategies/crypto_breakout.py       new
src/pages/TradingPage.tsx                 new
src/lib/trading.ts                        new — agent client wrapper
src/lib/agent-tools.ts                    add TRADE: verb routing
src/components/trading/AccountHeader.tsx  new
src/components/trading/QuickOrder.tsx     new
src/components/trading/PositionsTable.tsx new
src/components/trading/StrategyCard.tsx   new
src/components/trading/OrdersTable.tsx    new
src/components/trading/KillSwitch.tsx     new
src/App.tsx                               add /trading route
src/components/AppSidebar.tsx             add Trading nav item (paper/live badge)
```

New npm dep: `lightweight-charts` (chart drawer).
New Python deps: `alpaca-py`, `pandas` (likely already installed).

---

## One-time setup you do

1. alpaca.markets → generate **paper** API key + secret (free, instant).
2. On AM06: `pip install alpaca-py pandas`, restart `agent.py`.
3. Open `/trading` → Settings → paste key/secret → Test → see $100k paper balance → done.
4. Toggle on `sma_crossover` for SPY, walk away. Watch logs in chat.

Going live later: generate a live key on Alpaca, fund the account, paste in Settings, type `ENABLE LIVE`.

---

## Phasing in this build

- **Phase 1:** Account header + positions + quick order + chat verbs (paper trading works end-to-end).
- **Phase 2:** Strategy runner + 3 starter strategies + audit log + kill switch.
- **Phase 3 (later):** Chart drawer, custom strategy upload UI, fill notifications to chat, Fincept launcher tile.

Phase 1 + 2 in this pass.
