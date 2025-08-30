'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAppState } from '@/contexts/AppStateContext';
import { useEffect } from 'react';
import ChannelSidebar from '@/components/ChannelSidebar';
import ChatMessages from '@/components/ChatMessages';
import MessageInput from '@/components/MessageInput';

export default function ChannelPage() {
  const params = useParams();
  const { state, selectChannel } = useAppState();
  const router = useRouter();
  
  const channelId = params.channelId as string;
  const channel = state.channels.find(c => c.id === channelId);


  useEffect(() => {
    if (channel && state.activeChannelId !== channelId) {
      selectChannel(channelId);
    }
  }, [channelId, state.activeChannelId, selectChannel]);

  useEffect(() => {
    if (!channel && state.channels.length > 0) {
      // If channel doesn't exist, redirect to first available channel
      console.log('Channel not found, redirecting to first channel');
      router.replace(`/${state.channels[0].id}`);
    }
  }, [channel, state.channels, router]);

  if (!channel && state.channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--main-text)' }}>No channels available</h1>
          <p style={{ color: 'var(--sidebar-text-muted)' }}>Please create a channel to get started.</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4" style={{ color: 'var(--sidebar-text-muted)' }}>Loading channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <ChannelSidebar />
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
        <ChatMessages channelId={channelId} />
        <MessageInput channelId={channelId} />
      </div>
    </div>
  );
}