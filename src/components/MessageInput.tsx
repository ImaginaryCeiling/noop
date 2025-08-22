'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';

interface MessageInputProps {
  channelId: string;
}

export default function MessageInput({ channelId }: MessageInputProps) {
  const { sendMessage } = useAppState();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (message.trim()) {
      sendMessage(channelId, message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Focus input when switching channels
  useEffect(() => {
    textareaRef.current?.focus();
  }, [channelId]);

  // Keyboard shortcuts - focus input
  useHotkeys([
    {
      key: '/',
      callback: () => textareaRef.current?.focus(),
    },
  ], []);

  return (
    <div className="border-t bg-white px-6 py-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelId}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none message-input text-black"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            rows={1}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-3 btn-discord rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}