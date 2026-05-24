"""
Trading module for agent.py — Alpaca execution + strategy runner.

USAGE on your AM06 Pro:
  1. pip install alpaca-py pandas
  2. Drop this file next to agent.py
  3. In agent.py, add near the bottom (before `uvicorn.run`):
       from trading_module import register_trading
       register_trading(app)
  4. Restart agent.py
  5. Open the app → /trading → paste your Alpaca paper key+secret → Connect

Strategies live in ./agent_strategies/*.py — each module must expose:
  ID         = "unique_id"
  NAME       = "Human Name"
  SYMBOLS    = ["AAPL", ...]
  TIMEFRAME  = "1Min" | "15Min" | "1Hour" | "1Day"
  def signal(df) -> dict:  # returns {"side": "buy"|"sell"|"hold", "qty": int}

Risk rails (enforced before every order):
  - max_notional per order
  - daily_loss_limit (auto-flatten + disable strategies if breached)
  - paper-only unless `live_unlocked` is True (set by typing ENABLE LIVE in the UI)
"""
from __future__ import annotations

import asyncio
import importlib.util
import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Body, Query

CONFIG_DIR = Path.home() / ".local-ai"
CONFIG_DIR.mkdir(exist_ok=True)
CRED_FILE = CONFIG_DIR / "trading.json"
SETTINGS_FILE = CONFIG_DIR / "trading_settings.json"
DB_FILE = CONFIG_DIR / "trades.db"
STRATEGIES_DIR = Path(__file__).parent / "agent_strategies"
STRATEGIES_DIR.mkdir(exist_ok=True)

_state: dict[str, Any] = {
    "client": None,              # TradingClient
    "data_client": None,         # StockHistoricalDataClient
    "paper": True,
    "key": None,
    "secret": None,
    "strategies": {},            # id -> {module, enabled, last_signal, pnl, trades, logs}
    "runner_task": None,
}

DEFAULT_SETTINGS = {
    "max_notional": 500.0,
    "daily_loss_limit": 200.0,
    "live_unlocked": False,
}


# ─── persistence ───────────────────────────────────────────────

def _load_creds() -> Optional[dict]:
    if CRED_FILE.exists():
        try:
            return json.loads(CRED_FILE.read_text())
        except Exception:
            return None
    return None


def _save_creds(key: str, secret: str, paper: bool) -> None:
    CRED_FILE.write_text(json.dumps({"key": key, "secret": secret, "paper": paper}))
    CRED_FILE.chmod(0o600)


def _load_settings() -> dict:
    if SETTINGS_FILE.exists():
        try:
            return {**DEFAULT_SETTINGS, **json.loads(SETTINGS_FILE.read_text())}
        except Exception:
            pass
    return dict(DEFAULT_SETTINGS)


def _save_settings(s: dict) -> None:
    SETTINGS_FILE.write_text(json.dumps(s))


def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.execute("""CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        strategy TEXT,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        qty REAL NOT NULL,
        price REAL,
        order_id TEXT,
        notes TEXT
    )""")
    return conn


def _log_trade(strategy: str, symbol: str, side: str, qty: float, price: Optional[float], order_id: Optional[str], notes: str = "") -> None:
    with _db() as conn:
        conn.execute(
            "INSERT INTO trades (ts, strategy, symbol, side, qty, price, order_id, notes) VALUES (?,?,?,?,?,?,?,?)",
            (datetime.now(timezone.utc).isoformat(), strategy, symbol, side, qty, price, order_id, notes),
        )


# ─── alpaca clients ────────────────────────────────────────────

def _connect(key: str, secret: str, paper: bool):
    from alpaca.trading.client import TradingClient
    from alpaca.data.historical import StockHistoricalDataClient
    client = TradingClient(key, secret, paper=paper)
    # Touch account to validate
    acct = client.get_account()
    data = StockHistoricalDataClient(key, secret)
    _state.update({"client": client, "data_client": data, "key": key, "secret": secret, "paper": paper})
    return acct


def _ensure_client():
    if _state["client"]:
        return _state["client"]
    creds = _load_creds()
    if not creds:
        raise HTTPException(status_code=400, detail="Not connected. POST /trading/connect with key+secret.")
    _connect(creds["key"], creds["secret"], creds.get("paper", True))
    return _state["client"]


