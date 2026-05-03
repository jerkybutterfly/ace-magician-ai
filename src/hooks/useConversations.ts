import { useCallback, useEffect, useState } from 'react';
import {
  type Conversation,
  loadConversations,
  saveConversations,
  createConversation as makeConversation,
} from '@/lib/conversations';

const CURRENT_KEY = 'local-ai-current-convo';

export function useConversations(defaultModel = 'llama3.2') {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    const stored = localStorage.getItem(CURRENT_KEY);
    if (stored && loaded.some(c => c.id === stored)) setCurrentConvoId(stored);
    else if (loaded[0]) setCurrentConvoId(loaded[0].id);
  }, []);

  const persist = useCallback((next: Conversation[]) => {
    setConversations(next);
    saveConversations(next);
  }, []);

  const createConversation = useCallback(() => {
    const c = makeConversation(defaultModel);
    persist([c, ...conversations]);
    setCurrentConvoId(c.id);
    localStorage.setItem(CURRENT_KEY, c.id);
    return c.id;
  }, [conversations, defaultModel, persist]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConvoId(id);
    localStorage.setItem(CURRENT_KEY, id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const next = conversations.filter(c => c.id !== id);
    persist(next);
    if (currentConvoId === id) {
      const newId = next[0]?.id ?? null;
      setCurrentConvoId(newId);
      if (newId) localStorage.setItem(CURRENT_KEY, newId);
      else localStorage.removeItem(CURRENT_KEY);
    }
  }, [conversations, currentConvoId, persist]);

  return { conversations, currentConvoId, createConversation, selectConversation, deleteConversation };
}
