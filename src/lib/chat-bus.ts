// Lightweight bus to send text into the Chat input from any page.
// Usage: sendToChat({ text: '[RUN_CMD:nmap -sV example.com]', autorun: true })

const STORAGE_KEY = 'chat-bus:pending';
const EVENT_NAME = 'chat-bus:push';

export interface ChatPayload {
  text: string;
  autorun?: boolean;
}

export function sendToChat(payload: ChatPayload) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {/* ignore */}
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
}

export function consumePending(): ChatPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as ChatPayload;
  } catch {
    return null;
  }
}

export function onChatPush(handler: (p: ChatPayload) => void): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<ChatPayload>).detail;
    if (detail) handler(detail);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
