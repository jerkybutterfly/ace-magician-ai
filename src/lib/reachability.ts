import { useEffect, useState } from 'react';
import { getSettings } from './settings';

type Listener = (reachable: boolean) => void;
const listeners = new Set<Listener>();
let agentReachable = false;

function setReachable(r: boolean) {
  if (agentReachable === r) return;
  agentReachable = r;
  listeners.forEach((l) => l(r));
}

export function subscribeAgentReachable(listener: Listener) {
  listeners.add(listener);
  listener(agentReachable);
  return () => listeners.delete(listener);
}

export function isAgentReachable(): boolean {
  return agentReachable;
}

export async function probeAgent(): Promise<boolean> {
  const { agentUrl } = getSettings();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${agentUrl}/system`, {
      method: 'GET',
      signal: controller.signal,
    });
    setReachable(res.ok);
    return res.ok;
  } catch {
    setReachable(false);
    return false;
  } finally {
    clearTimeout(t);
  }
}

export function useAgentReachable(): boolean {
  const [reachable, setReachableState] = useState(agentReachable);
  useEffect(() => {
    const unsub = subscribeAgentReachable(setReachableState);
    void probeAgent();
    const id = setInterval(() => void probeAgent(), 30000);
    return () => {
      unsub();
      clearInterval(id);
    };
  }, []);
  return reachable;
}
