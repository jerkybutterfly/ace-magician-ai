import { Bot, User } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { ChatMessage as ChatMsg } from '@/lib/ollama';

export function ChatMessageBubble({ message }: { message: ChatMsg }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 py-4 px-4 ${isUser ? '' : 'bg-muted/30'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
}
