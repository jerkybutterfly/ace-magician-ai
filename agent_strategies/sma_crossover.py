"""SMA 50/200 crossover — classic trend follower on daily bars."""
ID = "sma_crossover"
NAME = "SMA 50/200 Crossover"
SYMBOLS = ["SPY"]
TIMEFRAME = "1Day"

_state = {"position": 0}  # crude per-process flag


def signal(df):
    if len(df) < 200:
        return {"side": "hold"}
    close = df["close"]
    fast = close.rolling(50).mean().iloc[-1]
    slow = close.rolling(200).mean().iloc[-1]
    fast_prev = close.rolling(50).mean().iloc[-2]
    slow_prev = close.rolling(200).mean().iloc[-2]
    # Golden cross
    if fast_prev <= slow_prev and fast > slow and _state["position"] <= 0:
        _state["position"] = 1
        return {"side": "buy", "qty": 1}
    # Death cross
    if fast_prev >= slow_prev and fast < slow and _state["position"] >= 0:
        _state["position"] = -1
        return {"side": "sell", "qty": 1}
    return {"side": "hold"}
