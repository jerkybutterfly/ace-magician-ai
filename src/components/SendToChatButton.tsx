import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Play } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { sendToChat } from '@/lib/chat-bus';
import { toast } from 'sonner';

interface Props extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** Text or tool tag (e.g. "[RUN_CMD:ls -la]") to drop into the chat input */
  text: string;
  /** If true, the chat will auto-submit on arrival */
  autorun?: boolean;
  /** Button label; defaults based on autorun */
  label?: string;
  /** Optional toast confirmation message */
  toastMessage?: string;
}

export function SendToChatButton({
  text,
  autorun = false,
  label,
  toastMessage,
  size = 'sm',
  variant = 'outline',
  className,
  ...rest
}: Props) {
  const navigate = useNavigate();
  const Icon = autorun ? Play : MessageSquarePlus;
  const finalLabel = label ?? (autorun ? 'Run in chat' : 'Send to chat');

  const handle = () => {
    sendToChat({ text, autorun });
    navigate('/');
    if (toastMessage !== '') toast.success(toastMessage ?? (autorun ? 'Running in chat…' : 'Sent to chat'));
  };

  return (
    <Button onClick={handle} size={size} variant={variant} className={className} {...rest}>
      <Icon className="h-3.5 w-3.5" />
      {finalLabel}
    </Button>
  );
}
