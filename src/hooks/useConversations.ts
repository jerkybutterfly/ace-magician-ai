import { useState, useCallback, useEffect } from 'react';
import { loadConversations, saveConversations, createConversation, type Conversation } from '@/lib/conversations';
import { getSettings } from '@/lib/settings';

const CURRENT_KEY = 'local-ai-current-convo';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(() => {
    const loaded = loadConversations();
    const stored = localStorage.getItem(CURRENT_KEY);
    if (stored && loaded.some(c => c.id === stored)) return stored;
    return loaded.length > 0 ? loaded[loaded.length - 1].id : null;
  });

  const persist = useCallback((convos: Conversation[]) => {
    setConversations([...convos]);
    saveConversations(convos);
  }, []);

  const handleNewChat = useCallback(() => {
    const defaultModel = getSettings().defaultModel || '';
    const convo = createConversation(defaultModel);
    const updated = [...conversations, convo];
    persist(updated);
    setCurrentConvoId(convo.id);
    localStorage.setItem(CURRENT_KEY, convo.id);
  }, [conversations, persist]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConvoId(id);
    localStorage.setItem(CURRENT_KEY, id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    persist(updated);
    if (currentConvoId === id) {
      const newId = updated.length > 0 ? updated[updated.length - 1].id : null;
      setCurrentConvoId(newId);
      if (newId) localStorage.setItem(CURRENT_KEY, newId);
      else localStorage.removeItem(CURRENT_KEY);
    }
  }, [conversations, currentConvoId, persist]);

  const updateConversation = useCallback((convo: Conversation) => {
    const updated = conversations.map((c) => (c.id === convo.id ? convo : c));
    if (!updated.find((c) => c.id === convo.id)) updated.push(convo);
    persist(updated);
  }, [conversations, persist]);

  // Initial auto-creation
  useEffect(() => {
    if (conversations.length === 0) {
      const defaultModel = getSettings().defaultModel || '';
      const convo = createConversation(defaultModel);
      persist([convo]);
      setCurrentConvoId(convo.id);
      localStorage.setItem(CURRENT_KEY, convo.id);
    }
  }, []);

  return {
    conversations,
    currentConvoId,
    createConversation: handleNewChat,
    selectConversation,
    deleteConversation,
    updateConversation,
  };
}
