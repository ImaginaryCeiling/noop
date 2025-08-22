'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';

interface NoteEditorProps {
  channelId: string;
  noteId: string;
}

export default function NoteEditor({ channelId, noteId }: NoteEditorProps) {
  const { state, updateNote, deleteNote } = useAppState();
  const router = useRouter();
  
  const channel = state.channels.find(c => c.id === channelId);
  const note = state.notes.find(n => n.id === noteId);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize form values when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLastSaved(note.updatedAt);
    }
  }, [note]);

  // Auto-save functionality
  useEffect(() => {
    if (!note) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Only save if there are changes
    if (title !== note.title || content !== note.content) {
      setIsSaving(true);
      
      saveTimeoutRef.current = setTimeout(() => {
        updateNote(noteId, { title, content });
        setIsSaving(false);
        setLastSaved(Date.now());
      }, 500); // 500ms debounce
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, note, noteId, updateNote]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      router.push(`/${channelId}`);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      contentRef.current?.focus();
    }
  };

  const forceSave = () => {
    if (note && (title !== note.title || content !== note.content)) {
      updateNote(noteId, { title, content });
      setLastSaved(Date.now());
    }
  };

  // Keyboard shortcuts
  useHotkeys([
    {
      key: 's',
      cmd: true,
      callback: forceSave,
    },
    {
      key: 's',
      ctrl: true,
      callback: forceSave,
    },
  ], [title, content, note, noteId]);

  const formatLastSaved = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return 'Saved just now';
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `Saved ${minutes}m ago`;
    } else {
      return `Saved at ${new Date(timestamp).toLocaleTimeString()}`;
    }
  };

  if (!channel || !note) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {!channel ? 'Channel not found' : 'Note not found'}
          </h1>
          <button
            onClick={() => router.push(channel ? `/${channelId}` : '/general')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {channel ? `Back to #${channel.name}` : 'Go to General'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/${channelId}`)}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              #{channel.name}
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : lastSaved ? (
                <span>{formatLastSaved(lastSaved)}</span>
              ) : null}
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto p-6 flex flex-col">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Note title..."
            className="text-3xl font-bold border-none outline-none mb-6 placeholder-gray-400 resize-none"
            style={{ fontFamily: 'inherit' }}
          />
          
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="flex-1 border-none outline-none resize-none text-gray-900 placeholder-gray-400 text-lg leading-relaxed"
            style={{ fontFamily: 'inherit' }}
          />
        </div>
      </div>
    </div>
  );
}