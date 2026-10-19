"""
Polymarket Real-Time Copy Trader
Monitors @dangerously-skip-permissions (0xc53375ff94e96100f2b30a4b5775db35218d69a9)
and mirrors trades in real time (Paper mode by default, Live mode with private key).

Runs on port 8486.
"""
from __future__ import annotations
import argparse
import asyncio
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import json
import os
from pathlib import Path
import sqlite3
import threading
import time
from typing import Any, Dict, List, Optional
import requests

TARGET_WALLET = "0xc53375ff94e96100f2b30a4b5775db35218d69a9"
TARGET_NAME = "dangerously-skip-permissions"
DATA_API = "https://data-api.polymarket.com"
GAMMA_API = "https://gamma-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"

DB_DIR = Path.home() / ".aiapp"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "copytrader.db"

ap = argparse.ArgumentParser(description="Polymarket Copy Trader")
ap.add_argument("--wallet", default=TARGET_WALLET, help="Target wallet address")
ap.add_argument("--name", default=TARGET_NAME, help="Target trader handle")
ap.add_argument("--stake", type=float, default=10.0, help="USDC per copied trade (default $10)")
ap.add_argument("--min-price", type=float, default=0.45, help="Minimum conviction price (skips low win-rate lottery bets, default 0.45)")
ap.add_argument("--max-price", type=float, default=0.85, help="Maximum price per share to copy (default 0.85)")
ap.add_argument("--max-per-window", type=int, default=2, help="Max copied trades per 5m market window (default 2)")
ap.add_argument("--no-hedging", action="store_true", default=True, help="Disallow betting opposite side in same window")
ap.add_argument("--allow-hedging", dest="no_hedging", action="store_false", help="Allow copying both sides in same window")
ap.add_argument("--live", action="store_true", help="Execute real orders using PM_PRIVATE_KEY")
ap.add_argument("--key", default="", help="Your Polymarket Polygon private key")
ap.add_argument("--funder", default="", help="Your Polymarket funder / proxy address")
ap.add_argument("--port", type=int, default=8486, help="Status HTTP port")
ap.add_argument("--poll-interval", type=float, default=2.0, help="Seconds between poll checks")
args = ap.parse_args()

STATE = {
    "target_wallet": args.wallet,
    "target_name": args.name,
    "mode": "LIVE" if args.live else "PAPER",
    "running": True,
    "stake": args.stake,
    "min_price": args.min_price,
    "max_price": args.max_price,
    "max_per_window": args.max_per_window,
    "no_hedging": args.no_hedging,
    "poll_interval": args.poll_interval,
    "last_check_ts": 0,
    "total_copied": 0,
    "wins": 0,
    "losses": 0,
    "pnl": 0.0,
    "log": [],
    "recent_target_trades": [],
    "my_trades": [],
    "target_stats": {
        "pnl": 325984.43,
        "volume": 18861177.39,
        "total_trades": 25874,
        "win_rate": 50.0
    }
}

clob_client = None

def init_clob(pk: str, funder: str = None):
    global clob_client
    from py_clob_client.client import ClobClient
    from py_clob_client.clob_types import MarketOrderArgs, OrderType
    from py_clob_client.order_builder.constants import BUY
    clob_client = ClobClient(
        CLOB_API,
        key=pk,
        chain_id=137,
        signature_type=1 if funder else 0,
        funder=funder if funder else None
    )
    clob_client.set_api_creds(clob_client.create_or_derive_api_creds())
    log_msg("[INIT] Polymarket CLOB client initialized")
    return clob_client

