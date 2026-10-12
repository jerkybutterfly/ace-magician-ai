"""
Polymarket BTC latency bot — runs on your mini PC, no browser in the loop.

Streams Binance BTC trades and the Polymarket order book over WebSockets,
works out the fair chance that the current BTC "Up or Down" window finishes Up,
and buys whichever side is priced too cheaply.

  pip install websockets requests            (paper mode)
  pip install py-clob-client                 (only for --live)
  python polymarket_bot.py                   paper trading (default, pretend money)
  python polymarket_bot.py --live            real orders: needs env PM_PRIVATE_KEY (+ PM_FUNDER for proxy wallets)

Status for the app: http://<mini-pc>:8485/status   kill switch: POST /stop
"""
from __future__ import annotations
import argparse, asyncio, json, math, os, sqlite3, statistics, time
from collections import deque
from pathlib import Path

import requests
import websockets

BINANCE_WS = "wss://stream.binance.com:9443/ws/btcusdt@aggTrade"
CLOB_WS = "wss://ws-subscriptions-clob.polymarket.com/ws/market"
GAMMA = "https://gamma-api.polymarket.com"
DB = Path.home() / ".aiapp" / "polybot.db"
DB.parent.mkdir(parents=True, exist_ok=True)

ap = argparse.ArgumentParser()
ap.add_argument("--live", action="store_true")
ap.add_argument("--window", type=int, default=15, choices=[5, 15], help="market length in minutes")
ap.add_argument("--edge", type=float, default=0.06, help="min edge (fair - ask) to trade")
ap.add_argument("--stake", type=float, default=10.0, help="USDC per trade")
ap.add_argument("--max-per-window", type=int, default=3)
ap.add_argument("--daily-loss", type=float, default=100.0)
ap.add_argument("--port", type=int, default=8485)
args = ap.parse_args()

S = {
    "mode": "LIVE" if args.live else "PAPER", "running": True,
    "btc": None, "btc_ts": 0.0, "binance_lag_ms": None, "clob_lag_ms": None,
    "window_start": 0, "open_price": None, "slug": None, "tokens": {},  # side -> token id
    "asks": {}, "fair_up": None, "trades": [], "pnl": 0.0, "wins": 0, "losses": 0,
    "window_trades": 0, "log": deque(maxlen=60), "decide_us": None,
}
rets: deque = deque(maxlen=600)  # 1s log returns for volatility
_last_sec = [0, None]

def log(msg: str):
    line = f"{time.strftime('%H:%M:%S')} {msg}"
    S["log"].append(line); print(line, flush=True)

def db():
    c = sqlite3.connect(DB)
    c.execute("CREATE TABLE IF NOT EXISTS trades(ts REAL, mode TEXT, slug TEXT, side TEXT, price REAL, stake REAL, fair REAL, result TEXT, pnl REAL)")
    return c

# ─── live order client (optional) ─────────────────────────────
clob = None
if args.live:
    from py_clob_client.client import ClobClient
    from py_clob_client.clob_types import MarketOrderArgs, OrderType
    from py_clob_client.order_builder.constants import BUY
    pk = os.environ.get("PM_PRIVATE_KEY")
    if not pk:
        raise SystemExit("Set PM_PRIVATE_KEY to trade live.")
    funder = os.environ.get("PM_FUNDER")
    clob = ClobClient("https://clob.polymarket.com", key=pk, chain_id=137,
                      signature_type=1 if funder else 0, funder=funder)
    clob.set_api_creds(clob.create_or_derive_api_creds())
    log("LIVE mode: real orders enabled")

# ─── market discovery ────────────────────────────────────────
def current_window() -> int:
    w = args.window * 60
    return int(time.time()) // w * w

def load_market(start: int) -> bool:
    slug = f"btc-updown-{args.window}m-{start}"
    try:
        ev = requests.get(f"{GAMMA}/events", params={"slug": slug}, timeout=5).json()
        m = ev[0]["markets"][0]
        outcomes = json.loads(m["outcomes"]); ids = json.loads(m["clobTokenIds"])
        S["tokens"] = {o.upper(): t for o, t in zip(outcomes, ids)}
        S["slug"] = slug; S["asks"] = {}
        log(f"market {slug} tokens={list(S['tokens'])}")
        return True
    except Exception as e:
        log(f"market lookup failed for {slug}: {e}"); return False

# ─── fair value ──────────────────────────────────────────────
def phi(x: float) -> float:
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def fair_up() -> float | None:
    if not S["btc"] or not S["open_price"] or len(rets) < 30:
        return None
    sigma = statistics.pstdev(rets) or 1e-5            # per-second vol
    left = max(1.0, S["window_start"] + args.window * 60 - time.time())
    z = math.log(S["btc"] / S["open_price"]) / (sigma * math.sqrt(left))
    return min(0.99, max(0.01, phi(z)))

# ─── trading ─────────────────────────────────────────────────
def decide():
    t0 = time.perf_counter()
    f = fair_up(); S["fair_up"] = f
    if f is None or not S["running"] or S["window_trades"] >= args.max_per_window:
        return
    if -S["pnl"] >= args.daily_loss:
        S["running"] = False; log("daily loss limit hit — stopped"); return
    left = S["window_start"] + args.window * 60 - time.time()
    if left < 10:
        return
    for side, fair in (("UP", f), ("DOWN", 1 - f)):
        ask = S["asks"].get(side)
        if ask and 0.02 < ask < 0.97 and fair - ask >= args.edge:
            place(side, ask, fair); break
    S["decide_us"] = int((time.perf_counter() - t0) * 1e6)