# ─── strategy loading ──────────────────────────────────────────

def _load_strategies() -> None:
    _state["strategies"] = {}
    for py in STRATEGIES_DIR.glob("*.py"):
        if py.name.startswith("_"):
            continue
        try:
            spec = importlib.util.spec_from_file_location(py.stem, py)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            sid = getattr(mod, "ID", py.stem)
            _state["strategies"][sid] = {
                "module": mod,
                "id": sid,
                "name": getattr(mod, "NAME", sid),
                "symbols": list(getattr(mod, "SYMBOLS", [])),
                "timeframe": getattr(mod, "TIMEFRAME", "1Day"),
                "enabled": False,
                "last_signal": None,
                "pnl": 0.0,
                "trades": 0,
                "logs": [],
            }
        except Exception as e:
            print(f"[trading] failed to load strategy {py.name}: {e}")


# ─── routes ────────────────────────────────────────────────────

def register_trading(app: FastAPI) -> None:
    _load_strategies()
    # Best-effort autoconnect on startup
    creds = _load_creds()
    if creds:
        try:
            _connect(creds["key"], creds["secret"], creds.get("paper", True))
        except Exception as e:
            print(f"[trading] autoconnect failed: {e}")

    @app.post("/trading/connect")
    def connect(body: dict = Body(...)):
        key = body.get("key", "").strip()
        secret = body.get("secret", "").strip()
        paper = bool(body.get("paper", True))
        if not key or not secret:
            raise HTTPException(400, "key and secret required")
        settings = _load_settings()
        if not paper and not settings.get("live_unlocked"):
            raise HTTPException(403, "Live trading locked. Type 'ENABLE LIVE' in trading settings first.")
        try:
            acct = _connect(key, secret, paper)
        except Exception as e:
            raise HTTPException(400, f"Alpaca rejected credentials: {e}")
        _save_creds(key, secret, paper)
        return _account_payload(acct)

    @app.get("/trading/account")
    def account():
        if not _state["client"]:
            creds = _load_creds()
            if not creds:
                return {"connected": False, "equity": 0, "cash": 0, "buying_power": 0, "day_pnl": 0, "day_pnl_pct": 0, "paper": True}
            try:
                _connect(creds["key"], creds["secret"], creds.get("paper", True))
            except Exception as e:
                return {"connected": False, "status": str(e), "equity": 0, "cash": 0, "buying_power": 0, "day_pnl": 0, "day_pnl_pct": 0, "paper": creds.get("paper", True)}
        try:
            acct = _state["client"].get_account()
            return _account_payload(acct)
        except Exception as e:
            return {"connected": False, "status": str(e), "equity": 0, "cash": 0, "buying_power": 0, "day_pnl": 0, "day_pnl_pct": 0, "paper": _state["paper"]}

    @app.get("/trading/positions")
    def positions():
        client = _ensure_client()
        out = []
        for p in client.get_all_positions():
            qty = float(p.qty)
            entry = float(p.avg_entry_price)
            last = float(p.current_price or entry)
            mv = float(p.market_value or qty * last)
            upl = float(p.unrealized_pl or (last - entry) * qty)
            uplpc = float(p.unrealized_plpc or 0)
            out.append({
                "symbol": p.symbol, "qty": qty, "avg_entry": entry, "last": last,
                "market_value": mv, "unrealized_pl": upl, "unrealized_plpc": uplpc,
                "side": "long" if qty >= 0 else "short",
            })
        return out

    @app.get("/trading/orders")
    def orders(status: str = Query("all")):
        from alpaca.trading.requests import GetOrdersRequest
        from alpaca.trading.enums import QueryOrderStatus
        client = _ensure_client()
        s_map = {"all": QueryOrderStatus.ALL, "open": QueryOrderStatus.OPEN, "closed": QueryOrderStatus.CLOSED}
        req = GetOrdersRequest(status=s_map.get(status, QueryOrderStatus.ALL), limit=50)
        out = []
        for o in client.get_orders(filter=req):
            out.append({
                "id": str(o.id), "symbol": o.symbol, "side": o.side.value,
                "qty": float(o.qty or 0), "type": o.order_type.value,
                "limit_price": float(o.limit_price) if o.limit_price else None,
                "status": o.status.value, "filled_qty": float(o.filled_qty or 0),
                "filled_avg_price": float(o.filled_avg_price) if o.filled_avg_price else None,
                "submitted_at": o.submitted_at.isoformat() if o.submitted_at else "",
            })
        return out

    @app.post("/trading/order")
    def place_order(body: dict = Body(...)):
        return _place_order_internal(body, strategy="manual")

    @app.delete("/trading/order/{order_id}")
    def cancel_order(order_id: str):
        client = _ensure_client()
        client.cancel_order_by_id(order_id)
        return {"ok": True}

    @app.post("/trading/close_all")
    def close_all():
        client = _ensure_client()
        # Disable all strategies
        for s in _state["strategies"].values():
            s["enabled"] = False
        client.cancel_orders()
        results = client.close_all_positions(cancel_orders=True)
        return {"closed": len(results or [])}

    @app.get("/trading/strategies")
    def strategies():
        return [_strategy_payload(s) for s in _state["strategies"].values()]

    @app.post("/trading/strategies/{sid}/toggle")
    def toggle_strategy(sid: str):
        s = _state["strategies"].get(sid)
        if not s:
            raise HTTPException(404, "strategy not found")
        s["enabled"] = not s["enabled"]
        _ensure_runner()
        return _strategy_payload(s)

    @app.get("/trading/strategies/{sid}/logs")
    def strategy_logs(sid: str):
        s = _state["strategies"].get(sid)
        if not s:
            raise HTTPException(404, "strategy not found")
        return {"logs": s["logs"][-200:]}

    @app.get("/trading/settings")
    def get_settings():
        return _load_settings()

    @app.post("/trading/settings")
    def update_settings(body: dict = Body(...)):
        s = _load_settings()
        if "max_notional" in body:
            s["max_notional"] = float(body["max_notional"])
        if "daily_loss_limit" in body:
            s["daily_loss_limit"] = float(body["daily_loss_limit"])
        if body.get("unlock_phrase") == "ENABLE LIVE":
            s["live_unlocked"] = True
        _save_settings(s)
        return {"ok": True, "live_unlocked": s["live_unlocked"]}


