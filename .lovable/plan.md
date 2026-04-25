## Bug
`public/agent.py` uses `Body(...)` for the new phone bridge endpoints (lines 3213, 3227, 3261, 3277) but `Body` is never imported. At import time FastAPI raises `NameError: name 'Body' is not defined` and the whole agent fails to start.

```
Line 21:  from fastapi import FastAPI, HTTPException     # ← missing Body
...
Line 3213: async def phone_register(req: Dict[str, Any] = Body(...)):
Line 3227: async def phone_heartbeat(req: Dict[str, Any] = Body(...)):
Line 3261: async def phone_results(req: Dict[str, Any] = Body(...)):
Line 3277: async def phone_dispatch(req: Dict[str, Any] = Body(...)):
```

## Fix
One-line change in `public/agent.py`:

```python
from fastapi import FastAPI, HTTPException, Body
```

That's it — no other files need to change. After saving, restart `python public/agent.py` and the four `/phone/*` endpoints will load cleanly.