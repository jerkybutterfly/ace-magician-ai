import { useState, useRef, useEffect } from 'react';
import { streamChat, type ChatMessage } from '@/lib/ollama';
import { ChatMessageBubble } from '@/components/ChatMessage';
import { ModelSelector } from '@/components/ModelSelector';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Square, Bot } from 'lucide-react';
import type { Conversation } from '@/lib/conversations';

interface Props {
  conversation: Conversation | null;
  onUpdate: (convo: Conversation) => void;
  model: string;
  onModelChange: (m: string) => void;
}

export default function Chat({ conversation, onUpdate, model, onModelChange }: Props) {
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  const send = async () => {
    if (!input.trim() || !conversation || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updated: Conversation = {
      ...conversation,
      messages: [...messages, userMsg],
      updatedAt: Date.now(),
      title: messages.length === 0 ? input.trim().slice(0, 40) : conversation.title,
    };
    onUpdate(updated);
    setInput('');
    setStreaming(true);
    setStreamedContent('');

    try {
      let full = '';
      for await (const chunk of streamChat(model, updated.messages)) {
        full += chunk;
        setStreamedContent(full);
      }
      const assistantMsg: ChatMessage = { role: 'assistant', content: full };
      onUpdate({ ...updated, messages: [...updated.messages, assistantMsg], updatedAt: Date.now() });
    } catch (err) {
      const errorMsg: ChatMessage = { role: 'assistant', content: `⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}. Make sure Ollama is running.` };
      onUpdate({ ...updated, messages: [...updated.messages, errorMsg], updatedAt: Date.now() });
    } finally {
      setStreaming(false);
      setStreamedContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <ModelSelector value={model} onChange={onModelChange} />
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Local AI Assistant</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Chat with your local Ollama model. Use the terminal in the sidebar to run commands on your PC.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessageBubble key={i} message={msg} />
          ))}
          {streaming && streamedContent && (
            <ChatMessageBubble message={{ role: 'assistant', content: streamedContent }} />
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="resize-none min-h-[44px] max-h-[200px]"
            rows={1}
            disabled={streaming}
          />
          <Button
            onClick={streaming ? undefined : send}
            disabled={!input.trim() && !streaming}
            size="icon"
            className="h-[44px] w-[44px] flex-shrink-0"
          >
            {streaming ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