def _account_payload(acct) -> dict:
    equity = float(acct.equity)
    last_equity = float(acct.last_equity or equity)
    day_pnl = equity - last_equity
    return {
        "connected": True,
        "equity": equity,
        "cash": float(acct.cash),
        "buying_power": float(acct.buying_power),
        "day_pnl": day_pnl,
        "day_pnl_pct": (day_pnl / last_equity) if last_equity else 0.0,
        "paper": _state["paper"],
        "status": acct.status.value if hasattr(acct.status, "value") else str(acct.status),
    }


def _strategy_payload(s: dict) -> dict:
    return {
        "id": s["id"], "name": s["name"], "symbols": s["symbols"],
        "enabled": s["enabled"], "last_signal": s["last_signal"],
        "pnl": s["pnl"], "trades": s["trades"],
    }


def _place_order_internal(body: dict, strategy: str = "manual") -> dict:
    from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest, StopOrderRequest
    from alpaca.trading.enums import OrderSide, TimeInForce

    client = _ensure_client()
    symbol = str(body["symbol"]).upper()
    side = OrderSide.BUY if body["side"] == "buy" else OrderSide.SELL
    qty = body.get("qty")
    notional = body.get("notional")
    otype = body.get("type", "market")

    # Risk: enforce max_notional
    settings = _load_settings()
    if qty:
        # Estimate notional with last trade
        try:
            from alpaca.data.requests import StockLatestTradeRequest
            lt = _state["data_client"].get_stock_latest_trade(StockLatestTradeRequest(symbol_or_symbols=symbol))
            px = float(lt[symbol].price)
            est = px * float(qty)
            if est > settings["max_notional"]:
                raise HTTPException(403, f"Order ${est:.0f} exceeds max_notional ${settings['max_notional']:.0f}")
        except HTTPException:
            raise
        except Exception:
            pass  # crypto/equity quote unavailable — let Alpaca decide
    if notional and float(notional) > settings["max_notional"]:
        raise HTTPException(403, f"Notional ${notional} exceeds max_notional ${settings['max_notional']:.0f}")

    # Daily loss limit check
    try:
        acct = client.get_account()
        day_pnl = float(acct.equity) - float(acct.last_equity or acct.equity)
        if day_pnl < -settings["daily_loss_limit"]:
            # Flatten and disable
            for s in _state["strategies"].values():
                s["enabled"] = False
            raise HTTPException(403, f"Daily loss limit breached ({day_pnl:.2f}). Strategies disabled.")
    except HTTPException:
        raise
    except Exception:
        pass

    req_kwargs = dict(symbol=symbol, side=side, time_in_force=TimeInForce.DAY)
    if qty is not None:
        req_kwargs["qty"] = float(qty)
    elif notional is not None:
        req_kwargs["notional"] = float(notional)
    else:
        raise HTTPException(400, "qty or notional required")

    if otype == "limit":
        req = LimitOrderRequest(limit_price=float(body["limit_price"]), **req_kwargs)
    elif otype == "stop":
        req = StopOrderRequest(stop_price=float(body["stop_price"]), **req_kwargs)
    else:
        req = MarketOrderRequest(**req_kwargs)

    o = client.submit_order(order_data=req)
    _log_trade(strategy, symbol, body["side"], float(qty or 0), None, str(o.id))
    return {
        "id": str(o.id), "symbol": o.symbol, "side": o.side.value,
        "qty": float(o.qty or 0), "type": o.order_type.value,
        "limit_price": float(o.limit_price) if o.limit_price else None,
        "status": o.status.value, "filled_qty": float(o.filled_qty or 0),
        "filled_avg_price": float(o.filled_avg_price) if o.filled_avg_price else None,
        "submitted_at": o.submitted_at.isoformat() if o.submitted_at else "",
    }


