"""RSI(14) mean-reversion — buy oversold, sell overbought on 15-min bars."""
ID = "rsi_revert"
NAME = "RSI Mean Reversion"
SYMBOLS = ["AAPL", "MSFT"]
TIMEFRAME = "15Min"

_state = {"in_pos": {}}


def _rsi(close, n=14):
    delta = close.diff()
    up = delta.clip(lower=0).rolling(n).mean()
    down = -delta.clip(upper=0).rolling(n).mean()
    rs = up / down.replace(0, 1e-9)
    return 100 - 100 / (1 + rs)


def signal(df):
    if len(df) < 30:
        return {"side": "hold"}
    rsi = _rsi(df["close"]).iloc[-1]
    sym_state = _state["in_pos"]
    # Single global flag is crude — fine for solo paper. Refine later.
    in_pos = sym_state.get("flag", False)
    if rsi < 30 and not in_pos:
        sym_state["flag"] = True
        return {"side": "buy", "qty": 1}
    if rsi > 70 and in_pos:
        sym_state["flag"] = False
        return {"side": "sell", "qty": 1}
    return {"side": "hold"}
