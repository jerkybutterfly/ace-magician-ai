import { useState } from 'react';
import { Bot, User, Volume2, VolumeX, Brain, ChevronRight } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ChatMessage as ChatMsg } from '@/lib/ollama';

function speakText(text: string, onEnd: () => void) {
  const cleaned = text.replace(/[#*`_~\[\]()>|]/g, '').replace(/\n+/g, '. ');
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  speechSynthesis.speak(utterance);
}

export function ChatMessageBubble({ message }: { message: ChatMsg }) {
  const isUser = message.role === 'user';
  const [speaking, setSpeaking] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(false);

  const toggleSpeak = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(message.content, () => setSpeaking(false));
    }
  };

  return (
    <div className={`group flex gap-3 py-4 px-4 ${isUser ? '' : 'bg-muted/30'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        {!isUser && message.thinking && (
          <Collapsible open={thinkingOpen} onOpenChange={setThinkingOpen} className="mb-3">
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none group/think">
              <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${thinkingOpen ? 'rotate-90' : ''}`} />
              <Brain className="h-3.5 w-3.5 text-primary/60" />
              <span className="font-medium">Thinking</span>
              {!thinkingOpen && (
                <span className="text-muted-foreground/60 ml-1 truncate max-w-[200px]">
                  — {message.thinking.slice(0, 60)}…
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="pl-5 border-l-2 border-primary/20 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {message.thinking}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
      {!isUser && message.content && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSpeak}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-start mt-1"
          title={speaking ? 'Stop speaking' : 'Read aloud'}
        >
          {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </Button>
      )}
    </div>
  );
}