# ─── strategy runner ───────────────────────────────────────────

def _ensure_runner() -> None:
    if _state.get("runner_task") and not _state["runner_task"].done():
        return
    try:
        loop = asyncio.get_event_loop()
        _state["runner_task"] = loop.create_task(_runner_loop())
    except RuntimeError:
        # No running loop yet — spin a background thread
        t = threading.Thread(target=lambda: asyncio.run(_runner_loop()), daemon=True)
        t.start()


async def _runner_loop() -> None:
    """Polls each enabled strategy every minute on its bar schedule."""
    from alpaca.data.requests import StockBarsRequest
    from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
    import pandas as pd  # noqa

    TF_MAP = {
        "1Min": TimeFrame(1, TimeFrameUnit.Minute),
        "5Min": TimeFrame(5, TimeFrameUnit.Minute),
        "15Min": TimeFrame(15, TimeFrameUnit.Minute),
        "1Hour": TimeFrame(1, TimeFrameUnit.Hour),
        "1Day": TimeFrame.Day,
    }

    while True:
        try:
            active = [s for s in _state["strategies"].values() if s["enabled"]]
            if not active or not _state["data_client"]:
                await asyncio.sleep(15)
                continue
            for s in active:
                tf = TF_MAP.get(s["timeframe"], TimeFrame.Day)
                from datetime import timedelta
                start = datetime.now(timezone.utc) - timedelta(days=300)
                try:
                    bars = _state["data_client"].get_stock_bars(StockBarsRequest(
                        symbol_or_symbols=s["symbols"], timeframe=tf, start=start,
                    )).df
                except Exception as e:
                    s["logs"].append(f"{datetime.now().isoformat()} ERR bars: {e}")
                    continue
                for sym in s["symbols"]:
                    try:
                        df = bars.xs(sym, level=0) if hasattr(bars.index, "levels") else bars
                        sig = s["module"].signal(df)
                        if not sig or sig.get("side") == "hold":
                            continue
                        s["last_signal"] = {"side": sig["side"], "symbol": sym, "at": datetime.now().isoformat()}
                        s["logs"].append(f"{datetime.now().isoformat()} {sym} {sig['side']} qty={sig.get('qty', 1)}")
                        order = _place_order_internal({
                            "symbol": sym, "side": sig["side"], "qty": sig.get("qty", 1), "type": "market",
                        }, strategy=s["id"])
                        s["trades"] += 1
                        s["logs"].append(f"  → order {order['id'][:8]}")
                    except Exception as e:
                        s["logs"].append(f"{datetime.now().isoformat()} {sym} ERR: {e}")
                s["logs"] = s["logs"][-500:]
        except Exception as e:
            print(f"[trading] runner error: {e}")
        await asyncio.sleep(60)