if args.live:
    try:
        pk = args.key or os.environ.get("PM_PRIVATE_KEY")
        if not pk:
            print("ERROR: Private key must be provided via --key or PM_PRIVATE_KEY environment variable.")
            exit(1)
        funder = args.funder or os.environ.get("PM_FUNDER")
        init_clob(pk, funder)
        print("[INIT] Live trading enabled with Polymarket CLOB")
    except Exception as e:
        print(f"[INIT] Failed to initialize live trading client: {e}")
        exit(1)


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS seen_trades (
                tx_hash TEXT PRIMARY KEY,
                timestamp INTEGER,
                title TEXT,
                outcome TEXT,
                price REAL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS copied_trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                copied_at REAL,
                tx_hash TEXT,
                condition_id TEXT,
                slug TEXT,
                title TEXT,
                outcome TEXT,
                side TEXT,
                target_price REAL,
                my_price REAL,
                stake REAL,
                shares REAL,
                mode TEXT,
                status TEXT, -- PENDING, WON, LOST
                pnl REAL DEFAULT 0.0
            )
        """)
        conn.commit()


def log_msg(msg: str):
    t_str = time.strftime("%H:%M:%S")
    entry = f"[{t_str}] {msg}"
    STATE["log"].append(entry)
    if len(STATE["log"]) > 100:
        STATE["log"].pop(0)
    print(entry, flush=True)


def load_recent_from_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, copied_at, title, outcome, side, target_price, my_price, stake, shares, mode, status, pnl, slug, condition_id FROM copied_trades ORDER BY id DESC LIMIT 50")
        rows = cursor.fetchall()
        trades = []
        for r in rows:
            trade = {
                "id": r[0], "copied_at": r[1], "title": r[2], "outcome": r[3],
                "side": r[4], "target_price": r[5], "my_price": r[6], "stake": r[7],
                "shares": r[8], "mode": r[9], "status": r[10], "pnl": r[11],
                "slug": r[12], "condition_id": r[13]
            }
            trades.append(trade)
        STATE["my_trades"] = trades

        # Lifetime stats across all recorded trades
        cursor.execute("SELECT COUNT(*), SUM(CASE WHEN status='WON' THEN 1 ELSE 0 END), SUM(CASE WHEN status='LOST' THEN 1 ELSE 0 END), COALESCE(SUM(pnl), 0.0) FROM copied_trades")
        tot, w, l, pnl = cursor.fetchone()
        STATE["total_copied"] = tot or 0
        STATE["wins"] = w or 0
        STATE["losses"] = l or 0
        STATE["pnl"] = round(pnl or 0.0, 2)


def is_trade_seen(tx_hash: str) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM seen_trades WHERE tx_hash = ?", (tx_hash,))
        return cur.fetchone() is not None


def mark_trade_seen(tx_hash: str, timestamp: int, title: str, outcome: str, price: float):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("INSERT OR IGNORE INTO seen_trades (tx_hash, timestamp, title, outcome, price) VALUES (?, ?, ?, ?, ?)",
                     (tx_hash, timestamp, title, outcome, price))
        conn.commit()


def execute_copy_trade(target_trade: Dict[str, Any]):
    tx_hash = target_trade.get("transactionHash") or f"synth_{time.time()}"
    title = target_trade.get("title") or "Unknown Market"
    outcome = target_trade.get("outcome") or "Up"
    side = target_trade.get("side") or "BUY"
    target_price = float(target_trade.get("price") or 0.5)
    asset_id = target_trade.get("asset") or ""
    slug = target_trade.get("slug") or ""
    condition_id = target_trade.get("conditionId") or ""

    if side.upper() != "BUY":
        log_msg(f"Skipping non-BUY target trade ({side}) for {title}")
        mark_trade_seen(tx_hash, int(target_trade.get("timestamp") or time.time()), title, outcome, target_price)
        return

    if target_price < STATE["min_price"]:
        log_msg(f"Skipping trade: price ${target_price:.2f} is below min conviction price ${STATE['min_price']:.2f}")
        mark_trade_seen(tx_hash, int(target_trade.get("timestamp") or time.time()), title, outcome, target_price)
        return

    if target_price > STATE["max_price"]:
        log_msg(f"Skipping trade: price ${target_price:.2f} exceeds max price limit ${STATE['max_price']:.2f}")
        mark_trade_seen(tx_hash, int(target_trade.get("timestamp") or time.time()), title, outcome, target_price)
        return

    # Check window constraints (max per window & no-hedging)
    if slug:
        with sqlite3.connect(DB_PATH) as conn:
            cur = conn.cursor()
            cur.execute("SELECT outcome FROM copied_trades WHERE slug = ?", (slug,))
            existing_outcomes = [r[0] for r in cur.fetchall()]

            if len(existing_outcomes) >= STATE["max_per_window"]:
                log_msg(f"Skipping trade: max trades per window ({STATE['max_per_window']}) reached for {slug}")
                mark_trade_seen(tx_hash, int(target_trade.get("timestamp") or time.time()), title, outcome, target_price)
                return

            if STATE["no_hedging"] and existing_outcomes and outcome not in existing_outcomes:
                log_msg(f"Skipping trade: no-hedging active, already holding opposite outcome in {slug}")
                mark_trade_seen(tx_hash, int(target_trade.get("timestamp") or time.time()), title, outcome, target_price)
                return

    stake = STATE["stake"]
    my_price = target_price
    shares = round(stake / max(0.01, my_price), 2)
    mode = STATE["mode"]

    if mode == "LIVE" and clob_client:
        try:
            log_msg(f"EXECUTING LIVE ORDER: {side} {shares} shares of {outcome} in {title} at ${my_price:.2f}")
            order = clob_client.create_market_order(
                MarketOrderArgs(
                    token_id=asset_id,
                    amount=stake,
                    side=BUY
                )
            )
            resp = clob_client.post_order(order, OrderType.FOK)
            log_msg(f"Live order filled: {resp}")
        except Exception as e:
            log_msg(f"LIVE order failed: {e}")
            return
    else:
        log_msg(f"[PAPER] Copied {TARGET_NAME}: BUY {shares} shares of '{outcome}' @ ${my_price:.2f} (${stake:.2f}) - {title}")

    # Record in DB
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO copied_trades (copied_at, tx_hash, condition_id, slug, title, outcome, side, target_price, my_price, stake, shares, mode, status, pnl)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (time.time(), tx_hash, condition_id, slug, title, outcome, side, target_price, my_price, stake, shares, mode, "PENDING", 0.0))
        conn.commit()

    mark_trade_seen(tx_hash, int(target_trade.get("timestamp") or time.time()), title, outcome, target_price)
    load_recent_from_db()


def check_trade_resolutions():
    """Check pending trades to see if market has resolved."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, slug, outcome, stake, shares FROM copied_trades WHERE status = 'PENDING'")
        pending = cursor.fetchall()

    if not pending:
        return

    by_slug = {}
    for item in pending:
        trade_id, slug, outcome, stake, shares = item
        if not slug:
            continue
        by_slug.setdefault(slug, []).append((trade_id, outcome, stake, shares))

    resolved_any = False
    for slug, trades in by_slug.items():
        try:
            url = f"{GAMMA_API}/events"
            res = requests.get(url, params={"slug": slug}, timeout=5)
            if res.status_code == 200:
                data = res.json()
                if data and len(data) > 0:
                    market = data[0].get("markets", [{}])[0]
                    resolved = market.get("resolved") or market.get("closed")
                    if resolved:
                        winning_outcome = market.get("resolution") or market.get("resolvedOutcome")
                        if not winning_outcome:
                            try:
                                outcomes_raw = market.get("outcomes")
                                prices_raw = market.get("outcomePrices")
                                outs = json.loads(outcomes_raw) if isinstance(outcomes_raw, str) else (outcomes_raw or [])
                                prs = json.loads(prices_raw) if isinstance(prices_raw, str) else (prices_raw or [])
                                for o, p in zip(outs, prs):
                                    if float(p) >= 0.85:
                                        winning_outcome = o
                                        break
                            except Exception:
                                pass

                        if winning_outcome:
                            with sqlite3.connect(DB_PATH) as conn:
                                for trade_id, outcome, stake, shares in trades:
                                    won = (winning_outcome.strip().lower() == outcome.strip().lower())
                                    status = "WON" if won else "LOST"
                                    pnl = round(shares * 1.0 - stake, 2) if won else -stake
                                    conn.execute("UPDATE copied_trades SET status = ?, pnl = ? WHERE id = ?", (status, pnl, trade_id))
                                conn.commit()
                            log_msg(f"Market resolved ({slug}): Winner: {winning_outcome}! Updated {len(trades)} positions.")
                            resolved_any = True
        except Exception:
            pass

    if resolved_any:
        load_recent_from_db()


