import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1 rounded-t-md text-xs text-muted-foreground">
        <span>{language || 'code'}</span>
        <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, fontSize: '0.8rem' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const text = String(children).replace(/\n$/, '');
          if (match) {
            return <CodeBlock language={match[1]} children={text} />;
          }
          return (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-bold mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary pl-3 italic text-muted-foreground mb-2">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full text-sm border border-border">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted font-medium text-left">{children}</th>,
        td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
