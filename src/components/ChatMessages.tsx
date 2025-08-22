'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useEffect, useRef } from 'react';

interface ChatMessagesProps {
  channelId: string;
}

export default function ChatMessages({ channelId }: ChatMessagesProps) {
  const { state, deleteMessage } = useAppState();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const channel = state.channels.find(c => c.id === channelId);
  const channelMessages = state.messages
    .filter(m => m.channelId === channelId)
    .sort((a, b) => a.createdAt - b.createdAt);

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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Channel Header */}
      <div className="border-b bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="text-gray-500 mr-2">#</span>
            {channel.name}
          </h1>
          {channel.description && (
            <span className="mx-3 text-gray-300">|</span>
          )}
          {channel.description && (
            <p className="text-gray-600">{channel.description}</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {channelMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to #{channel.name}!
            </h3>
            <p className="text-gray-500 mb-4">
              This is the beginning of the #{channel.name} channel.
            </p>
            <p className="text-gray-400 text-sm">
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
                <div key={message.id} className="group hover:bg-gray-50 px-4 py-2 -mx-4 rounded">
                  {showAuthor ? (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {message.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-medium text-gray-900">
                            {message.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800 mt-1 message-content">
                          {message.content}
                        </p>
                      </div>
                      {message.author === state.currentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-sm"
                          title="Delete message"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 flex-shrink-0 flex justify-center">
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 message-content">
                          {message.content}
                        </p>
                      </div>
                      {message.author === state.currentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-sm"
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