'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useEffect, useRef, useState } from 'react';

interface ChatMessagesProps {
  channelId: string;
}

export default function ChatMessages({ channelId }: ChatMessagesProps) {
  const { state, deleteMessage } = useAppState();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  const channel = state.channels.find(c => c.id === channelId);
  const channelMessages = state.messages
    .filter(m => m.channelId === channelId)
    .sort((a, b) => a.createdAt - b.createdAt);

  // Ensure we only render timestamps on the client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Delete this message?')) {
      deleteMessage(messageId);
    }
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--main-bg)' }}>
        <p style={{ color: 'var(--sidebar-text-muted)' }}>Channel not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
      {/* Channel Header */}
      <div className="border-b px-6 py-4 flex-shrink-0" style={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center">
          <h1 className="text-xl font-semibold flex items-center" style={{ color: 'var(--main-text)' }}>
            <span className="mr-2" style={{ color: 'var(--sidebar-text-muted)' }}>#</span>
            {channel.name}
          </h1>
          {channel.description && (
            <span className="mx-3" style={{ color: 'var(--sidebar-text-muted)' }}>|</span>
          )}
          {channel.description && (
            <p style={{ color: 'var(--sidebar-text-muted)' }}>{channel.description}</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {channelMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--main-text)' }}>
              Welcome to #{channel.name}!
            </h3>
            <p className="mb-4" style={{ color: 'var(--sidebar-text-muted)' }}>
              This is the beginning of the #{channel.name} channel.
            </p>
            <p className="text-sm" style={{ color: 'var(--sidebar-text-muted)' }}>
              Send a message to get the conversation started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {channelMessages.map((message, index) => {
              const prevMessage = channelMessages[index - 1];
              const showAuthor = !prevMessage || 
                prevMessage.author !== message.author || 
                message.createdAt - prevMessage.createdAt > 300000; // 5 minutes

              return (
                <div key={message.id} className="group px-4 py-2 -mx-4 rounded transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  {showAuthor ? (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {message.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-medium" style={{ color: 'var(--main-text)' }}>
                            {message.author}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--sidebar-text-muted)' }}>
                            {isClient ? formatTime(message.createdAt) : '...'}
                          </span>
                        </div>
                        <p className="mt-1 message-content" style={{ color: 'var(--main-text)' }}>
                          {message.content}
                        </p>
                      </div>
                      {message.author === state.currentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-sm"
                          style={{ color: 'var(--sidebar-text-muted)' }}
                          title="Delete message"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 flex-shrink-0 flex justify-center">
                        <span className="text-xs opacity-0 group-hover:opacity-100" style={{ color: 'var(--sidebar-text-muted)' }}>
                          {isClient ? formatTime(message.createdAt) : '...'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="message-content" style={{ color: 'var(--main-text)' }}>
                          {message.content}
                        </p>
                      </div>
                      {message.author === state.currentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-sm"
                          style={{ color: 'var(--sidebar-text-muted)' }}
                          title="Delete message"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}