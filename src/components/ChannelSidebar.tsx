'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ChannelSidebar() {
  const { state, createChannel, deleteChannel, toggleDarkMode } = useAppState();
  const router = useRouter();
  const params = useParams();
  const currentChannelId = params.channelId as string;
  
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only showing counts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      const channelId = createChannel(newChannelName.trim());
      setNewChannelName('');
      setShowNewChannelForm(false);
      router.push(`/${channelId}`);
    }
  };

  const handleDeleteChannel = (channelId: string) => {
    if (state.channels.length <= 1) {
      alert('Cannot delete the last channel');
      return;
    }
    
    if (confirm('Are you sure you want to delete this channel and all its notes?')) {
      deleteChannel(channelId);
      if (currentChannelId === channelId) {
        const remainingChannel = state.channels.find(c => c.id !== channelId);
        if (remainingChannel) {
          router.push(`/${remainingChannel.id}`);
        }
      }
    }
  };

  return (
    <div className="w-64 h-screen flex flex-col" style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Channel Notes</h1>
          <button
            onClick={toggleDarkMode}
            className="text-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--sidebar-text-muted)' }}
            title={state.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {state.darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--sidebar-text-muted)' }}>
              Channels
            </h2>
            <button
              onClick={() => setShowNewChannelForm(true)}
              className="text-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--sidebar-text-muted)' }}
              title="Create Channel"
            >
              +
            </button>
          </div>

          {/* New Channel Form */}
          {showNewChannelForm && (
            <form onSubmit={handleCreateChannel} className="mb-2">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="channel-name"
                className="w-full px-2 py-1 text-sm rounded border-none outline-none"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                autoFocus
                onBlur={() => {
                  if (!newChannelName.trim()) {
                    setShowNewChannelForm(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setNewChannelName('');
                    setShowNewChannelForm(false);
                  }
                }}
              />
            </form>
          )}

          {/* Channel List */}
          <div className="space-y-1">
            {state.channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center group px-2 py-1 rounded cursor-pointer transition-colors"
                style={{
                  backgroundColor: currentChannelId === channel.id ? 'var(--sidebar-active)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (currentChannelId !== channel.id) {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentChannelId !== channel.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span
                  onClick={() => router.push(`/${channel.id}`)}
                  className="flex-1 flex items-center transition-colors hover:opacity-80"
                  style={{ color: 'var(--sidebar-text)' }}
                >
                  <span className="mr-1" style={{ color: 'var(--sidebar-text-muted)' }}>#</span>
                  {channel.name}
                </span>
                {state.channels.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChannel(channel.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-sm ml-2 transition-colors hover:text-red-400"
                    style={{ color: 'var(--sidebar-text-muted)' }}
                    title="Delete Channel"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="text-xs" style={{ color: 'var(--sidebar-text-muted)' }}>
          {isClient ? `${state.messages.length} messages across ${state.channels.length} channels` : 'Loading...'}
        </div>
      </div>
    </div>
  );
}