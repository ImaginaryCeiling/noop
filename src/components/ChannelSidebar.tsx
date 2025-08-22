'use client';

import { useAppState } from '@/contexts/AppStateContext';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function ChannelSidebar() {
  const { state, createChannel, deleteChannel } = useAppState();
  const router = useRouter();
  const params = useParams();
  const currentChannelId = params.channelId as string;
  
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

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
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-semibold">Channel Notes</h1>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Channels
            </h2>
            <button
              onClick={() => setShowNewChannelForm(true)}
              className="text-gray-400 hover:text-white text-lg"
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
                className="w-full bg-gray-700 text-black px-2 py-1 text-sm rounded border-none outline-none"
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
                className={`flex items-center group px-2 py-1 rounded hover:bg-gray-700 cursor-pointer ${
                  currentChannelId === channel.id ? 'bg-gray-700' : ''
                }`}
              >
                <span
                  onClick={() => router.push(`/${channel.id}`)}
                  className="flex-1 text-gray-300 hover:text-white flex items-center"
                >
                  <span className="text-gray-500 mr-1">#</span>
                  {channel.name}
                </span>
                {state.channels.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChannel(channel.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-sm ml-2"
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
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          {state.messages.length} messages across {state.channels.length} channels
        </div>
      </div>
    </div>
  );
}