'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';

interface NoteListProps {
  channelId: string;
}

export default function NoteList({ channelId }: NoteListProps) {
  const { state, createNote, deleteNote } = useAppState();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const channel = state.channels.find(c => c.id === channelId);
  const channelNotes = state.notes
    .filter(n => n.channelId === channelId)
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return b.updatedAt - a.updatedAt;
        case 'created':
          return b.createdAt - a.createdAt;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleCreateNote = () => {
    const noteId = createNote(channelId);
    router.push(`/${channelId}/notes/${noteId}`);
  };

  // Keyboard shortcuts
  useHotkeys([
    {
      key: 'n',
      callback: handleCreateNote,
    },
    {
      key: 'j',
      callback: () => {
        if (channelNotes.length > 0) {
          setSelectedIndex(prev => Math.min(prev + 1, channelNotes.length - 1));
        }
      },
    },
    {
      key: 'k',
      callback: () => {
        if (channelNotes.length > 0) {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
      },
    },
    {
      key: 'Enter',
      callback: () => {
        if (channelNotes[selectedIndex]) {
          router.push(`/${channelId}/notes/${channelNotes[selectedIndex].id}`);
        }
      },
    },
  ], [channelId, channelNotes.length, selectedIndex]);

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (!channel) {
    return <div>Channel not found</div>;
  }

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-gray-500 mr-2">#</span>
              {channel.name}
            </h1>
            {channel.description && (
              <p className="text-gray-600 mt-1">{channel.description}</p>
            )}
          </div>
          <button
            onClick={handleCreateNote}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            New Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="p-6">
        {channelNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first note in #{channel.name} to get started!
            </p>
            <button
              onClick={handleCreateNote}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create First Note
            </button>
          </div>
        ) : (
          <>
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {channelNotes.length} {channelNotes.length === 1 ? 'note' : 'notes'}
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="updated">Last updated</option>
                <option value="created">Date created</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* Notes Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {channelNotes.map((note, index) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/${channelId}/notes/${note.id}`)}
                  className={`p-4 border rounded-lg hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group ${
                    selectedIndex === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                      title="Delete note"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {note.content && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {note.content.substring(0, 120)}...
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated {formatRelativeTime(note.updatedAt)}</span>
                    <span>{note.content.length} chars</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}