def poll_target_trades():
    """Poll Polymarket Data API for target trader's newest trades."""
    wallet = STATE["target_wallet"]
    url = f"{DATA_API}/activity"
    params = {"user": wallet, "limit": 15}
    try:
        resp = requests.get(url, params=params, timeout=8)
        if resp.status_code != 200:
            return
        trades = resp.json()
        if not isinstance(trades, list):
            return

        STATE["recent_target_trades"] = trades[:15]
        STATE["last_check_ts"] = int(time.time())

        if not STATE["running"]:
            return

        # Process from oldest to newest in batch
        for t in reversed(trades):
            tx = t.get("transactionHash")
            t_type = t.get("type")
            if t_type != "TRADE":
                continue
            if not tx:
                continue
            if not is_trade_seen(tx):
                execute_copy_trade(t)
    except Exception as e:
        log_msg(f"Poll check error: {e}")


def worker_loop():
    log_msg(f"Starting copy trader worker. Target: @{STATE['target_name']} ({STATE['target_wallet']})")
    init_db()

    # Pre-seed already existing trades so we don't spam copy historical transactions on cold boot
    try:
        resp = requests.get(f"{DATA_API}/activity?user={STATE['target_wallet']}&limit=20", timeout=8)
        if resp.status_code == 200:
            for t in resp.json():
                tx = t.get("transactionHash")
                if tx and not is_trade_seen(tx):
                    mark_trade_seen(
                        tx,
                        int(t.get("timestamp") or time.time()),
                        t.get("title") or "",
                        t.get("outcome") or "",
                        float(t.get("price") or 0.0)
                    )
            log_msg("Synchronized existing target history. Standing by for NEW live trades...")
    except Exception as e:
        log_msg(f"Init history sync warning: {e}")

    load_recent_from_db()
    check_trade_resolutions()

    cycle = 0
    while True:
        try:
            poll_target_trades()
            cycle += 1
            if cycle % 3 == 0:
                check_trade_resolutions()
        except Exception as e:
            log_msg(f"Worker iteration error: {e}")
        time.sleep(STATE["poll_interval"])