def place(side: str, ask: float, fair: float):
    token = S["tokens"].get(side)
    if not token:
        return
    if clob:
        try:
            o = clob.create_market_order(MarketOrderArgs(token_id=token, amount=args.stake, side=BUY))
            r = clob.post_order(o, OrderType.FOK)
            if not r.get("success"):
                log(f"order rejected: {r}"); return
        except Exception as e:
            log(f"order error: {e}"); return
    t = {"ts": time.time(), "slug": S["slug"], "side": side, "price": ask, "stake": args.stake,
         "fair": round(fair, 3), "result": "open", "pnl": 0.0}
    S["trades"].append(t); S["window_trades"] += 1
    log(f"{S['mode']} BUY {side} @ {ask:.3f} fair={fair:.3f} stake=${args.stake}")

def settle(close_price: float):
    up_won = close_price >= (S["open_price"] or close_price)
    c = db()
    for t in S["trades"]:
        if t["result"] == "open" and t["slug"] == S["slug"]:
            won = (t["side"] == "UP") == up_won
            t["result"] = "won" if won else "lost"
            t["pnl"] = round(t["stake"] / t["price"] - t["stake"], 2) if won else -t["stake"]
            S["pnl"] = round(S["pnl"] + t["pnl"], 2)
            S["wins" if won else "losses"] += 1
            c.execute("INSERT INTO trades VALUES(?,?,?,?,?,?,?,?,?)",
                      (t["ts"], S["mode"], t["slug"], t["side"], t["price"], t["stake"], t["fair"], t["result"], t["pnl"]))
            log(f"settled {t['side']} {t['result']} {t['pnl']:+.2f}")
    c.commit(); c.close()
    S["trades"] = S["trades"][-200:]

async def window_loop():
    while True:
        start = current_window()
        if start != S["window_start"]:
            if S["window_start"] and S["btc"]:
                settle(S["btc"])
            S["window_start"] = start; S["open_price"] = S["btc"]; S["window_trades"] = 0
            await asyncio.to_thread(load_market, start)
        await asyncio.sleep(0.5)

# ─── feeds ───────────────────────────────────────────────────
async def binance_feed():
    while True:
        try:
            async with websockets.connect(BINANCE_WS, ping_interval=15) as ws:
                log("Binance connected")
                async for raw in ws:
                    m = json.loads(raw); p = float(m["p"]); now = time.time()
                    S["binance_lag_ms"] = round(now * 1000 - m["T"], 1)
                    S["btc"] = p; S["btc_ts"] = now
                    sec = int(now)
                    if sec != _last_sec[0]:
                        if _last_sec[1]:
                            rets.append(math.log(p / _last_sec[1]))
                        _last_sec[0], _last_sec[1] = sec, p
                    if S["open_price"] is None:
                        S["open_price"] = p
                    decide()
        except Exception as e:
            log(f"Binance dropped: {e}"); await asyncio.sleep(1)

def _side_of(asset: str):
    for s, t in S["tokens"].items():
        if t == asset:
            return s

async def clob_feed():
    while True:
        if not S["tokens"]:
            await asyncio.sleep(0.5); continue
        subscribed = dict(S["tokens"])
        try:
            async with websockets.connect(CLOB_WS, ping_interval=10) as ws:
                await ws.send(json.dumps({"assets_ids": list(subscribed.values()), "type": "market"}))
                log("Polymarket book connected")
                while S["tokens"] == subscribed:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=1)
                    except asyncio.TimeoutError:
                        continue
                    if raw == "PONG":
                        continue
                    msgs = json.loads(raw); msgs = msgs if isinstance(msgs, list) else [msgs]
                    for m in msgs:
                        if m.get("timestamp"):
                            S["clob_lag_ms"] = round(time.time() * 1000 - int(m["timestamp"]), 1)
                        if m.get("event_type") == "book":
                            side = _side_of(m.get("asset_id"))
                            asks = [float(a["price"]) for a in m.get("asks", [])]
                            if side and asks:
                                S["asks"][side] = min(asks)
                        for pc in m.get("price_changes", []):
                            side = _side_of(pc.get("asset_id"))
                            if side and pc.get("best_ask"):
                                S["asks"][side] = float(pc["best_ask"])
                    decide()
        except Exception as e:
            log(f"Polymarket dropped: {e}"); await asyncio.sleep(1)

# ─── tiny status server for the app ──────────────────────────
async def http(reader, writer):
    try:
        req = (await reader.read(2048)).decode(errors="ignore")
        line = req.split("\r\n", 1)[0]
        if line.startswith("POST /stop"):
            S["running"] = False; log("kill switch pressed")
        elif line.startswith("POST /resume"):
            S["running"] = True; log("resumed")
        body = json.dumps({**S, "log": list(S["log"]), "trades": S["trades"][-30:], "ts": time.time(),
                           "settings": vars(args)})
        hdr = ("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\n"
               "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: *\r\n"
               f"Content-Length: {len(body.encode())}\r\nConnection: close\r\n\r\n")
        writer.write(hdr.encode() + body.encode()); await writer.drain()
    finally:
        writer.close()

async def main():
    log(f"starting in {S['mode']} mode — {args.window}m BTC windows, edge {args.edge}, stake ${args.stake}")
    server = await asyncio.start_server(http, "0.0.0.0", args.port)
    async with server:
        await asyncio.gather(binance_feed(), clob_feed(), window_loop())

if __name__ == "__main__":
    asyncio.run(main())
