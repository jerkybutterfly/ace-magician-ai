import { useState, useRef, useEffect } from 'react';
import { streamChat, type ChatMessage } from '@/lib/ollama';
import { executeToolCommands, hasToolCommands } from '@/lib/agent-tools';
import { ChatMessageBubble } from '@/components/ChatMessage';
import { ModelSelector } from '@/components/ModelSelector';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Square, Bot } from 'lucide-react';
import type { Conversation } from '@/lib/conversations';

const MAX_TOOL_ROUNDS = 5;

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
  const [executingTools, setExecutingTools] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  const send = async () => {
    if (!input.trim() || !conversation || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    let updated: Conversation = {
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
      let currentMessages = [...updated.messages];
      let round = 0;

      while (round < MAX_TOOL_ROUNDS) {
        round++;

        // Stream AI response
        let full = '';
        setStreamedContent('');
        for await (const chunk of streamChat(model, currentMessages)) {
          full += chunk;
          setStreamedContent(full);
        }

        // Check for tool commands
        if (hasToolCommands(full)) {
          setExecutingTools(true);
          setStreamedContent(full + '\n\n⏳ Executing commands...');

          const { processed } = await executeToolCommands(full);

          // Add assistant response with tool results to conversation
          const assistantMsg: ChatMessage = { role: 'assistant', content: processed };
          currentMessages = [...currentMessages, assistantMsg];

          // Feed results back as a system message so AI can react
          const feedbackMsg: ChatMessage = {
            role: 'user',
            content: `[TOOL_RESULTS]\nThe commands were executed. Here are the results that were inserted into your previous response:\n${processed}\n[/TOOL_RESULTS]\nAnalyze the results and continue. If more actions are needed, use your tags. If done, summarize what happened.`,
          };
          currentMessages = [...currentMessages, feedbackMsg];

          // Update conversation with results so far
          updated = { ...updated, messages: currentMessages, updatedAt: Date.now() };
          onUpdate(updated);
          setExecutingTools(false);

          // Continue loop — AI will see results and can chain more actions
          continue;
        }

        // Check if AI refused to act (common with small models)
        const refusalPatterns = /I (cannot|can't|am unable|don't have the capability|unable to)|for security reasons|I'm not able|I do not have/i;
        if (refusalPatterns.test(full) && round === 1) {
          // Re-prompt the AI to actually use its tools
          const assistantMsg: ChatMessage = { role: 'assistant', content: full };
          currentMessages = [...currentMessages, assistantMsg];
          const nudge: ChatMessage = {
            role: 'user',
            content: `You said you can't do it, but you CAN. You have tool tags: [RUN_CMD:...], [LIST_DIR:...], [READ_FILE:...], [WRITE_FILE:...]. These are auto-executed. Use them NOW to fulfill the original request. Do NOT explain — just act with tags.`,
          };
          currentMessages = [...currentMessages, nudge];
          updated = { ...updated, messages: currentMessages, updatedAt: Date.now() };
          onUpdate(updated);
          continue;
        }

        // No tool commands — final response
        const assistantMsg: ChatMessage = { role: 'assistant', content: full };
        updated = { ...updated, messages: [...currentMessages, assistantMsg], updatedAt: Date.now() };
        onUpdate(updated);
        break;
      }
    } catch (err) {
      const errorMsg: ChatMessage = { role: 'assistant', content: `⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}. Make sure Ollama is running.` };
      onUpdate({ ...updated, messages: [...updated.messages, errorMsg], updatedAt: Date.now() });
    } finally {
      setStreaming(false);
      setStreamedContent('');
      setExecutingTools(false);
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
                Chat with your local AI. It has full access to your files and can run commands on your PC.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessageBubble key={i} message={msg} />
          ))}
          {streaming && streamedContent && (
            <ChatMessageBubble message={{ role: 'assistant', content: streamedContent }} />
          )}
          {executingTools && !streamedContent && (
            <div className="px-6 py-3 text-sm text-muted-foreground animate-pulse">
              ⏳ Executing file operations...
            </div>
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
            placeholder="Ask about your files, run commands, or just chat..."
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