class StatusHandler(BaseHTTPRequestHandler):
    def _send_json(self, data: Any, code: int = 200):
        try:
            body = json.dumps(data).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError, OSError):
            pass

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/status" or self.path == "/":
            self._send_json(STATE)
        elif self.path == "/clear-history":
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("DELETE FROM copied_trades")
                conn.commit()
            load_recent_from_db()
            self._send_json({"ok": True, "message": "Copied trade history cleared"})
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            body = {}

        if self.path == "/stop":
            STATE["running"] = False
            log_msg("Copy trading PAUSED by user")
            self._send_json({"ok": True, "running": False})
        elif self.path == "/resume":
            STATE["running"] = True
            log_msg("Copy trading RESUMED by user")
            self._send_json({"ok": True, "running": True})
        elif self.path == "/config":
            if "stake" in body:
                STATE["stake"] = float(body["stake"])
            if "min_price" in body:
                STATE["min_price"] = float(body["min_price"])
            if "max_price" in body:
                STATE["max_price"] = float(body["max_price"])
            if "max_per_window" in body:
                STATE["max_per_window"] = int(body["max_per_window"])
            if "no_hedging" in body:
                STATE["no_hedging"] = bool(body["no_hedging"])
            if "poll_interval" in body:
                STATE["poll_interval"] = float(body["poll_interval"])
            if "running" in body:
                STATE["running"] = bool(body["running"])
            if body.get("mode") == "LIVE":
                pk = body.get("private_key") or os.environ.get("PM_PRIVATE_KEY")
                funder = body.get("funder") or os.environ.get("PM_FUNDER")
                if not pk:
                    self._send_json({"ok": False, "error": "Polygon private key required for LIVE mode"}, 400)
                    return
                try:
                    init_clob(pk, funder)
                    STATE["mode"] = "LIVE"
                except Exception as e:
                    self._send_json({"ok": False, "error": f"Failed to initialize Polymarket CLOB: {e}"}, 400)
                    return
            elif body.get("mode") == "PAPER":
                STATE["mode"] = "PAPER"
            log_msg(f"Config updated: mode={STATE['mode']}, running={STATE['running']}, stake=${STATE['stake']}, min_price=${STATE['min_price']}, max_price=${STATE['max_price']}")
            self._send_json({"ok": True, "state": STATE})
        else:
            self._send_json({"error": "Unknown endpoint"}, 404)

    def log_message(self, format, *args):
        pass  # Suppress default noisy access logs


def main():
    print(f"============================================================")
    print(f" Polymarket Copy Trader: @{STATE['target_name']}")
    print(f" Target Wallet: {STATE['target_wallet']}")
    print(f" Mode: {STATE['mode']} | Default Stake: ${STATE['stake']} | Max Price: ${STATE['max_price']}")
    print(f" HTTP Control Server: http://0.0.0.0:{args.port}/status")
    print(f"============================================================")

    # Start background polling thread
    t = threading.Thread(target=worker_loop, daemon=True)
    t.start()

    server = ThreadingHTTPServer(("0.0.0.0", args.port), StatusHandler)
    server.daemon_threads = True
    while True:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Copy Trader server.")
            server.server_close()
            break
        except Exception as e:
            time.sleep(0.5)


if __name__ == "__main__":
    main()
