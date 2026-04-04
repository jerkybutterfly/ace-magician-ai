const MEMORY_KEY = 'pesto-agent-memory';

export function getAgentMemory(): string {
  return localStorage.getItem(MEMORY_KEY) ?? '';
}
