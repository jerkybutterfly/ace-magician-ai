import type { ChatMessage } from './ollama';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'local-ai-conversations';

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(convos: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

export function createConversation(model: string): Conversation {
  return {
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: [],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
