import { useEffect, useState } from 'react';
import { getSettings } from './settings';

type Listener = (reachable: boolean) => void;

const agentListeners = new Set<Listener>();
let agentReachable = false;

function setAgentReachable(r: boolean) {
  if (agentReachable === r) return;
  agentReachable = r;
  agentListeners.forEach((l) => l(r));
}

export function subscribeAgentReachable(listener: Listener) {
  agentListeners.add(listener);
  listener(agentReachable);
  return () => agentListeners.delete(listener);
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
    setAgentReachable(res.ok);
    return res.ok;
  } catch {
    setAgentReachable(false);
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

const ollamaListeners = new Set<Listener>();
let ollamaReachable = false;

function setOllamaReachable(r: boolean) {
  if (ollamaReachable === r) return;
  ollamaReachable = r;
  ollamaListeners.forEach((l) => l(r));
}

export function subscribeOllamaReachable(listener: Listener) {
  ollamaListeners.add(listener);
  listener(ollamaReachable);
  return () => ollamaListeners.delete(listener);
}

export function isOllamaReachable(): boolean {
  return ollamaReachable;
}

export async function probeOllama(): Promise<boolean> {
  const { ollamaUrl } = getSettings();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    setOllamaReachable(res.ok);
    return res.ok;
  } catch {
    setOllamaReachable(false);
    return false;
  } finally {
    clearTimeout(t);
  }
}

export function useOllamaReachable(): boolean {
  const [reachable, setReachableState] = useState(ollamaReachable);
  useEffect(() => {
    const unsub = subscribeOllamaReachable(setReachableState);
    void probeOllama();
    const id = setInterval(() => void probeOllama(), 30000);
    return () => {
      unsub();
      clearInterval(id);
    };
  }, []);
  return reachable;
}
