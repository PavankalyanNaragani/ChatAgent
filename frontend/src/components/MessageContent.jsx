import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from "lucide-react"; 

const MessageContent = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 1. Custom Renderer for Code Blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');

          if (!inline && match) {
            return (
              <div className="rounded-lg overflow-hidden my-3 border border-gray-700 shadow-sm">
                {/* Header with Language Name & Copy Button */}
                <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1.5 flex justify-between items-center border-b border-gray-700">
                  <span className="font-mono font-semibold uppercase">{match[1]}</span>
                  <CopyButton text={codeString} />
                </div>
                
                {/* The Code Itself */}
                <SyntaxHighlighter
                  style={dracula}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '0.85rem' }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }
          
          // Inline Code (like `variable`)
          return (
            <code className="bg-black/20 text-purple-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        
        // 2. Custom Styles for Standard Markdown Elements
        ul: ({children}) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
        li: ({children}) => <li className="pl-1">{children}</li>,
        p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        h1: ({children}) => <h1 className="text-xl font-bold my-2 pb-1 border-b border-gray-600">{children}</h1>,
        h2: ({children}) => <h2 className="text-lg font-bold my-2">{children}</h2>,
        h3: ({children}) => <h3 className="text-md font-bold my-1">{children}</h3>,
        blockquote: ({children}) => <blockquote className="border-l-4 border-gray-500 pl-3 my-2 italic text-gray-400">{children}</blockquote>,
        a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Helper Component for Copy Button
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="flex items-center gap-1 hover:text-white transition">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

export default MessageContent;