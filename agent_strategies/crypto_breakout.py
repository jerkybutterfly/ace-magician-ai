"""Donchian channel breakout for BTC/ETH on 1-hour bars.

NOTE: Alpaca crypto uses a separate CryptoHistoricalDataClient — the runner
in trading_module.py currently uses the stock data client. Treat this as a
template; swap to crypto data fetch when you wire crypto in.
"""
ID = "crypto_breakout"
NAME = "Crypto Donchian Breakout"
SYMBOLS = ["BTC/USD", "ETH/USD"]
TIMEFRAME = "1Hour"

_state = {"in_pos": {}}


def signal(df):
    if len(df) < 25:
        return {"side": "hold"}
    high20 = df["high"].rolling(20).max().iloc[-2]   # prior bar's 20-bar high
    low20 = df["low"].rolling(20).min().iloc[-2]
    last = df["close"].iloc[-1]
    flag = _state["in_pos"].get("flag", False)
    if last > high20 and not flag:
        _state["in_pos"]["flag"] = True
        return {"side": "buy", "qty": 1}
    if last < low20 and flag:
        _state["in_pos"]["flag"] = False
        return {"side": "sell", "qty": 1}
    return {"side": "hold"}
