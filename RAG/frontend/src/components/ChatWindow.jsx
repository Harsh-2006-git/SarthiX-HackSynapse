import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';

export default function ChatWindow({ messages, isTyping, onUploadClick, documents = [] }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom of the chat window container
  useEffect(() => {
    if (messages.length > 0 && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0">
        <EmptyState onUploadClick={onUploadClick} hasDocuments={documents.length > 0} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
      <div className="flex flex-col pb-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="py-6 flex w-full bg-zinc-900/30">
            <div className="max-w-4xl w-full mx-auto md:mx-0 md:ml-12 flex px-4 gap-6">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <span className="w-5 h-5 block i-lucide-bot text-secondary" />
                </div>
              </div>
              <div className="flex-1">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
