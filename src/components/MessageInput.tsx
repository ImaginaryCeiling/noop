'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';

interface MessageInputProps {
  channelId: string;
}

export default function MessageInput({ channelId }: MessageInputProps) {
  const { state, sendMessage } = useAppState();
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

  // Find the channel name for the placeholder
  const channel = state.channels.find(c => c.id === channelId);
  const channelName = channel?.name || channelId;

  return (
    <div className="border-t px-6 py-4 flex-shrink-0" style={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--sidebar-border)' }}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName}`}
            className="w-full px-4 py-3 border rounded-lg resize-none message-input"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', borderColor: 'var(--input-border)', minHeight: '44px', maxHeight: '120px' }}
            rows={1}
          />
          <div className="absolute bottom-2 right-2 text-xs" style={{ color: 'var(--sidebar-text-muted)' }}>
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